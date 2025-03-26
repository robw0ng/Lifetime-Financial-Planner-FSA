const { Scenario, Investment, InvestmentType, EventSeries, IncomeEventSeries } = require("./models");
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Constants
const RMD_AGE = 74;
const EARLY_WITHDRAWAL_AGE = 59;
const SS_TAXABLE_PORTION = 0.85;

async function loadTaxBrackets(type = 'federal', state = null) {
    let filename;
    switch (type) {
        case 'federal':
            filename = 'output.yaml';
            break;
        case 'state':
            if (!state) return null;
            filename = `state_tax_brackets/${state}.yaml`;
            break;
        case 'capital_gains':
            filename = 'capital_gains_brackets.yaml';
            break;
        case 'standard_deduction':
            filename = 'standard_deductions.yaml';
            break;
        default:
            throw new Error(`Unknown tax bracket type: ${type}`);
    }

    try {
        const filePath = path.join(__dirname, filename);
        if (!fs.existsSync(filePath)) {
            if (type === 'state') return null; // State tax might not exist
            throw new Error(`Tax file not found: ${filename}`);
        }

        const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
        
        if (type === 'standard_deduction') {
            return data.map(deduction => ({
                filingStatus: deduction['Filing Status'],
                amount: deduction['Standard Deduction ($)'],
            }));
        }

        return data.map(bracket => ({
            rate: parseFloat(bracket['Tax Rate'].replace('%', '')) / 100,
            filingStatus: bracket['Filing Status'] || null,
            from: bracket['From ($)'],
            to: bracket['To ($)'] === null ? Infinity : bracket['To ($)']
        }));
    } catch (error) {
        console.error(`Error loading ${type} tax brackets:`, error);
        if (type === 'federal') throw error;
        return null;
    }
}

//assuming there is RMD table information
async function loadRMDTable() {
    try {
        const filePath = path.join(__dirname, 'rmd_table.yaml');
        if (fs.existsSync(filePath)) {
            return yaml.load(fs.readFileSync(filePath, 'utf8'));
        }
        throw new Error('RMD table not found');
    } catch (error) {
        console.error('Error loading RMD table:', error);
        throw error;
    }
}

async function simulateScenario(scenario) {
    const currentYear = new Date().getFullYear();
    const life_expectancy = scenario.life_expectancy_type === "fixed" ? scenario.life_expectancy_value : sampleNormal(scenario.life_expectancy_mean, scenario.life_expectancy_std_dev);
    const spouse_life_expectancy = scenario.is_married ?
        (scenario.spouse_life_expectancy_type === "fixed" ? scenario.spouse_life_expectancy_value : sampleNormal(scenario.spouse_life_expectancy_mean, scenario.spouse_life_expectancy_std_dev)) : 0;

    const userEndYear = currentYear + life_expectancy;
    const spouseEndYear = currentYear + spouse_life_expectancy;
    const endYear = Math.max(userEndYear, spouseEndYear);
    
    // Load tax brackets
    const federalTaxBrackets = await loadTaxBrackets('federal');
    const stateTaxBrackets = await loadTaxBrackets('state');
    const capitalGainsBrackets = await loadTaxBrackets('capital_gains');
    const standardDeductions = await loadTaxBrackets('standard_deduction');

    // Initialize state object
    const state = {
        currentTaxBrackets: {
            federal: federalTaxBrackets,
            state: stateTaxBrackets,
            capitalGains: capitalGainsBrackets,
            standardDeductions: standardDeductions
        },
        retirementLimits: scenario.after_tax_contribution_limit,
        curYearIncome: 0,
        curYearSS: 0,
        curYearEarlyWithdrawals: 0,
        curYearGains: 0,
        prevYearIncome: 0,
        prevYearSS: 0,
        prevYearEarlyWithdrawals: 0,
        prevYearGains: 0,
        events: [], // Store all event objects here
        investments: [], // Store all investment objects here
        is_married: scenario.is_married
    };

    // Initialize investments with purchase prices
    for (const investment of scenario.investments) {
        state.investments.push({
            ...investment,
            purchase_price: investment.value // Set initial purchase price
        });
    }

    // Get all events and store in state
    state.events = await EventSeries.findAll({
        where: {
            scenario_id: scenario.id
        }
    });

    // Get all investments and store in state
    state.investments = await Investment.findAll({
        where: {
            scenario_id: scenario.id
        },
        include: [InvestmentType]
    });

    //set a purchase_price field for each investment
    for (const investment of state.investments) {
        investment.purchase_price = investment.value;
    }

    // Calculate and store start years and durations for all events
    for (const event of state.events) {
        if (event.start_year_type !== 'fixed' && !event.start_year_value) {
            const startYear = await getEventStartYear(event, scenario, state.events);
            if (startYear) {
                event.start_year_value = startYear;
            }
        }
        
        if (event.duration_type !== 'fixed' && !event.duration_value) {
            const duration = await getEventDuration(event, scenario);
            event.duration_value = duration;
        }
    }

    for (let year = currentYear; year <= endYear; year++) {
        //check for mortality
        if (state.is_married && (year > userEndYear || year > spouseEndYear)) {
            state.is_married = false;

            //the percentages of income and expense transactions associated with the deceased spouse are omitted from transaction amounts for future years
            const incomeOrExpenseEvents = state.events.filter(event => event.type === 'income' || event.type === 'expense');
            for (const event of incomeOrExpenseEvents) {
                if (year > userEndYear) {
                    event.amount *= (1 - event.user_percentage);
                    event.user_percentage = 0;
                } else {
                    event.amount *= event.user_percentage;
                    event.user_percentage = 1;
                }
            }
        }
        // 1. Preliminaries
        //get the inflation assumption for the year
        const inflationRate = sampleInflationRate(scenario);
        
        // Use previous year's tax brackets and retirement limit to calculate next year's brackets and limit
        if (year != currentYear) {
            updateTaxBrackets(state, inflationRate);
            state.retirementLimits = Math.round(state.retirementLimits * (1 + inflationRate));
        }

        // 2. Process Income Events
        await processIncome(state, scenario, year, inflationRate);

        // 3. Process RMD
        await processRMD(state, scenario, year);

        // 4. Update Investment Values
        await processInvestmentUpdates(state, scenario);

        // 5. Process Roth Conversion
        await processRothConversion(state, scenario, year);

        // 6. Process Non-discretionary Expenses and Taxes
        await processNonDiscretionaryExpensesAndTax(state, scenario, year);

        // 7. Process Discretionary Expenses
        await processDiscretionaryExpenses(state, scenario, year);

        // 8. Process Investment Events
        await processInvestEvents(state, scenario, year);

        // 9. Process Rebalance Events
        await processRebalanceEvents(state, scenario, year);
    }
}

function updateTaxBrackets(state, inflationRate) {
    // Use previous year's tax brackets as base for calculations
    state.currentTaxBrackets.federal = state.currentTaxBrackets.federal.map(bracket => ({
        rate: bracket.rate,
        from: Math.round(bracket.from * (1 + inflationRate)),
        to: bracket.to === Infinity ? Infinity : Math.round(bracket.to * (1 + inflationRate))
    }));

    if (state.currentTaxBrackets.state) {
        state.currentTaxBrackets.state = state.currentTaxBrackets.state.map(bracket => ({
            rate: bracket.rate,
            from: Math.round(bracket.from * (1 + inflationRate)),
            to: bracket.to === Infinity ? Infinity : Math.round(bracket.to * (1 + inflationRate))
        }));
    }

    if (state.currentTaxBrackets.capitalGains) {
        state.currentTaxBrackets.capitalGains = state.currentTaxBrackets.capitalGains.map(bracket => ({
            rate: bracket.rate,
            from: Math.round(bracket.from * (1 + inflationRate)),
            to: bracket.to === Infinity ? Infinity : Math.round(bracket.to * (1 + inflationRate))
        }));
    }

    if (state.standardDeductions) {
        state.standardDeductions = state.standardDeductions.map(deduction => ({
            amount: Math.round(deduction.amount * (1 + inflationRate))
        }));
    }
}

async function getEventStartYear(event, scenario, allEvents) {
    switch (event.start_year_type) {
        case 'fixed':
            return event.start_year_value;
        case 'normal':
            return Math.round(sampleNormal(event.start_year_mean, event.start_year_std_dev));
        case 'uniform':
            return Math.round(sampleUniform(event.start_year_lower, event.start_year_upper));
        case 'with_event':
            const otherEvent = allEvents.find(e => e.name === event.start_year_other_event);
            return otherEvent ? await getEventStartYear(otherEvent, scenario, allEvents) : null;
        case 'after_event':
            const targetEvent = allEvents.find(e => e.name === event.start_year_other_event);
            if (!targetEvent) return null;
            const targetStart = await getEventStartYear(targetEvent, scenario, allEvents);
            const targetDuration = await getEventDuration(targetEvent, scenario);
            return targetStart + targetDuration;
        default:
            return null;
    }
}

async function getEventDuration(event) {
    switch (event.duration_type) {
        case 'fixed':
            return event.duration_value;
        case 'normal':
            return Math.max(0, Math.round(sampleNormal(event.duration_mean, event.duration_std_dev)));
        case 'uniform':
            return Math.round(sampleUniform(event.duration_lower, event.duration_upper));
        default:
            return 0;
    }
}

async function processIncome(state, scenario, year, inflationRate) {
    state.curYearIncome = 0;
    state.curYearSS = 0;

    // Filter income events from state.events
    const incomeEvents = state.events.filter(event => event.type === 'income');

    for (const event of incomeEvents) {
        // Skip if event hasn't started yet or has ended
        if (year < event.start_year_value || 
            (event.duration_value > 0 && year >= event.start_year_value + event.duration_value)) {
            continue;
        }

        if(!event.amount) {
            // initial amount
            event.amount = event.initial_amount;
        }

        // Apply expected annual change if any
        // if values > 1 then amount else percentage
        if (event.expected_change_type === 'fixed') {
            if (event.expected_change_value > 1 || event.expected_change_value < -1) {
                event.amount += event.expected_change_value;
            } else {
                event.amount *= (1 + event.expected_change_value);
            }
        } else if (event.expected_change_type === 'normal') {
            if (event.expected_change_mean > 1 || event.expected_change_mean < -1) {
                event.amount += sampleNormal(event.expected_change_mean, event.expected_change_std_dev);
            } else {
                event.amount *= (1 + sampleNormal(event.expected_change_mean, event.expected_change_std_dev));
            }
        }

        // Apply inflation adjustment if enabled
        if (event.is_inflation_adjusted) {
            event.amount *= (1 + inflationRate);
        }

        // Add to cash investment
        const cashInvestment = state.investments.find(inv => inv.investmentType === 'cash');
        
        if (cashInvestment) {
            cashInvestment.value += event.amount;
        }

        // Update running totals
        state.curYearIncome += event.amount;
        if (event.income_type === 'social_security') {
            state.curYearSS += event.amount;
        }
    }
}

async function processRMD(state, scenario, year) {
    const userAge = year - scenario.birth_year;
    
    // Check if RMD applies
    if (userAge < RMD_AGE) return;

    // Get all pre-tax investments
    const preTaxInvestments = state.investments.filter(inv => 
        inv.tax_status === 'pre-tax' && inv.value > 0
    );

    if (preTaxInvestments.length === 0) return;

    // Calculate total pre-tax value from previous year
    const totalPreTaxValue = preTaxInvestments.reduce((sum, inv) => sum + inv.value, 0);

    // Get distribution period from RMD table
    const rmdTable = await loadRMDTable();
    const distributionPeriod = rmdTable[userAge]

    // Calculate RMD amount
    const rmdAmount = totalPreTaxValue / distributionPeriod;
    state.curYearIncome += rmdAmount;
    
    // Get RMD strategy order from scenario
    const rmdStrategy = scenario.rmd_strategy

    for (const investmentId of rmdStrategy) {
        if (rmdAmount <= 0) break;

        const sourceInv = preTaxInvestments.find(inv => inv.id === investmentId);
        if (!sourceInv || sourceInv.value <= 0) continue;

        // Calculate transfer amount
        const transferAmount = Math.min(rmdAmount, sourceInv.value);
        rmdAmount -= transferAmount;

        // Reduce source investment value
        sourceInv.value -= transferAmount;

        // Find or create corresponding non-retirement investment
        let targetInv = state.investments.find(inv => 
            inv.investment_type_id === sourceInv.investment_type_id && 
            inv.tax_status === 'non-retirement'
        );

        if (targetInv) {
            targetInv.value += transferAmount;
        } else {
            // Create new non-retirement investment
            state.investments.push({
                ...sourceInv,
                id: `new_${sourceInv.id}`,
                tax_status: 'non-retirement',
                value: transferAmount
            });
        }
    }
}

async function processInvestmentUpdates(state, scenario) {
    for (const investment of state.investments) {
        if (investment.value <= 0) continue;

        const investmentType = scenario.investment_types.find(inv => inv.id === investment.investment_type_id);

        const startValue = investment.value;

        // Calculate generated income
        // if values > 1 then amount else percentage
        let generatedIncome = 0;
        switch (investmentType.expected_income_type) {
            case 'fixed':
                if (investmentType.expected_income_value > 1 || investmentType.expected_income_value < -1) {
                    generatedIncome = investmentType.expected_income_value;
                } else {
                    generatedIncome = startValue * investmentType.expected_income_value;
                }
                break;
            case 'normal':
                if (investmentType.expected_income_mean > 1 || investmentType.expected_income_mean < -1) {
                    generatedIncome = sampleNormal(
                        investmentType.expected_income_mean,
                        investmentType.expected_income_std_dev
                    );
                } else {
                    generatedIncome = startValue * (1 + sampleNormal(
                        investmentType.expected_income_mean,
                        investmentType.expected_income_std_dev
                    ));
                }
                break;
        }

        // Add to taxable income if applicable
        if (investment.tax_status === 'non-retirement' && investmentType.taxability === 'true') {
            state.curYearIncome += generatedIncome;
        }

        // Calculate value change
        // if values > 1 then amount else percentage
        let valueChange = 0;
        switch (investmentType.expected_change_type) {
            case 'fixed':
                if (investmentType.expected_change_value > 1 || investmentType.expected_change_value < -1) {
                valueChange = investmentType.expected_change_value;
                } else {
                    valueChange = investment.value * investmentType.expected_change_value;
                }
                break;
            case 'normal':
                if (investmentType.expected_change_mean > 1 || investmentType.expected_change_mean < -1) {
                    valueChange = sampleNormal(investmentType.expected_change_mean, investmentType.expected_change_std_dev);
                } else {
                valueChange = investment.value * sampleNormal(
                    investmentType.expected_change_mean,
                    investmentType.expected_change_std_dev
                );
            }
                break;
        }

        // Apply value change
        investment.value += valueChange;

        // Add generated income to investment value
        investment.value += generatedIncome;

        // Calculate and subtract expenses
        const avgValue = (startValue + investment.value) / 2;
        const expenses = avgValue * (investmentType.expense_ratio);
        investment.value -= expenses;
    }
}

async function processRothConversion(state, scenario, year) {
    if (!scenario.enable_roth_conversion) return;

    const userAge = year - scenario.birth_year;
    
    // Calculate federal taxable income
    const curYearFedTaxableIncome = state.curYearIncome - ((1-SS_TAXABLE_PORTION) * state.curYearSS);

    // Find current tax bracket and its upper limit
    let currentBracket = null;
    for (const bracket of state.currentTaxBrackets.federal) {
        if (curYearFedTaxableIncome >= bracket.from && curYearFedTaxableIncome < bracket.to) {
            currentBracket = bracket;
            break;
        }
    }

    if (!currentBracket) return;

    // Calculate optimal Roth conversion amount
    const rothConversionAmount = currentBracket.to - curYearFedTaxableIncome;
    if (rothConversionAmount <= 0) return;

    // Get pre-tax investments for conversion
    const preTaxInvestments = state.investments.filter(inv => 
        inv.tax_status === 'pre-tax' && inv.value > 0
    );

    // Process Roth conversion strategy
    let remainingConversion = rothConversionAmount;
    const rothStrategy = scenario.roth_conversion_strategy;

    for (const investmentId of rothStrategy) {
        if (remainingConversion <= 0) break;

        const sourceInv = preTaxInvestments.find(inv => inv.id === investmentId);
        if (!sourceInv || sourceInv.value <= 0) continue;

        // Calculate transfer amount
        const transferAmount = Math.min(remainingConversion, sourceInv.value);
        remainingConversion -= transferAmount;

        // Reduce source investment value
        sourceInv.value -= transferAmount;

        // Find or create corresponding after-tax retirement investment
        let targetInv = state.investments.find(inv => 
            inv.investment_type_id === sourceInv.investment_type_id && 
            inv.tax_status === 'after-tax'
        );

        if (targetInv) {
            targetInv.value += transferAmount;
        } else {
            // Create new after-tax retirement investment
            state.investments.push({
                ...sourceInv,
                id: `roth_${sourceInv.id}`,
                tax_status: 'after-tax',
                value: transferAmount
            });
        }
    }

    // Update income and early withdrawal totals
    state.curYearIncome += rothConversionAmount;
    
    // Add to early withdrawals if user is under 59
    if (userAge < EARLY_WITHDRAWAL_AGE) {
        state.curYearEarlyWithdrawals = (state.curYearEarlyWithdrawals || 0) + rothConversionAmount;
    }
}

async function processNonDiscretionaryExpensesAndTax(state, scenario, year) {
    const userAge = year - scenario.birth_year;

    // Calculate previous year's federal taxable income
    const prevYearFedTaxableIncome = state.prevYearIncome - ((1-SS_TAXABLE_PORTION) * state.prevYearSS);

    // Calculate federal income tax
    let federalIncomeTax = 0;
    let remainingIncome = prevYearFedTaxableIncome;
    remainingIncome -= state.standardDeductions[state.is_Married ? 'Married filing jointly or Qualifying surviving spouse' : 'Single or Married filing separately']
    
    for (const bracket of state.currentTaxBrackets.federal) {
        const incomeInBracket = Math.min(
            Math.max(0, remainingIncome - bracket.from),
            bracket.to - bracket.from
        );
        federalIncomeTax += incomeInBracket * bracket.rate;
        remainingIncome -= incomeInBracket;
        if (remainingIncome <= 0) break;
    }

    // Calculate state income tax if applicable
    let stateIncomeTax = 0;
    if (state.currentTaxBrackets.state) {
        remainingIncome = prevYearFedTaxableIncome;
        for (const bracket of state.currentTaxBrackets.state) {
            const incomeInBracket = Math.min(
                Math.max(0, remainingIncome - bracket.from),
                bracket.to - bracket.from
            );
            stateIncomeTax += incomeInBracket * bracket.rate;
            remainingIncome -= incomeInBracket;
            if (remainingIncome <= 0) break;
        }
    }

    // Calculate capital gains tax (simplified - using federal rate only)
    const capitalGainsTax = calculateCapitalGainsTax(state.prevYearGains, state.currentTaxBrackets.capitalGains, state.is_married);

    // Calculate early withdrawal penalty (10% of early withdrawals)
    const earlyWithdrawalTax = state.prevYearEarlyWithdrawals * 0.1;

    // Get non-discretionary expenses for current year
    const nonDiscExpenses = state.events
        .filter(event => event.type === 'expense' && !event.is_discretionary)
        .reduce((total, event) => {
            if (year < event.start_year_value || 
                (event.duration_value > 0 && year >= event.start_year_value + event.duration_value)) {
                return total;
            }

            // Calculate expense amount similar to income calculation
            if(!event.amount) {
                // initial amount
                event.amount = event.initial_amount;
            }
    
            //change the amount according to expected change
            if (event.expected_change_type === 'fixed') {
                if (event.expected_change_value > 1 || event.expected_change_value < -1) {
                    event.amount += event.expected_change_value;
                } else {
                    event.amount *= (1 + event.expected_change_value);
                }
            } else if (event.expected_change_type === 'normal') {
                if (event.expected_change_mean > 1 || event.expected_change_mean < -1) {
                    event.amount += sampleNormal(event.expected_change_mean, event.expected_change_std_dev);
                } else {
                    event.amount *= (1 + sampleNormal(event.expected_change_mean, event.expected_change_std_dev));
                }
            } else if (event.expected_change_type === 'uniform') {
                if (event.expected_change_mean > 1 || event.expected_change_mean < -1) {
                    event.amount += sampleUniform(event.expected_change_lower, event.expected_change_upper);
                } else {
                    event.amount *= (1 + sampleUniform(event.expected_change_lower, event.expected_change_upper));
                }
            }

            return total + event.amount;
        }, 0);

    // Calculate total payment needed
    const totalPayment = nonDiscExpenses + federalIncomeTax + stateIncomeTax + capitalGainsTax + earlyWithdrawalTax;

    // Find cash investment
    const cashInvestment = state.investments.find(inv => inv.investmentType === 'cash');
    if (!cashInvestment) return;

    // Calculate needed withdrawal amount
    const neededWithdrawal = Math.max(0, totalPayment - cashInvestment.value);
    cashInvestment.value -= Math.min(totalPayment, cashInvestment.value)

    // Process withdrawals if needed
    if (neededWithdrawal > 0) {
        let remainingWithdrawal = neededWithdrawal;
        
        for (const investmentId of scenario.expense_withdrawal_strategy) {
            if (remainingWithdrawal <= 0) break;

            const investment = state.investments.find(inv => inv.id === investmentId);
            if (!investment || investment.value <= 0) continue;

            // Calculate amount to sell
            const sellAmount = Math.min(remainingWithdrawal, investment.value);
            remainingWithdrawal -= sellAmount;

            // Calculate and track capital gains for non-pre-tax investments
            if (investment.tax_status !== 'pre-tax') {
                const sellFraction = sellAmount / investment.value;
                const capitalGain = sellFraction * (investment.value - (investment.purchase_price || 0));
                state.curYearGains += capitalGain;
                
                // Update cost basis
                investment.purchase_price *= (1 - sellFraction);
            }

            // Update income for pre-tax withdrawals
            if (investment.tax_status === 'pre-tax') {
                state.curYearIncome += sellAmount;
            }

            // Track early withdrawals if applicable
            if (userAge < EARLY_WITHDRAWAL_AGE && 
                (investment.tax_status === 'pre-tax' || investment.tax_status === 'after-tax')) {
                state.curYearEarlyWithdrawals += sellAmount;
            }

            // Update investment value
            investment.value -= sellAmount;
        }
    }

    // Pay from cash
    cashInvestment.value = Math.max(0, cashInvestment.value - totalPayment);

    // Store current year values for next year's tax calculation
    state.prevYearIncome = state.curYearIncome;
    state.prevYearSS = state.curYearSS;
    state.prevYearGains = state.curYearGains;
    state.prevYearEarlyWithdrawals = state.curYearEarlyWithdrawals;
}

function calculateCapitalGainsTax(gains, brackets, isMarried) {
    let tax = 0;
    let remainingGains = gains;

    // Sort brackets by 'from' value to ensure correct order
    const applicableBrackets = brackets
        .filter(bracket => {
            if (isMarried) {
                return bracket.filingStatus === "married filing jointly qualifying surviving spouse";
            } else {
                return bracket.filingStatus === "single" || 
                       bracket.filingStatus === "single married filing separately";
            }
        })
        .sort((a, b) => a.from - b.from);

    for (const bracket of applicableBrackets) {
        const gainsInBracket = Math.min(
            Math.max(0, remainingGains - bracket.from),
            bracket.to - bracket.from
        );
        tax += gainsInBracket * bracket.rate;
        remainingGains -= gainsInBracket;
        if (remainingGains <= 0) break;
    }
    return Math.max(0, tax); // Ensure non-negative tax
}

async function processDiscretionaryExpenses(state, scenario, year) {
    const userAge = year - scenario.birth_year;

    // Get discretionary expenses for current year and order by spending strategy
    const discExpenses = scenario.spending_strategy
        .map(expenseId => {
            const event = state.events.find(e => 
                e.id === expenseId && 
                e.type === 'expense' && 
                e.is_discretionary &&
                year >= e.start_year_value && 
                (!e.duration_value || year < e.start_year_value + e.duration_value)
            );
            
            if (!event) return null;

            if(!event.amount) {
                event.amount = event.initial_amount;
            }
            
            if (event.expected_change_type === 'fixed') {
                if (event.expected_change_value > 1 || event.expected_change_value < -1) {
                    event.amount += event.expected_change_value;
                } else {
                    event.amount *= (1 + event.expected_change_value);
                }
            } else if (event.expected_change_type === 'normal') {
                if (event.expected_change_mean > 1 || event.expected_change_mean < -1) {
                    event.amount += sampleNormal(event.expected_change_mean, event.expected_change_std_dev);
                } else {
                    event.amount *= (1 + sampleNormal(event.expected_change_mean, event.expected_change_std_dev));
                }
            } else if (event.expected_change_type === 'uniform') {
                if (event.expected_change_lower > 1 || event.expected_change_lower < -1) {
                    event.amount += sampleUniform(event.expected_change_lower, event.expected_change_upper);
                } else {
                    event.amount *= (1 + sampleUniform(event.expected_change_lower, event.expected_change_upper));
                }
            }


            // Apply inflation adjustment if needed
            if (event.inflation_adjusted) {
                event.amount *= (1 + sampleInflationRate(scenario));
            }
            
            return {
                event,
                amount: event.amount
            };
        })
        .filter(expense => expense !== null);

    // Find cash investment
    const cashInvestment = state.investments.find(inv => inv.investmentType === 'cash');
    if (!cashInvestment) return;

    // Calculate total assets
    const totalAssets = state.investments.reduce((sum, inv) => sum + inv.value, 0);
    
    // Calculate maximum amount we can spend while respecting financial goal
    const maxSpendable = Math.max(0, totalAssets - scenario.financial_goal);
    if (maxSpendable <= 0) return;

    // Process each discretionary expense in order of spending strategy
    for (const { event, amount } of discExpenses) {

        // Determine how much of the expense we can afford
        let affordableAmount = Math.min(amount, maxSpendable);

        // Try to pay from cash first
        const cashPayment = Math.min(affordableAmount, cashInvestment.value);
        cashInvestment.value -= cashPayment;
        affordableAmount -= cashPayment;

        // If we need more, withdraw from investments
        if (affordableAmount > 0) {
            await withdrawForExpense(state, scenario, affordableAmount, userAge);
        }

        // If we couldn't pay the full amount, stop processing expenses
        if (affordableAmount <= 0) {
            break;
        }
    }
}

async function withdrawForExpense(state, scenario, amount, userAge) {
    for (const investmentId of scenario.expense_withdrawal_strategy) {
        if (amount <= 0) break;

        const investment = state.investments.find(inv => inv.id === investmentId);
        if (!investment || investment.value <= 0) continue;

        // Calculate and perform withdrawal
        const sellAmount = Math.min(amount, investment.value);
        if (sellAmount <= 0) break;

        // Calculate and track capital gains for non-pre-tax investments
        if (investment.tax_status !== 'pre-tax') {
            const sellFraction = sellAmount / investment.value;
            const capitalGain = sellFraction * (investment.value - investment.purchase_price);
            state.curYearGains += capitalGain;
            
            // Update cost basis
            investment.purchase_price *= (1 - sellFraction);
        }

        // Update income for pre-tax withdrawals
        if (investment.tax_status === 'pre-tax') {
            state.curYearIncome += sellAmount;
        }

        // Track early withdrawals if applicable
        if (userAge < EARLY_WITHDRAWAL_AGE && 
            (investment.tax_status === 'pre-tax' || investment.tax_status === 'after-tax')) {
            state.curYearEarlyWithdrawals += sellAmount;
        }

        // Update investment value
        investment.value -= sellAmount;
        amount -= sellAmount;
    }
}

// Add helper function for calculating glide path allocations
function calculateGlidePathAllocations(event, year) {
    // If glide path is not enabled, use fixed asset allocation
    if (!event.is_glide_path) {
        return event.asset_allocation;
    }

    const startYear = event.start_year_value;
    const endYear = event.start_year_value + (event.duration_value || 0);
    
    // Calculate interpolation factor (0 to 1)
    const progress = (year - startYear) / (endYear - startYear);

    // Interpolate between start and end allocations
    const result = {};
for (const [investmentId, startPct] of Object.entries(event.asset_allocation)) {
    const endPct = event.asset_allocation2[investmentId] || 0;
    result[investmentId] = startPct + (endPct - startPct) * progress;
}

    return result;
}

async function processInvestEvents(state, scenario, year) {
    // Find cash investment
    const cashInvestment = state.investments.find(inv => inv.investmentType === 'cash');
    if (!cashInvestment) return;

    // Get invest events for current year
    const investEvents = state.events.filter(event => 
        event.type === 'invest' &&
        year >= event.start_year_value &&
        (!event.duration_value || year < event.start_year_value + event.duration_value)
    );

    //there should only be 1 invest event for a given year
    for (const event of investEvents) {
        // Calculate excess cash above max_cash threshold
        const maxCash = event.max_cash || 0;
        const excessCash = Math.max(0, cashInvestment.value - maxCash);
        if (excessCash <= 0) break;

        // Calculate inflation-adjusted contribution limit
        const baseLimit = state.retirementLimits || 0;
        const inflationRate = sampleInflationRate(scenario);
        const inflationAdjustedLimit = baseLimit * Math.pow(1 + inflationRate, year - event.start_year_value);

        // Get current allocations based on glide path (defaults to fixed if not enabled)
        const currentAllocations = calculateGlidePathAllocations(event, year);

        // Group investments by tax status
        const investmentsByTaxStatus = {
            'after-tax': [],
            'other': []
        };

        Object.entries(currentAllocations).forEach(([investmentId, percentage]) => {
            const investment = state.investments.find(inv => inv.id === investmentId);
            if (!investment) return;
            if (investment.tax_status === 'after-tax') {
                investmentsByTaxStatus['after-tax'].push({ investment, allocation: percentage });
            } else {
                investmentsByTaxStatus['other'].push({ investment, allocation: percentage });
            }
        });

        // Calculate initial amounts for all investments
        const initialPurchases = new Map();
        let afterTaxTotal = 0;
        let nonRetirementTotal = 0;

        // Calculate after-tax investment amounts
        investmentsByTaxStatus['after-tax'].forEach(({ investment, allocation }) => {
            const amount = (excessCash * allocation);
            initialPurchases.set(investment.id, amount);
            afterTaxTotal += amount;
        });

        // Calculate non-retirement investment amounts
        investmentsByTaxStatus['other'].forEach(({ investment, allocation }) => {
            const amount = (excessCash * allocation);
            initialPurchases.set(investment.id, amount);
            nonRetirementTotal += amount;
        });

        // Adjust if after-tax total exceeds limit
        const finalPurchases = new Map();
        if (afterTaxTotal > inflationAdjustedLimit) {
            const scaleDown = inflationAdjustedLimit / afterTaxTotal;
            const excessAmount = afterTaxTotal - inflationAdjustedLimit;
            
            // Scale down after-tax investments
            investmentsByTaxStatus['after-tax'].forEach(({ investment }) => {
                const amount = initialPurchases.get(investment.id) * scaleDown;
                finalPurchases.set(investment.id, amount);
            });

            // Scale up non-retirement investments proportionally
            if (nonRetirementTotal > 0) {
                //scale up by recalculating non-retirement investments with an extra excessAmount
                investmentsByTaxStatus['other'].forEach(({ investment, allocation }) => {
                    const amount = ((excessAmount + excessCash) * allocation);
                    finalPurchases.set(investment.id, amount);
                });
            }
        } else {
            // No scaling needed, use initial amounts
            initialPurchases.forEach((amount, id) => {
                finalPurchases.set(id, amount);
            });
        }

        // Execute purchases
        for (const [investmentId, amount] of finalPurchases) {
            const investment = state.investments.find(inv => inv.id === investmentId);
            if (!investment || amount <= 0) continue;

            investment.value += amount;
            if (!investment.purchase_price) {
                investment.purchase_price = amount;
            } else {
                // Update cost basis
                investment.purchase_price = investment.purchase_price + amount;
            }
        }

        // Deduct total from cash
        cashInvestment.value -= excessCash;
    }
}

async function processRebalanceEvents(state, scenario, year) {
    // Get rebalance events for current year
    const rebalanceEvents = state.events.filter(event => 
        event.type === 'rebalance' &&
        year >= event.start_year_value &&
        (!event.duration_value || year < event.start_year_value + event.duration_value)
    );

    for (const event of rebalanceEvents) {
        // Get current allocations based on glide path (defaults to fixed if not enabled)
        const currentAllocations = calculateGlidePathAllocations(event, year);

        // Calculate total portfolio value for investments in this rebalance
        let totalValue = 0;
        const currentInvestments = new Map();

        Object.entries(currentAllocations).forEach(([investmentId, percentage]) => {
            const investment = state.investments.find(inv => inv.id === investmentId);
            if (!investment) return;
            currentInvestments.set(investment.id, investment);
            totalValue += investment.value;
        });

        if (totalValue <= 0) continue;

        // Calculate target values and needed adjustments
        const adjustments = new Map();
        Object.entries(currentAllocations).forEach(([investmentId, percentage]) => {
            const investment = currentInvestments.get(investmentId);
            if (!investment) return;
            const targetValue = (totalValue * percentage);
            const adjustment = targetValue - investment.value;
            adjustments.set(investment.id, adjustment);
        });

        // Process sales first (negative adjustments)
        const cashInvestment = state.investments.find(inv => inv.investmentType === 'cash');
        if (!cashInvestment) continue;

        for (const [investmentId, adjustment] of adjustments) {
            if (adjustment >= 0) continue;
            
            const investment = currentInvestments.get(investmentId);
            const sellAmount = -adjustment;

            // Calculate capital gains for non-retirement investments
            if (investment.tax_status === 'non-retirement') {
                const sellFraction = sellAmount / investment.value;
                const capitalGain = sellFraction * (investment.value - investment.purchase_price);
                state.curYearGains += capitalGain;
                
                // Update cost basis
                investment.purchase_price *= (1 - sellFraction);
            }

            // Execute sale
            investment.value -= sellAmount;
            cashInvestment.value += sellAmount;
        }

        // Process purchases second (positive adjustments)
        for (const [investmentId, adjustment] of adjustments) {
            if (adjustment <= 0) continue;

            const investment = currentInvestments.get(investmentId);
            const buyAmount = Math.min(adjustment, cashInvestment.value);
            if (buyAmount <= 0) continue;

            // Execute purchase
            investment.value += buyAmount;
            if (!investment.purchase_price) {
                investment.purchase_price = buyAmount;
            } else {
                investment.purchase_price += buyAmount;
            }
            cashInvestment.value -= buyAmount;
        }
    }
}

// Helper functions for sampling from probability distributions
function sampleInflationRate(scenario) {
    switch (scenario.inflation_assumption_type) {
        case "fixed":
            return scenario.inflation_assumption_value;
        case "normal":
            return sampleNormal(
                scenario.inflation_assumption_mean,
                scenario.inflation_assumption_std_dev
            );
        case "uniform":
            return sampleUniform(
                scenario.inflation_assumption_lower,
                scenario.inflation_assumption_upper
            );
    }
}

function sampleNormal(mean, stdDev) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + stdDev * z;
}

function sampleUniform(lower, upper) {
    return lower + Math.random() * (upper - lower);
}

// Export the simulation function
module.exports = {
    simulateScenario
};
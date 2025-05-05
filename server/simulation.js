const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

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
            filename = `${state.toUpperCase()}_tax_brackets.yaml`;
            break;
        case 'capital_gains':
            filename = 'capital_gains_rates.yaml';
            break;
        case 'standard_deduction':
            filename = 'standard_deductions.yaml';
            break;
        default:
            throw new Error(`Unknown tax bracket type: ${type}`);
    }

    try {
        //file is 1 level up from server directory
        const filePath = path.join(__dirname, "scrapers", filename);
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

        if (type === 'state') {
            return data.map(bracket => ({
                rate: bracket['additional_rate'] !== null ? bracket['additional_rate'] : 0,
                filingStatus: bracket['filing_status'],
                from: bracket['excess_over'],
                to: bracket.range[1] === null ? Infinity : bracket.range[1],
                baseTax: bracket['base_tax']
            }));
        }

        if (type === 'federal') {
            return data.map(bracket => ({
                rate: parseFloat(bracket['Tax Rate'].replace('%', '')) / 100,
                from: bracket['From ($)'],
                to: bracket['To ($)'] === null ? Infinity : bracket['To ($)']
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

const execPromise = util.promisify(exec);

async function loadRMDTable() {
    try {
        const scriptPath = path.join(__dirname, 'scrapers', 'scrapeIRS.py');
        const filePath = path.join(__dirname, 'scrapers', 'uniform_lifetime_table.yaml');
        
        // Execute the Python script to scrape RMD tables
        console.log('Running scrapeIRS.py...');
        await execPromise(`python ${scriptPath}`);

        // Ensure the file exists after scraping
        if (!fs.existsSync(filePath)) {
            throw new Error('RMD table not found after scraping.');
        }

        const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
        
        // Convert to map for faster lookup, skip header row
        const rmdTable = new Map();
        data.Uniform_Lifetime_Table.forEach(entry => {
            if (entry.age !== 'Age') {  // Skip header row
                rmdTable.set(parseInt(entry.age), parseFloat(entry.distribution_period));
            }
        });
        return rmdTable;
    } catch (error) {
        console.error('Error loading RMD table:', error);
        throw error;
    }
}

async function simulateScenario(scenario) {
    console.log('\n=== Starting Financial Simulation ===');
    console.log(`Scenario: ${scenario.name}`);
    const currentYear = new Date().getFullYear();
    const life_expectancy = scenario.life_expectancy_type === "fixed" ? scenario.life_expectancy_value : sampleNormal(scenario.life_expectancy_mean, scenario.life_expectancy_std_dev);
    const spouse_life_expectancy = scenario.is_married ?
        (scenario.spouse_life_expectancy_type === "fixed" ? scenario.spouse_life_expectancy_value : sampleNormal(scenario.spouse_life_expectancy_mean, scenario.spouse_life_expectancy_std_dev)) : 0;

    const userEndYear = scenario.birth_year + life_expectancy;
    const spouseEndYear = scenario.spouse_birth_year + Math.round(spouse_life_expectancy);
    // end year is userEndYear now instead of max of user and spouse
    const endYear = userEndYear;
    
    // Load tax brackets
    console.log('\nLoading tax information...');
    const federalTaxBrackets = await loadTaxBrackets('federal');
    const stateTaxBrackets = await loadTaxBrackets('state', scenario.state_of_residence);
    const capitalGainsBrackets = await loadTaxBrackets('capital_gains');
    const standardDeductions = await loadTaxBrackets('standard_deduction');
    console.log('Tax information loaded successfully');

    // Initialize state object
    console.log('\nInitializing simulation state...');
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
        events: [],
        investments: [],
        investmentTypes: [],
        is_married: scenario.is_married,
        inflationRate: 0,
    };
    
    // Get all investments, eventseries, investmenttypes and store in state
    console.log('\nLoading scenario data into state...');
    //store only essential dataValues
    for (const investment of scenario.Investments) {
        state.investments.push({
            ...investment.dataValues,
            purchase_price: investment.dataValues.value // Set initial purchase price
        });
    }

    for (const investmenttype of scenario.InvestmentTypes) {
        state.investmentTypes.push({
            ...investmenttype.dataValues
        })
    }

    for (const eventseries of scenario.EventSeries) {
        // Extract the main event series data
        let eventData = { ...eventseries.dataValues };

        // Remove all event series references
        delete eventData.IncomeEventSeries;
        delete eventData.ExpenseEventSeries;
        delete eventData.InvestEventSeries;
        delete eventData.RebalanceEventSeries;

        console.log(eventseries)

        // Determine the specific event type and add only its dataValues
        if (eventseries.IncomeEventSeries) {
            console.log(eventseries.dataValues.IncomeEventSeries)
            Object.assign(eventData, eventseries.dataValues.IncomeEventSeries.dataValues);
        } else if (eventseries.ExpenseEventSeries) {
            Object.assign(eventData, eventseries.dataValues.ExpenseEventSeries.dataValues);
        } else if (eventseries.InvestEventSeries) {
            Object.assign(eventData, eventseries.dataValues.InvestEventSeries.dataValues);
        } else if (eventseries.RebalanceEventSeries) {
            Object.assign(eventData, eventseries.dataValues.RebalanceEventSeries.dataValues);
        }

        // Push cleaned-up event data
        state.events.push(eventData);
    }

    console.log('Calculating event start years and durations...');
    // Calculate and store start years and durations for all events
    for (const event of state.events) {
        if (event.start_year_type !== 'fixed' && !event.start_year_value) {
            const startYear = await getEventStartYear(event, state.events);
            if (startYear) {
                event.start_year_value = startYear;
            }
        }
        
        if (event.duration_type !== 'fixed' && !event.duration_value) {
            const duration = await getEventDuration(event);
            event.duration_value = duration;
        }
    }

    console.log("Initial Investments")
    console.log(state.investments)

    // return value of simulation (to be used for chart generating)
    // an array containing objects representing the data for each year
    const returnData = []

    //need to change back to endYear***
    for (let year = currentYear; year < endYear; year++) {
        // sample object to add to returnData each year
        const yearData = {
            year: year,
            investments: [],
            eventSeries: [],
            totalIncome: 0,
            totalExpenses: 0,
            federalTax: 0,
            stateTax: 0,
            capitalGainsTax: 0,
            earlyWithdrawalTax: 0,
            discretionaryExpensesPaidPercentage: 0
        }

        console.log(`\n=== Processing Year ${year} ===`);
        
        //check for mortality of spouse only
        if (state.is_married && year >= spouseEndYear) {
            console.log(`Spouse passed away in year ${year}`);
            state.is_married = false;

            //the percentages of income and expense transactions associated with the deceased spouse are omitted from transaction amounts for future years
            const incomeOrExpenseEvents = state.events.filter(event => event.type === 'income' || event.type === 'expense');
            
            console.log("Income and expense events before death.")
            console.log(incomeOrExpenseEvents)
            
            for (const event of incomeOrExpenseEvents) {
                if (!event.amount) {
                    event.amount = event.initial_amount;
                }
                event.amount *= event.user_percentage;
                event.user_percentage = 1;
            }
            console.log("Income and expense events after death.")
            console.log(incomeOrExpenseEvents)
        }
        // 1. Preliminaries
        //get the inflation assumption for the year
        state.inflationRate = sampleInflationRate(scenario);
        
        // Use previous year's tax brackets and retirement limit to calculate next year's brackets and limit
        if (year != currentYear) {
            updateTaxBrackets(state, state.inflationRate);
            state.retirementLimits = Math.round(state.retirementLimits * (1 + state.inflationRate) * 100) / 100;

            // Also calculate adflation adjustment for all income/expense events
            const event = state.events.filter(event => event.type === 'income' || event.type === 'expense');
            if (event.inflation_adjusted) {
                event.amount *= (1 + state.inflationRate);
            }
        }
        
        //reset curr year values
        state.curYearIncome = 0;
        state.curYearSS = 0;
        state.curYearGains = 0;
        state.curYearEarlyWithdrawals = 0;

        // 2. Process Income Events
        await processIncome(state, year);

        // 3. Process RMD
        await processRMD(state, scenario, year);

        // 4. Update Investment Values
        await processInvestmentUpdates(state);

        // 5. Process Roth Conversion
        if (scenario.is_roth_optimizer_enabled && year >= scenario.roth_start_year && year <= scenario.roth_end_year) {
            await processRothConversion(state, scenario, year);
        }

        // 6. Process Non-discretionary Expenses and Taxes
        await processNonDiscretionaryExpensesAndTax(state, scenario, year, currentYear, yearData, returnData);

        // 7. Process Discretionary Expenses
        await processDiscretionaryExpenses(state, scenario, year, yearData);

        // 8. Process Investment Events
        await processInvestEvents(state, year);

        // 9. Process Rebalance Events
        await processRebalanceEvents(state, year);

        //round all investment and eventseries values to nearest cent
        for (const investment of state.investments) {
            investment.value = Math.round(investment.value * 100) / 100;
            investment.purchase_price = Math.round(investment.purchase_price * 100) / 100;
        }
        for (const event of state.events) {
            if (event.amount) {
                event.amount = Math.round(event.amount * 100) / 100;
            }
        }
        state.curYearIncome = Math.round(state.curYearIncome * 100) / 100
        state.curYearSS = Math.round(state.curYearSS * 100) / 100
        state.curYearGains = Math.round(state.curYearGains * 100) / 100
        state.curYearEarlyWithdrawals = Math.round(state.curYearEarlyWithdrawals * 100) / 100

        //set some values for yearData
        yearData.investments = state.investments
        yearData.eventSeries = state.events
        yearData.totalIncome = state.curYearIncome

        //push to return data
        returnData.push(yearData)

        console.log(yearData)

        // Store current year values for next year's tax calculation
        state.prevYearIncome = state.curYearIncome;
        state.prevYearSS = state.curYearSS;
        state.prevYearGains = state.curYearGains;
        state.prevYearEarlyWithdrawals = state.curYearEarlyWithdrawals;

    }
    return returnData
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
            filingStatus: bracket.filingStatus,
            baseTax: bracket.baseTax,
            from: Math.round(bracket.from * (1 + inflationRate)),
            to: bracket.to === Infinity ? Infinity : Math.round(bracket.to * (1 + inflationRate))
        }));
    }

    if (state.currentTaxBrackets.capitalGains) {
        state.currentTaxBrackets.capitalGains = state.currentTaxBrackets.capitalGains.map(bracket => ({
            rate: bracket.rate,
            filingStatus: bracket.filingStatus,
            from: Math.round(bracket.from * (1 + inflationRate)),
            to: bracket.to === Infinity ? Infinity : Math.round(bracket.to * (1 + inflationRate))
        }));
    }

    if (state.currentTaxBrackets.standardDeductions) {
        state.currentTaxBrackets.standardDeductions = state.currentTaxBrackets.standardDeductions.map(deduction => ({
            filingStatus: deduction.filingStatus,
            amount: Math.round(deduction.amount * (1 + inflationRate))
        }));
    }
}

async function getEventStartYear(event, allEvents) {
    switch (event.start_year_type) {
        case 'fixed':
            return event.start_year_value;
        case 'normal':
            return Math.round(sampleNormal(event.start_year_mean, event.start_year_std_dev));
        case 'uniform':
            return Math.round(sampleUniform(event.start_year_lower, event.start_year_upper));
        case 'with_event':
            const otherEvent = allEvents.find(e => e.name === event.start_year_other_event);
            return otherEvent ? await getEventStartYear(otherEvent, allEvents) : null;
        case 'after_event':
            const targetEvent = allEvents.find(e => e.name === event.start_year_other_event);
            if (!targetEvent) return null;
            const targetStart = await getEventStartYear(targetEvent, allEvents);
            const targetDuration = await getEventDuration(targetEvent);
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

async function processIncome(state, year) {
    console.log('\nProcessing income events...');

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

        // Add to cash investment
        const cashInvestment = state.investments.find(inv => inv.special_id === 'cash');
        
        if (cashInvestment) {
            cashInvestment.value += event.amount;
        }

        // Update running totals
        state.curYearIncome += event.amount;
        if (event.income_type === 'social_security') {
            state.curYearSS += event.amount;
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
        } else if (event.expected_change_type === 'uniform') {
            if (event.expected_change_lower > 1 || event.expected_change_lower < -1) {
                event.amount += sampleUniform(event.expected_change_lower, event.expected_change_upper);
            } else {
                event.amount *= (1 + sampleUniform(event.expected_change_lower, event.expected_change_upper));
            }
        }
    }
    
}

async function processRMD(state, scenario, year) {
    console.log('\nChecking Required Minimum Distributions (RMD)...');
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
    //first RMD for year of user age 73 paid in age 74. always pay previous year's RMD
    const RMDtable = await loadRMDTable();
    const distributionPeriod = RMDtable.get(userAge-1)
    console.log("scrape and fetch RMD table")

    // Calculate RMD amount
    let rmdAmount = Math.round(totalPreTaxValue / distributionPeriod * 100) / 100;
    state.curYearIncome += rmdAmount;
    
    // Get RMD strategy order from scenario
    const rmdStrategy = scenario.rmd_strategy

    for (const investmentId of rmdStrategy) {
        if (rmdAmount <= 0) break;

        const sourceInv = preTaxInvestments.find(inv => inv.special_id === investmentId);
        if (!sourceInv || sourceInv.value <= 0) continue;

        // Calculate transfer amount
        const transferAmount = Math.min(rmdAmount, sourceInv.value);
        rmdAmount -= transferAmount;

        // Reduce source investment value and purchase price
        const original_price_transfer_amt = sourceInv.purchase_price * transferAmount / sourceInv.value;
        sourceInv.value -= transferAmount;
        sourceInv.purchase_price -= original_price_transfer_amt;

        // Find or create corresponding non-retirement investment
        let targetInv = state.investments.find(inv => 
            inv.investment_type_id === sourceInv.investment_type_id && 
            inv.tax_status === 'non-retirement'
        );

        //increase target investment value and purchase price
        if (targetInv) {
            targetInv.value += transferAmount;
            targetInv.purchase_price += original_price_transfer_amt;
        } else {
            // Create new non-retirement investment
            state.investments.push({
                id: state.investments[state.investments.length - 1]?.id + 1 || 1,
                special_id: sourceInv.special_id.replace('pre-tax', 'non-retirement'),  // Replace 'pre-tax' with 'after-tax'
                value: transferAmount,
                tax_status: 'non-retirement',
                investment_type_id: sourceInv.investment_type_id,
                scenario_id: sourceInv.scenario_id,
                purchase_price: original_price_transfer_amt
            });
        }
        
        // add to income
        state.curYearIncome += transferAmount
    }
}

async function processInvestmentUpdates(state) {
    console.log('\nUpdating investment values...');
    for (const investment of state.investments) {
        if (investment.value <= 0) continue;

        const investmentType = state.investmentTypes.find(inv => inv.id === investment.investment_type_id);

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
                    generatedIncome = startValue * sampleNormal(
                        investmentType.expected_income_mean,
                        investmentType.expected_income_std_dev
                    );
                }
                break;
        }

        // Add to taxable income if applicable
        // (certain non-retirements are not taxable, after-tax is always not taxable, pre-tax is taxed on withdrawal)
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
    console.log('\nProcessing Roth conversions...');

    const userAge = year - scenario.birth_year;
    
    // Calculate federal taxable income
    let curYearFedTaxableIncome = state.curYearIncome - ((1-SS_TAXABLE_PORTION) * state.curYearSS);

    // Round to 2 decimal places
    curYearFedTaxableIncome = Math.round(curYearFedTaxableIncome * 100) / 100;

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

        const sourceInv = preTaxInvestments.find(inv => inv.special_id === investmentId);
        if (!sourceInv || sourceInv.value <= 0) continue;

        // Calculate transfer amount
        const transferAmount = Math.min(remainingConversion, sourceInv.value);
        remainingConversion -= transferAmount;

        // Reduce source investment value and purchase price
        const original_price_transfer_amt = sourceInv.purchase_price * transferAmount / sourceInv.value;
        sourceInv.purchase_price -= original_price_transfer_amt;
        sourceInv.value -= transferAmount;

        // Find or create corresponding after-tax retirement investment
        let targetInv = state.investments.find(inv => 
            inv.investment_type_id === sourceInv.investment_type_id && 
            inv.tax_status === 'after-tax'
        );

        if (targetInv) {
            targetInv.purchase_price += original_price_transfer_amt;
            targetInv.value += transferAmount;
        } else {
            // Create new after-tax retirement investment
            state.investments.push({
                id: state.investments[state.investments.length - 1]?.id + 1 || 1,
                special_id: sourceInv.special_id.replace('pre-tax', 'after-tax'),  // Replace 'pre-tax' with 'after-tax'
                value: transferAmount,
                tax_status: 'after-tax',
                investment_type_id: sourceInv.investment_type_id,
                scenario_id: sourceInv.scenario_id,
                purchase_price: original_price_transfer_amt
            });
        }
    }

    // Update income only (early withdrawal not applicable for roth conversions)
    state.curYearIncome += rothConversionAmount;
}

async function processNonDiscretionaryExpensesAndTax(state, scenario, year, startYear, yearData, returnData) {
    console.log('\nProcessing non-discretionary expenses and taxes...');
    const userAge = year - scenario.birth_year;

    let totalTax = 0;

    //no tax before start year
    if (year > startYear) {
        // Calculate previous year's federal taxable income
        const prevYearTaxableIncome = state.prevYearIncome - ((1-SS_TAXABLE_PORTION) * state.prevYearSS);
        // Calculate federal income tax
        let federalIncomeTax = 0;
        let remainingIncome = prevYearTaxableIncome;
        let deduction;
        for (const bracket of state.currentTaxBrackets.standardDeductions) {
            if (state.is_Married && bracket.filingStatus === 'Married filing jointly or Qualifying surviving spouse') {
                deduction = bracket.amount;
                break;
            } else if (!state.is_Married && bracket.filingStatus === 'Single or Married filing separately') {
                deduction = bracket.amount;
                break;
            }
        }
        let federalTaxableIncome = remainingIncome - deduction;
        
        for (const bracket of state.currentTaxBrackets.federal) {
            const incomeInBracket = Math.min(
                Math.max(0, federalTaxableIncome - bracket.from),
                bracket.to - bracket.from
            );
            if (incomeInBracket <= 0) break;
            federalIncomeTax += incomeInBracket * bracket.rate;
            if (federalTaxableIncome <= 0) break;
        }

        // Calculate state income tax if applicable
        let stateTax = 0;
        if (state.currentTaxBrackets.state) {
            const filingStatus = state.is_married ? 'Married filing jointly and qualifying' : 'Single and married filing separately';
            
            // Find the applicable tax bracket based on income and filing status
            const applicableBracket = state.currentTaxBrackets.state.find(bracket => 
                bracket.filingStatus === filingStatus && 
                remainingIncome > bracket.from &&
                (bracket.to === Infinity || remainingIncome <= bracket.to)
            );      

            if (applicableBracket) {
                // Calculate state tax using base tax plus additional rate on excess
                stateTax = applicableBracket.baseTax + 
                        (remainingIncome - applicableBracket.from) * applicableBracket.rate;
            }
        }

        // Calculate capital gains tax (simplified - using federal rate only)
        const capitalGainsTax = calculateCapitalGainsTax(state.prevYearGains, state.currentTaxBrackets.capitalGains, state.is_married);

        // Calculate early withdrawal penalty (10% of early withdrawals)
        const earlyWithdrawalTax = state.prevYearEarlyWithdrawals * 0.1;

        //add taxes to year data
        yearData.federalTax = Math.round(federalIncomeTax * 100) / 100
        yearData.stateTax = Math.round(stateTax * 100) / 100
        yearData.capitalGainsTax = Math.round(capitalGainsTax * 100) / 100
        yearData.earlyWithdrawalTax = Math.round(earlyWithdrawalTax * 100) / 100

        totalTax += federalIncomeTax + stateTax + capitalGainsTax + earlyWithdrawalTax;
    }

    // Get non-discretionary expenses for current year

    //get the non-discretionary expenses for the current year and calculate the sum of amounts
    const nonDiscExpenses = state.events
    .filter(event => event.type === 'expense' && !event.is_discretionary)
    .filter(event => year >= event.start_year_value && 
                    (event.duration_value <= 0 || year < event.start_year_value + event.duration_value))
    .map(event => {
        // Initialize the amount if it doesn't exist
        if (!event.amount) {
            event.amount = event.initial_amount;
        }
        return event;
    });

    const sumOfNonDiscExpenses = nonDiscExpenses.reduce((total, event) => total + event.amount, 0);

    // Loop through the expenses to apply the expected changes
    nonDiscExpenses.forEach(event => {
        // Apply expected change to the amount based on the change type
        if (event.expected_change_type === 'fixed') {
            if (event.expected_change_value > 1 || event.expected_change_value < -1) {
                event.amount += event.expected_change_value;  // Fixed absolute change
            } else {
                event.amount *= (1 + event.expected_change_value);  // Percentage change
            }
        } else if (event.expected_change_type === 'normal') {
            if (event.expected_change_mean > 1 || event.expected_change_mean < -1) {
                event.amount += sampleNormal(event.expected_change_mean, event.expected_change_std_dev);  // Add normal-distributed change
            } else {
                event.amount *= (1 + sampleNormal(event.expected_change_mean, event.expected_change_std_dev));  // Percentage change using normal distribution
            }
        } else if (event.expected_change_type === 'uniform') {
            if (event.expected_change_mean > 1 || event.expected_change_mean < -1) {
                event.amount += sampleUniform(event.expected_change_lower, event.expected_change_upper);  // Add uniform-distributed change
            } else {
                event.amount *= (1 + sampleUniform(event.expected_change_lower, event.expected_change_upper));  // Percentage change using uniform distribution
            }
        }
    });


    // Calculate total payment needed
    const totalPayment = Math.round((sumOfNonDiscExpenses + totalTax) * 100) / 100;

    // if user runs out of liquidity and cannot pay required expenses, halt the simulation
    const totalAssets = state.investments.reduce((sum, inv) => sum + inv.value, 0);
    if (totalAssets < totalPayment) {
        console.log(`Simulation stopped in year ${year}: Not enough assets to pay non-discretionary expenses and taxes`);
        return returnData
    }

    //set total expense in year data
    yearData.totalExpenses = totalPayment

    // Find cash investment
    const cashInvestment = state.investments.find(inv => inv.special_id === 'cash');
    if (!cashInvestment) return;

    // Calculate needed withdrawal amount
    const neededWithdrawal = Math.max(0, totalPayment - cashInvestment.value);
    //pay from cash
    cashInvestment.value -= Math.min(totalPayment, cashInvestment.value)

    // Process withdrawals if needed
    if (neededWithdrawal > 0) {
        let remainingWithdrawal = neededWithdrawal;
        
        for (const investmentId of scenario.expense_withdrawl_strategy) {
            if (remainingWithdrawal <= 0) break;

            const investment = state.investments.find(inv => inv.special_id === investmentId);
            if (!investment || investment.value <= 0) continue;

            // Calculate amount to sell
            const sellAmount = Math.min(remainingWithdrawal, investment.value);
            remainingWithdrawal -= sellAmount;

            // Calculate and track capital gains for non-retirement investments only
            // after-tax isn't taxable, and pre-tax is taxed as income
            if (investment.tax_status === 'non-retirement') {
                const sellFraction = sellAmount / investment.value;
                const capitalGain = sellFraction * (investment.value - (investment.purchase_price || 0));
                state.curYearGains += capitalGain;
                
                // Update cost basis
                investment.purchase_price *= (1 - sellFraction);
            }

            // Update income for pre-tax withdrawals only
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
}

function calculateCapitalGainsTax(gains, brackets, isMarried) {
    let tax = 0;
    let remainingGains = gains;

    // Sort brackets by 'from' value to ensure correct order
    const applicableBrackets = brackets
        .filter(bracket => {
            if (isMarried) {
                return bracket.filingStatus === "married filing jointly qualifying surviving spouse;";
            } else {
                return bracket.filingStatus === "single;" || 
                       bracket.filingStatus === "single married filing separately;";
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

async function processDiscretionaryExpenses(state, scenario, year, yearData) {
    console.log('\nProcessing discretionary expenses...');
    const userAge = year - scenario.birth_year;

    // Get discretionary expenses for current year and order by spending strategy
    const discExpenses = scenario.spending_strategy
        .map(name => {
            const event = state.events.find(e => 
                e.name === name && 
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
            
            return {
                event,
                amount: event.amount
            };
        })
        .filter(expense => expense !== null);

    // Find cash investment
    const cashInvestment = state.investments.find(inv => inv.special_id === 'cash');
    if (!cashInvestment) return;

    // Calculate total assets
    const totalAssets = state.investments.reduce((sum, inv) => sum + inv.value, 0);
    
    // Calculate maximum amount we can spend while respecting financial goal
    const maxSpendable = Math.max(0, totalAssets - scenario.financial_goal);
    if (maxSpendable <= 0) return;

    // Process each discretionary expense in order of spending strategy
    const totalAmount = discExpenses.reduce((total, { amount }) => {return total + amount}, 0);

    // Determine how much of the expense we can afford
    let affordableAmount = Math.min(totalAmount, maxSpendable);

    //set discretionary exenses paid percentage
    yearData.discretionaryExpensesPaidPercentage = affordableAmount / totalAmount
    //increment total expenses by affordableAmount
    affordableAmount = Math.round(affordableAmount * 100) / 100
    yearData.totalExpenses += affordableAmount

    // Try to pay from cash first
    const cashPayment = Math.min(affordableAmount, cashInvestment.value);
    cashInvestment.value -= cashPayment;
    affordableAmount -= cashPayment;

    // If we need more, withdraw from investments
    if (affordableAmount > 0) {
        affordableAmount = await withdrawForExpense(state, scenario, affordableAmount, userAge);
    }
}

async function withdrawForExpense(state, scenario, amount, userAge) {
    for (const investmentId of scenario.expense_withdrawl_strategy) {
        if (amount <= 0) break;

        const investment = state.investments.find(inv => inv.special_id === investmentId);
        if (!investment || investment.value <= 0) continue;

        // Calculate and perform withdrawal
        const sellAmount = Math.min(amount, investment.value);
        if (sellAmount <= 0) break;

        // Calculate and track capital gains for non-retirement investments only
        // after-tax isn't taxable, and pre-tax is taxed as income
        if (investment.tax_status === 'non-retirement') {
            const sellFraction = sellAmount / investment.value;
            const capitalGain = sellFraction * (investment.value - investment.purchase_price);
            state.curYearGains += capitalGain;
            
            // Update cost basis
            investment.purchase_price *= (1 - sellFraction);
        }

        // Update income for pre-tax withdrawals only
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
    return amount;
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

async function processInvestEvents(state, year) {
    console.log('\nProcessing investment events...');
    // Find cash investment
    const cashInvestment = state.investments.find(inv => inv.special_id === 'cash');
    if (!cashInvestment) return;

    // Get invest events for current year
    const investEvents = state.events.filter(event => 
        event.type === 'invest' &&
        year >= event.start_year_value &&
        (!event.duration_value || year < event.start_year_value + event.duration_value)
    );

    //there should only be 1 invest event for a given year
    for (const event of investEvents) {
        console.log(event)
        // Calculate excess cash above max_cash threshold
        const maxCash = event.max_cash || 0;
        const excessCash = Math.max(0, cashInvestment.value - maxCash);
        if (excessCash <= 0) break;

        // Calculate inflation-adjusted contribution limit
        const baseLimit = state.retirementLimits;

        // Get current allocations based on glide path (defaults to fixed if not enabled)
        const currentAllocations = calculateGlidePathAllocations(event, year);

        // Group investments by tax status
        const investmentsByTaxStatus = {
            'after-tax': [],
            'other': []
        };

        Object.entries(currentAllocations).forEach(([investmentId, percentage]) => {
            const investment = state.investments.find(inv => inv.special_id === investmentId);
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
        if (afterTaxTotal > baseLimit) {
            const scaleDown = baseLimit / afterTaxTotal;
            const excessAmount = afterTaxTotal - baseLimit;
            
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

async function processRebalanceEvents(state, year) {
    console.log('\nProcessing rebalance events...');

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
            const investment = state.investments.find(inv => inv.special_id === investmentId);
            if (!investment) return;
            currentInvestments.set(investment.special_id, investment);
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
            adjustments.set(investment.special_id, adjustment);
        });

        // Process sales first (negative adjustments)
        const cashInvestment = state.investments.find(inv => inv.special_id === 'cash');
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
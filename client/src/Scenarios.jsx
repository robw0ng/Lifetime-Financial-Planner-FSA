"use client";
import React from "react";
import styles from "./Scenarios.module.css";
import { useSelectedScenario } from "./SelectedContext";
import { Link } from "react-router-dom";


function  ScenarioActions({ scenario }){
    return (
      <section className={styles.scenarioActionsContainer}>
        <div className={styles.scenarioActions}>
            <h2 className={styles.actionsHeader}>Actions:</h2>
            <Link to="/create-scenario" className={`${styles.actionButton} ${styles.createNewScenario}`}>
                Create New Scenario
            </Link>

            <h3 className={styles.selectedScenario}>
            <label className={styles.underline}>Selected Scenario: <br></br></label>
            <label className={styles.value}>{scenario.name}</label>
            </h3>
            <button className={`${styles.actionButton} ${styles.duplicateScenario}`}>Duplicate Scenario</button>
            <Link to={`/edit-scenario/${scenario.id}`} className={`${styles.actionButton} ${styles.editScenario}`}>
                Edit Scenario
            </Link>
            <button className={`${styles.actionButton} ${styles.deleteScenario}`}>Delete Scenario</button>
        </div>
      </section>
    );
};

function BasicInformation({ scenario }) {
    return (
        <section className={styles.basic_info}>
          <h2 className={styles.sectionTitle}>
            Basic Information:
          </h2>
          <div className={styles.info_values}>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Name:</p>
                <p className={styles.info_value}>{scenario.name}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Description:</p>
                <p className={styles.info_value}>{scenario.description}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Marital Status:</p>
                <p className={styles.info_value}>{scenario.isMarried ? "Married" : "Single"}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Spouse Life Expectancy:</p>
                <p className={styles.info_value}>{scenario.lifeExpectancySpouse}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Birth Year:</p>
                <p className={styles.info_value}>{scenario.birthYear}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Life Expectancy:</p>
                <p className={styles.info_value}>{scenario.lifeExpectancy}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>State:</p>
                <p className={styles.info_value}>{scenario.stateOfResidence}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Financial Goal:</p>
                <p className={styles.info_value}>{scenario.financialGoal}</p>
            </div>
            <div className={styles.info_row}>
                <p className={styles.info_item}>Inflation Assumption:</p>
                <p className={styles.info_value}>{scenario.inflationAssumption}</p>
            </div>
          </div>
        </section>
    );
}

function CashBalance({scenario}){
    let cashInvestment = 0;

    scenario.investments.forEach(investment => {
      if (investment.type === 'cash') {
        cashInvestment = investment.value;
      }
    });
    
    return (
        <section className={styles.cashSection}>
          <h2 className={styles.sectionTitle}>
            Account Balance: {cashInvestment}
          </h2>
        </section>
    );
}

function InvestmentList({ scenario }){
    // Take only the first three elements from the investments list
    let investmentsArray = Array.from(scenario.investments);

    if (investmentsArray.length == 0){
        investmentsArray = [{type: 'No investments to show...', value: 0}]
    }
    const topInvestments = investmentsArray.slice(0, 3);

    return (
        <div className={styles.investmentList}>
            <div className={styles.title}>
            <h2 className={styles.title}>Investments:</h2>
            <div className={styles.header}>
                <span>Type</span>
                <span>Value</span>
            </div>
            {topInvestments.map((investment, index) => (
                <div key={index} className={styles.investmentItem}>
                <span>{investment.type}</span>
                <span>${investment.value.toLocaleString()}</span>
                </div>
            ))}
            </div>
        </div>
    );
};

function Settings({scenario}){
    let start = scenario.rothConversionOptimizerStartYear;
    let end = scenario.rothConversionOptimizerEndYear;

    return (
        <section className={styles.settingsContainer}>
            <h2 className={styles.sectionTitle}>Settings and Limits:</h2>
            <div className={styles.info_values}>
                <div className={styles.info_row}>
                    <p className={styles.info_item}>Pre-Tax Contribution Limit:</p>
                    <p className={styles.info_value}>{scenario.preTaxContributionLimit}</p>
                </div>
                <div className={styles.info_row}>
                    <p className={styles.info_item}>After-Tax Contribution Limit:</p>
                    <p className={styles.info_value}>{scenario.afterTaxContributionLimit}</p>
                </div>
                <div className={styles.info_row}>
                    <p className={styles.info_item}>Roth Optimizer Enabled:</p>
                    <p className={styles.info_value}>
                        {scenario.rothConversionOptimizerEnabled ? "Yes" : "No"}
                    </p>
                </div>
                <div className={styles.info_row}>
                    <p className={styles.info_item}>Roth Optimizer Start Year:</p>
                    <p className={styles.info_value}>{scenario.rothConversionOptimizerStartYear}</p>
                </div>
                <div className={styles.info_row}>
                    <p className={styles.info_item}>Roth Optimizer End Year:</p>
                    <p className={styles.info_value}>{scenario.rothConversionOptimizerEndYear}</p>
                </div>
            </div>
        </section>
    );
}

function ScenarioInfo({ scenario }){
    return (
        <section className={styles.info_container}>
            <BasicInformation scenario={scenario} />
            {/* <CashBalance scenario={scenario}/> */}
            <InvestmentList scenario={scenario} />
            <Settings scenario={scenario}/>
        </section>
    );
}

// need to do an onclick for each scenario to set the selected scenario
function ScenarioList() {
    const { selectedScenario, setSelectedScenario } = useSelectedScenario();

    function selectScenario(scenario){
        if (scenario.id === selectedScenario.id){
            setSelectedScenario({
                id: "0",
                name: "Not Selected",
                description: "None",
                isMarried: false,
                birthYear: -1, // -1 to represent unset state
                birthYearSpouse: -1, // Optional, so left as -1 when not set
                lifeExpectancy: -1,
                lifeExpectancySpouse: -1, // Optional
                inflationAssumption: 0.0,
                preTaxContributionLimit: 0.0,
                afterTaxContributionLimit: 0.0,
                sharingSettings: "",
                financialGoal: 0.0,
                stateOfResidence: "",
                investments: new Set(), // Empty set for no investments
                events: new Set(), // Empty set for no events
                spendingStrategy: [], // Empty list for no strategy
                rmdStrategy: [], // Empty list for no RMD strategy
                rothConversionStrategy: [], // Empty list for no conversion strategy
                expenseWithdrawalStrategy: [], // Empty list for no withdrawal strategy
                rothConversionOptimizerEnabled: false,
                rothConversionOptimizerStartYear: -1,
                rothConversionOptimizerEndYear: -1,
            })
        }
        else if (scenario.id !== 0){
            setSelectedScenario(scenario);
        }
    }

    // Example list of scenarios
    let scenarios = [
        {
            id: "1",
            name: "Unemployed",
            description: "None",
            isMarried: false,
            birthYear: -1, // -1 to represent unset state
            birthYearSpouse: -1, // Optional, so left as -1 when not set
            lifeExpectancy: -1,
            lifeExpectancySpouse: -1, // Optional
            inflationAssumption: 0.0,
            preTaxContributionLimit: 0.0,
            afterTaxContributionLimit: 0.0,
            sharingSettings: "",
            financialGoal: 0.0,
            stateOfResidence: "",
            investments: new Set(), // Empty set for no investments
            events: new Set(), // Empty set for no events
            spendingStrategy: [], // Empty list for no strategy
            rmdStrategy: [], // Empty list for no RMD strategy
            rothConversionStrategy: [], // Empty list for no conversion strategy
            expenseWithdrawalStrategy: [], // Empty list for no withdrawal strategy
            rothConversionOptimizerEnabled: false,
            rothConversionOptimizerStartYear: -1,
            rothConversionOptimizerEndYear: -1,
        }, 
        {
            id: "2",
            name: "gaming",
            description: "None",
            isMarried: false,
            birthYear: -1, // -1 to represent unset state
            birthYearSpouse: -1, // Optional, so left as -1 when not set
            lifeExpectancy: -1,
            lifeExpectancySpouse: -1, // Optional
            inflationAssumption: 0.0,
            preTaxContributionLimit: 0.0,
            afterTaxContributionLimit: 0.0,
            sharingSettings: "",
            financialGoal: 0.0,
            stateOfResidence: "",
            investments: new Set(), // Empty set for no investments
            events: new Set(), // Empty set for no events
            spendingStrategy: [], // Empty list for no strategy
            rmdStrategy: [], // Empty list for no RMD strategy
            rothConversionStrategy: [], // Empty list for no conversion strategy
            expenseWithdrawalStrategy: [], // Empty list for no withdrawal strategy
            rothConversionOptimizerEnabled: false,
            rothConversionOptimizerStartYear: -1,
            rothConversionOptimizerEndYear: -1,
        }, 
    ];

    // If the scenarios list is empty, display a placeholder item
    if (scenarios.length <= 0) {
        scenarios = [{ name: 'No scenarios to show...', id: 0 }];
    }

    return (
        <section className={styles.scenarioListContainer}>
            <div className={styles.scenarioList}>
                <div className={styles.title}>
                    <h2 className={styles.title}>Scenarios:</h2>
                    <div className={styles.header}>
                        <span>Name:</span>
                    </div>
                    {scenarios.map((scenario, index) => (
                        <div
                            key={index}
                            className={
                                scenario.id === selectedScenario.id
                                    ? styles.selectedScenarioItem
                                    : styles.scenarioItem
                            }
                            onClick={() => selectScenario(scenario)}
                        >
                            <span>{scenario.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const Scenarios = () => {
    const {selectedScenario, setSelectedScenario} = useSelectedScenario()
    console.log(selectedScenario);
    return (
        <main className={styles.scenarios}>
            <section className={styles.column}>
                <ScenarioActions scenario={selectedScenario}/>
                <ScenarioList />
            </section>
            <section className={styles.column}>
                <ScenarioInfo scenario={selectedScenario}/>
            </section>
        </main>
    );
};

export default Scenarios;

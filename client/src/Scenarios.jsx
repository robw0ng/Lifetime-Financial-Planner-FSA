import React from "react";
import styles from "./Scenarios.module.css";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { Link } from "react-router-dom";
import { get_type_from_id } from "./Investments";

function ScenarioActions({ scenario }) {
  const isScenarioSelected = scenario;
  const { duplicateScenario, deleteScenario } = useData();
  const { setSelectedScenario, deselectScenario } = useSelected();
  if (!scenario) {
    scenario = {
      id: null,
      name: "None!",
    };
  }

  function handleDeleteButtonClick() {
    if (scenario.id !== null) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this scenario?"
      );
      if (confirmDelete) {
        deleteScenario(scenario.id);
        deselectScenario();
      }
    }
  }

  async function handleDuplicateButtonClick() {
    if (scenario.id !== null) {
      try {
        let returnedScenario = await duplicateScenario(scenario.id);
        console.log(returnedScenario);
        if (returnedScenario !== null) {
          setSelectedScenario(returnedScenario);
        }
      } catch (error) {
        console.error("Error duplicating scenario:", error);
      }
    }
  }

  return (
    <section
      className={`${styles["outer-container"]} ${styles["scenario-actions-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["scenario-actions"]}`}
      >
        <div className={styles["scenario-actions-content"]}>
          <h2 className={styles["actions-header"]}>Scenario Actions:</h2>
          <Link to="/create-scenario" className={styles["action-button"]}>
            <button
              className={`${styles["action-button"]} ${styles["create"]}`}
            >
              Create New Scenario
            </button>
          </Link>

          <h3 className={styles["selected-header"]}>
            <label>Selected Scenario:</label>
            <label>{scenario.name}</label>
          </h3>
          <button
            className={`${styles["action-button"]} ${styles["duplicate"]}`}
            onClick={handleDuplicateButtonClick}
          >
            Duplicate Scenario
          </button>
          {isScenarioSelected ? (
            <Link
              to={`/edit-scenario/${scenario.id}`}
              className={styles["action-button"]}
            >
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit Scenario
              </button>
            </Link>
          ) : (
            <Link className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit Scenario
              </button>
            </Link>
          )}
          <button
            className={`${styles["action-button"]} ${styles["delete"]}`}
            onClick={handleDeleteButtonClick}
          >
            Delete Scenario
          </button>
        </div>
      </div>
    </section>
  );
}

function BasicInformation({ scenario }) {
  if (!scenario) {
    scenario = {
      name: "",
      is_married: null,
      spouse_life_expectancy_value: "",
      birth_year: "",
      life_expectancy_value: "",
      state_of_residence: "",
      financial_goal: "",
      inflation_assumption_value: "",
    };
  }

  return (
    <div className={styles["outer-container"]}>
      <div className={styles["inner-container"]}>
        <div className={styles["basic-info"]}>
          <h2 className={styles["basic-info-title"]}>Basic Information:</h2>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Name:</p>
            <p className={styles["basic-info-value"]}>{scenario.name}</p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Marital Status:</p>
            <p className={styles["basic-info-value"]}>
              {scenario.is_married === null
                ? ""
                : scenario.is_married
                ? "Married"
                : "Single"}
            </p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Birth Year:</p>
            <p className={styles["basic-info-value"]}>{scenario.birth_year}</p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>State:</p>
            <p className={styles["basic-info-value"]}>
              {scenario.state_of_residence}
            </p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Financial Goal:</p>
            <p className={styles["basic-info-value"]}>
              {scenario.financial_goal}
            </p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Inflation Assumption:</p>
            <p className={styles["basic-info-value"]}>
              {scenario.inflation_assumption_value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvestmentList({ scenario }) {
  let investmentsArray = [];

  const { setSelectedInvestment, selectedScenario } = useSelected();

  if (scenario) {
    investmentsArray = Array.from(scenario.Investments);
  }

  if (investmentsArray.length == 0) {
    investmentsArray = [
      { id: null, type: { name: "No investments available"}, account: null, value: null },
    ];
  }

  const topInvestments = investmentsArray
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  function selectInvestment(investment) {
    if (investment.id !== null || investment.id !== 0) {
      setSelectedInvestment(investment);
    }
  }

  return (
    <div
      className={`${styles["outer-container"]} ${styles["investment-list-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["investment-list"]}`}
      >
        <h2>Top Investments:</h2>
        <div className={styles["investment-list-header"]}>
          <span className={styles["investment-span"]}>Type</span>
          <span>|</span>
          <span className={styles["investment-span"]}>Account</span>
          <span>|</span>
          <span className={styles["investment-span"]}>Value</span>
        </div>
        <div className={styles["investment-item-list"]}>
          {topInvestments.map((investment, index) => (
            <div
              key={investment.id ?? index}
              className={styles["top-investment-item"]}
              onClick={
                investment.id !== null ? () => selectInvestment(investment) : undefined
              }
            >
              {/* Investment Type */}
              <span className={styles["top-investment-span"]}>
                {get_type_from_id(investment.investment_type_id, selectedScenario)?.name ?? "—"}
              </span>
  
              {/* Account Type */}
              <span className={styles["top-investment-span"]}>
                {investment?.tax_status ?? "—"}
              </span>
  
              {/* Investment Value */}
              <span className={styles["top-investment-span"]}>
                {investment?.value
                  ? `$${investment.value.toLocaleString()}`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
}

function Settings({ scenario }) {
  if (!scenario) {
    scenario = {
      after_tax_contribution_limit: "",
      is_roth_optimizer_enabled: null,
      roth_start_year: "",
      roth_end_year: "",
    };
  }

  return (
    <section
      className={`${styles["outer-container"]} ${styles["settings-outer-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["settings-inner-container"]}`}
      >
        <h2>Settings and Limits:</h2>
        <div className={styles["settings"]}>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>
              After-Tax Contribution Limit:
            </p>
            <p className={styles["basic-info-value"]}>
              {scenario.after_tax_contribution_limit}
            </p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Roth Optimizer Enabled:</p>
            <p className={styles["basic-info-value"]}>
              {scenario.is_roth_optimizer_enabled === null
                ? ""
                : scenario.is_roth_optimizer_enabled
                ? "Yes"
                : "No"}
            </p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>
              Roth Optimizer Start Year:
            </p>
            <p className={styles["basic-info-value"]}>
              {scenario.roth_start_year}
            </p>
          </div>
          <div className={styles["basic-info-row"]}>
            <p className={styles["basic-info-item"]}>Roth Optimizer End Year:</p>
            <p className={styles["basic-info-value"]}>
              {scenario.roth_end_year}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScenarioInfo({ scenario }) {
  return (
    <>
      <BasicInformation scenario={scenario} />
      <InvestmentList scenario={scenario} />
      <Settings scenario={scenario} />
    </>
  );
}

export function ScenarioList() {
  const { selectedScenario, setSelectedScenario, deselectScenario } =
    useSelected();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      console.log(scenario);
    }
  }

  const { scenarios } = useData();
  let scenariosList = scenarios;

  if (scenariosList.length <= 0) {
    scenariosList = [{ name: "No scenarios available...", id: null }];
  }

  return (
    <section
      className={`${styles["outer-container"]} ${styles["scenario-list-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["scenario-list"]}`}
      >
        <h2 className={styles["scenario-list-title"]}>Scenarios:</h2>
        <div className={styles["scenario-item-list"]}>
          {scenariosList.map((scenario, index) => (
            <div
              key={scenario.id}
              className={
                selectedScenario && scenario.id === selectedScenario.id
                  ? `${styles["selected"]} ${styles["scenario-item"]}`
                  : styles["scenario-item"]
              }
              onClick={
                scenario.id !== null ? () => selectScenario(scenario) : undefined
              }
            >
              <span>{scenario.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenariosGraph(){
  return (
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          <div className={styles["graph"]}>
            graph goes here
          </div>
        </div>
    </div>
  )
}

function ScenarioSharingSettings(){
  return (
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          Sharing settings go here
        </div>
      </div>
  )
}

const Scenarios = () => {
  const { selectedScenario, setSelectedScenario } = useSelected();

  return (
    <main className={styles["scenarios"]}>
      <section className={styles["column"]}>
        <ScenarioActions scenario={selectedScenario} />
        <ScenarioList />
      </section>
      <section className={`${styles["column"]} ${styles["scenario-info-col"]}`}>
        <ScenarioInfo scenario={selectedScenario} />
      </section>
      <section className={`${styles["column"]} ${styles["scenario-info-col"]}`}>
        <ScenariosGraph/>
        <ScenarioSharingSettings />
      </section>

    </main>
  );
};

export default Scenarios;

import React from "react";
import styles from "./Scenarios.module.css";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { Link } from "react-router-dom";
import { get_type_from_id } from "./Investments";
import { useState, useEffect } from "react";

function ScenarioActions({ scenario }) {
  const isScenarioSelected = scenario;
  const { duplicateScenario, deleteScenario, leaveScenario } = useData();
  const { setSelectedScenario, deselectScenario } = useSelected();
  if (!scenario) {
    scenario = {
      id: null,
      name: "None!",
    };
  }

  async function handleDeleteButtonClick() {
    if (scenario.id !== null) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this scenario?"
      );
      if (confirmDelete) {
        await deleteScenario(scenario.id);
        deselectScenario();
      }
    }
  }

  async function handleLeaveButtonClick() {
    if (scenario.id !== null) {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave this scenario?"
      );
      if (confirmLeave) {
        // deleteScenario(scenario.id);
        await leaveScenario(scenario.id);
        deselectScenario();
      }
    }

  }

  async function handleDuplicateButtonClick() {
    if (scenario.id !== null) {
      try {
        console.log(scenario.id);
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
                disabled={scenario.permission && scenario.permission !== "rw"}
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
            onClick={
              scenario.permission && (scenario.permission === "rw" || scenario.permission === "r")
              ? handleLeaveButtonClick
              : handleDeleteButtonClick
            }
            // disabled={scenario.permission && (scenario.permission === "rw" || scenario.permission === "r")}

          >
            {scenario.permission && (scenario.permission === "rw" || scenario.permission === "r")
              ? "Leave Scenario"
              : "Delete Scenario"
            }
            {/* Delete Scenario */}
          </button>
        </div>
      </div>
    </section>
  );
}

function BasicInformation({ scenario }) {
  const [owner, setOwner] = useState("No one!");
  useEffect(() => {
    if (scenario && scenario.user_id) {
      const fetchOwnerEmail = async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/scenarios/owner/${scenario.user_id}`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (res.status === 401) {
            throw new Error("Unauthorized");
          }

          if (!res.ok) {
            throw new Error("Failed to fetch scenario owner");
          }

          const data = await res.json();
          setOwner(data || "Unknown");
        } catch (error) {
          console.error(error);
        }
      };

      fetchOwnerEmail();
    }
    else{
      setOwner("No one!");
    }
  }, [scenario]);

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
          <label className={styles["basic-info-title"]}>Owner: {owner}</label>
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
  const { 
    selectedScenario, 
    setSelectedScenario, 
    deselectScenario, 
    shared, 
    setShared 
  } = useSelected();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      console.log(scenario);
    }
  }

  const { scenarios, sharedScenarios, fetchShared } = useData();
  let scenariosList = scenarios;
  let sharedScenariosList = sharedScenarios;


  function selectShared(){
    setShared(true);
    fetchShared();
  }

  function selectOwned(){
    setShared(false);
  }

  if (scenariosList.length <= 0 ) {
    scenariosList = [{ name: "No scenarios available...", id: null }];
  }

  if (sharedScenariosList.length <= 0){
    sharedScenariosList = [{ name: "No scenarios available...", id: null }];
  }

  return (
    <section
      className={`${styles["outer-container"]} ${styles["scenario-list-container"]}`}>
      <div className={`${styles["inner-container"]} ${styles["scenario-list"]}`}>
        <div className={`${styles["scenario-shared-button-container"]}`}>
          <button 
          className={
            shared === false
            ? `${styles["share-button"]} ${styles["selected"]}`
            : styles["share-button"]          
          }
          onClick={selectOwned}
          >
          Owned</button>
          <button 
          className={
            shared === true
            ? `${styles["share-button"]} ${styles["selected"]}`
            : styles["share-button"]          
          }
          onClick={selectShared}
          >
            Shared</button>
        </div>
        <h2 className={styles["scenario-list-title"]}>Scenarios:</h2>
        <div className={styles["scenario-item-list"]}>
          {shared === true ? (sharedScenariosList.map((shared_scenario, index) => (
            <div
              key={shared_scenario.id}
              className={
                selectedScenario && shared_scenario.id === selectedScenario.id
                  ? `${styles["selected"]} ${styles["scenario-item"]}`
                  : styles["scenario-item"]
              }
              onClick={
                shared_scenario.id !== null ? () => selectScenario(shared_scenario) : undefined
              }
            >
              <span>{shared_scenario.name}</span>
            </div>))) :

            (scenariosList.map((scenario, index) => (
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
              </div>)))
          }
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

function ScenarioSharingSettings() {
  const { selectedScenario } = useSelected();

  return (
    <div className={`${styles["outer-container"]} ${styles["sharing-settings-outer-container"]}`}>
      <div className={`${styles["inner-container"]}`}>
        <div className={styles["sharing-settings-inner-container"]}>
        <h2>Share Scenario</h2>
          {selectedScenario ? (
              <Link
                to={`/share-scenario/${selectedScenario.id}`}
                className={styles["action-button"]}
              >
                <button
                  className={`${styles["action-button"]} ${styles["share"]}`}
                  disabled={selectedScenario.permission}
                >
                  Share
                </button>
              </Link>
            ) : (
              <Link className={styles["action-button"]}>
                <button
                  className={`${styles["action-button"]}`}
                  disabled={!selectedScenario}
                >
                  Share
                </button>
              </Link>
          )}
        </div>
      </div>
    </div>
  );
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

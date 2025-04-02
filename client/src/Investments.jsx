import styles from "./Investments.module.css";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { Link } from "react-router-dom";

function ScenarioList() {
  const {
    selectedScenario,
    setSelectedScenario,
    deselectScenario,
    deselectInvestment,
  } = useSelected();
  const { scenarios } = useData();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      deselectInvestment();
    }
  }
  let scenariosList = scenarios;

  // If the scenarios list is empty, display a placeholder item
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
              key={index}
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

function InvestmentList() {
  const {
    selectedScenario,
    selectedInvestment,
    setSelectedInvestment,
    deselectInvestment,
  } = useSelected();

  function selectInvestment(investment) {
    if (selectedInvestment && investment.id === selectedInvestment.id) {
      deselectInvestment();
    } else if (investment?.id) {
      setSelectedInvestment(investment);
    }
  }

  let investmentsArray = [];

  if (selectedScenario) {
    investmentsArray = Array.from(selectedScenario.Investments);
  }

  if (investmentsArray.length === 0) {
    investmentsArray = [
      {
        id: null,
        type: { name: "No investments available" },
        value: null,
        account: null,
      },
    ];
  }

  return (
    <div
      className={`${styles["outer-container"]} ${styles["investment-list-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["investment-list"]}`}
      >
        <h2>Investments:</h2>
        <div className={styles["investment-list-header"]}>
          <span className={styles["investment-span"]}>Type</span>
          <span>|</span>
          <span className={styles["investment-span"]}>Account</span>
          <span>|</span>
          <span className={styles["investment-span"]}>Value</span>
        </div>
        <div className={styles["investment-item-list"]}>
          {investmentsArray.map((investment, index) => (
            <div
              key={investment.id ?? index}
              className={
                selectedInvestment && investment.id === selectedInvestment.id
                  ? `${styles["selected"]} ${styles["investment-item"]}`
                  : styles["investment-item"]
              }
              onClick={
                investment.id !== null
                  ? () => selectInvestment(investment)
                  : undefined
              }
            >
              <span className={styles["investment-span"]}>
                {investment?.type?.name ?? "—"}
              </span>
  
              {/* Show delimiter only if there's an account */}
              {investment?.account && <span>:</span>}
  
              <span className={styles["investment-span"]}>
                {investment?.account ?? "—"}
              </span>
  
              {/* Show delimiter only if there's a value */}
              {investment?.value && <span>:</span>}
  
              <span className={styles["investment-span"]}>
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

function InvestmentTypeInfo({ investment }) {
  if (!investment || !investment.type) {
    investment = {
      type: {
        name: "",
        description: "",
        expectedChange: "",
        expenseRatio: "",
        expectedIncome: "",
        taxability: "",
      },
      taxStatus: "",
      value: 0,
    };
  }

  const type = investment.type;

  return (
    <section className={styles["outer-container"]}>
      <div className={styles["inner-container"]}>
        <div className={styles["investment-info"]}>
          <h2 className={styles["investment-title"]}>Investment Type Details:</h2>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Name: </label>
            <label className={styles["info-value"]}>{type.name}</label>
          </div>
          <div className={`${styles["info-row"]} ${styles["description-row"]}`}>
            <label className={`${styles["info-item"]} ${styles["description-item"]}`}>Description: </label>
            <label className={`${styles["info-value"]} ${styles["description-value"]}`}>{type.description}</label>
          </div>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Expected Annual Return: </label>
            <label className={styles["info-value"]}>{type.expected_annual_return}</label>
          </div>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Expense Ratio: </label>
            <label className={styles["info-value"]}>{type.expense_ratio}%</label>
          </div>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Expected Income: </label>
            <label className={styles["info-value"]}>{type.expected_annual_income}</label>
          </div>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Taxability: </label>
            <label className={styles["info-value"]}>{type.taxability}</label>
          </div>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Account Tax Status: </label>
            <label className={styles["info-value"]}>{investment.account}</label>
          </div>
          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Current Value: </label>
            <label className={styles["info-value"]}>${investment.value.toLocaleString()}</label>
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestmentActions({ investment }) {
  const { selectedScenario, deselectInvestment } = useSelected();
  const { duplicateInvestment, deleteInvestment } = useData();

  if (!investment) {
    investment = {
      id: null,
      type: { name: "None!" },
    };
  }

  function handleDeleteButtonClick() {
    if (investment.id !== null && selectedScenario?.id) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this investment?"
      );
      if (confirmDelete) {
        deleteInvestment(selectedScenario.id, investment.id);
        deselectInvestment();
      }
    }
  }

  function handleDuplicateButtonClick() {
    if (investment.id !== null && selectedScenario?.id) {
      duplicateInvestment(selectedScenario.id, investment.id);
    }
  }

  return (
    <section
      className={`${styles["outer-container"]} ${styles["investment-actions-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["investment-actions"]}`}
      >
        <div className={styles["investment-actions-content"]}>
          <h2>Investment Actions:</h2>

          {selectedScenario ? (
            <Link to="/create-investment" className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
              >
                Create New Investment
              </button>
            </Link>
          ) : (
            <Link to="" className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
              >
                Create New Investment
              </button>
            </Link>
          )}

          <h3 className={styles["selected-header"]}>
            <label>Selected Investment:</label>
            <label>{investment.type.name}</label>
          </h3>

          <button
            className={`${styles["action-button"]} ${styles["duplicate"]}`}
            onClick={handleDuplicateButtonClick}
          >
            Duplicate Investment
          </button>

          {investment.id !== null ? (
            <Link
              to={`/edit-investment/${investment.id}`}
              className={styles["action-button"]}
            >
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit Investment
              </button>
            </Link>
          ) : (
            <Link className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit Investment
              </button>
            </Link>
          )}

          <button
            className={`${styles["action-button"]} ${styles["delete"]}`}
            onClick={handleDeleteButtonClick}
          >
            Delete Investment
          </button>
        </div>
      </div>
    </section>
  );
}

function InvestmentGraph(){
  return (
    <div className={styles["investment-graph"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          graph goes here
        </div>
      </div>
    </div>
  )
}

export default function Investments() {
  const { selectedInvestment } = useSelected();
  return (
    <main className={styles["investments"]}>
      <section className={styles["column"]}>
        <InvestmentActions investment={selectedInvestment} />
        <ScenarioList />
      </section>
      <section className={styles["column"]}>
        <InvestmentList />
      </section>
      <section className={styles["column"]}>
        <InvestmentTypeInfo investment={selectedInvestment} />
        <InvestmentGraph />
      </section>
    </main>
  );
}

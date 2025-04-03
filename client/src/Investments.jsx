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
      console.log(scenario);
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

function InvestmentTypeList(){
  const {
    selectedScenario,
    selectedInvestmentType,
    setSelectedInvestmentType,
    selectedInvestment,
    deselectInvestmentType,
    deselectInvestment
  } = useSelected();

  function selectInvestmentType(investmentType){
    if (selectedInvestmentType && investmentType.id === selectedInvestmentType.id){
      deselectInvestmentType();
      deselectInvestment();
    }
    else if (investmentType?.id){
      if(selectedInvestment && selectedInvestment.type !== investmentType){
        deselectInvestment();
      }

      setSelectedInvestmentType(investmentType);
    }
  }

  let investmentTypesArray = [];

  if (selectedScenario) {
    investmentTypesArray = selectedScenario.InvestmentTypes;
  }

  if (investmentTypesArray.length === 0){{
    investmentTypesArray = [
      {
        id: null,
        name: null,
        description: null,
        expected_change_type: null,
        expected_change_value: null,
        expected_change_mean: null,
        expected_change_std_dev: null,
        expense_ratio: null,
        expected_income_type: null,
        expected_income_value: null,
        expected_income_mean: null,
        expected_income_std_dev: null,
        taxability: null,
        scenario_id: null,
      }
    ]
  }}

  return (
    <div
      className={`${styles["outer-container"]} ${styles["investment-list-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["investment-list"]}`}
      >
        <h2>Investment Types:</h2>
        <div className={styles["investment-type-list-header"]}>
          <span className={styles["investment-span"]}>Name</span>
        </div>
        <div className={styles["investment-item-list"]}>
          {investmentTypesArray.map((investmentType, index) => (
            <div
              key={investmentType.id ?? index}
              className={
                selectedInvestmentType && investmentType.id === selectedInvestmentType.id
                  ? `${styles["selected"]} ${styles["investment-type-item"]}`
                  : styles["investment-type-item"]
              }
              onClick={
                investmentType.id !== null
                  ? () => selectInvestmentType(investmentType)
                  : undefined
              }
            >
              <span className={styles["investment-type-span"]}>
                {investmentType?.name ?? "—"}
              </span>
  
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvestmentTypeActions({ investmentType }) {
  const { selectedScenario, deselectInvestmentType } = useSelected();
  const { duplicateInvestmentType, deleteInvestmentType } = useData();

  if (!investmentType) {
    investmentType = {
      id: null,
      name: "None!",
      description: null,
      expected_change_type: null,
      expected_change_value: null,
      expected_change_mean: null,
      expected_change_std_dev: null,
      expense_ratio: null,
      expected_income_type: null,
      expected_income_value: null,
      expected_income_mean: null,
      expected_income_std_dev: null,
      taxability: null,
      scenario_id: null,
    };
  }

  function handleDeleteButtonClick() {
    if (investmentType.id !== null && selectedScenario?.id) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this investment type?"
      );
      if (confirmDelete) {
        deleteInvestmentType(selectedScenario.id, investmentType.id);
        deselectInvestmentType();
      }
    }
  }

  async function handleDuplicateButtonClick() {
    if (investmentType.id !== null && selectedScenario?.id) {
      const duplicatedInvestment = await duplicateInvestmentType(selectedScenario.id, investmentType.id);
      setSelectedInvestment(duplicatedInvestment);
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
          <h2>Type Actions:</h2>
          <div className={styles["button-container"]}>
          {selectedScenario ? (
            <Link to="/create-investment-type" className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
              >
                Create
              </button>
            </Link>
          ) : (
            <Link to="" className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
              >
                Create
              </button>
            </Link>
          )}

          <h3 className={styles["selected-header"]}>
            <label>Selected:</label>
            <label>{investmentType.name}</label>
          </h3>

          <button
            className={`${styles["action-button"]} ${styles["duplicate"]}`}
            onClick={handleDuplicateButtonClick}
          >
            Duplicate
          </button>

          {investmentType.id !== null ? (
            <Link
              to={`/edit-investment-type/${investmentType.id}`}
              className={styles["action-button"]}
            >
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit
              </button>
            </Link>
          ) : (
            <Link className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit
              </button>
            </Link>
          )}

          <button
            className={`${styles["action-button"]} ${styles["delete"]}`}
            onClick={handleDeleteButtonClick}
          >
            Delete
          </button>
          </div>
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
    setSelectedInvestmentType,
    deselectInvestment,
  } = useSelected();

  function selectInvestment(investment) {
    if (selectedInvestment && investment.id === selectedInvestment.id) {
      deselectInvestment();
    } else if (investment?.id) {
      setSelectedInvestment(investment);
      setSelectedInvestmentType(investment.type)
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

function InvestmentTypeInfo() {
  const { selectedInvestment, selectedInvestmentType } = useSelected();
  let investment = selectedInvestment;
  if (!investment) {
    investment = {
      account: "",
      value: ""
    };
  }


  let type = selectedInvestmentType;
  if (!type) {
      type= {
        name: "",
        description: "",
        expectedChange: "",
        expenseRatio: "",
        expectedIncome: "",
        taxability: "",
      }
  }

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
          <h2>Investment:</h2>
          <div className={styles["button-container"]}>
            {selectedScenario ? (
              <Link to="/create-investment">
                <button
                  className={`${styles["action-button"]} ${styles["create"]}`}
                >
                  Create
                </button>
              </Link>
            ) : (
              <Link to="">
                <button
                  className={`${styles["action-button"]} ${styles["create"]}`}
                >
                  Create
                </button>
              </Link>
            )}

            <h3 className={styles["selected-header"]}>
              <label>Selected:</label>
              <label>{investment.type.name}</label>
            </h3>

            <button
              className={`${styles["action-button"]} ${styles["duplicate"]}`}
              onClick={handleDuplicateButtonClick}
            >
              Duplicate
            </button>

            {investment.id !== null ? (
              <Link
                to={`/edit-investment/${investment.id}`}
              
              >
                <button
                  className={`${styles["action-button"]} ${styles["edit"]}`}
                >
                  Edit
                </button>
              </Link>
            ) : (
              <Link>
                <button
                  className={`${styles["action-button"]} ${styles["edit"]}`}
                >
                  Edit
                </button>
              </Link>
            )}

            <button
              className={`${styles["action-button"]} ${styles["delete"]}`}
              onClick={handleDeleteButtonClick}
            >
              Delete
            </button>
          </div>
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
  const { selectedInvestment, selectedInvestmentType } = useSelected();
  return (
    <main className={styles["investments"]}>
      <section className={styles["column"]}>
        <section className={styles["row"]}>
          <InvestmentTypeActions investmentType={selectedInvestmentType} />
          <InvestmentActions investment={selectedInvestment} />
        </section>
        <ScenarioList />
      </section>

      <section className={styles["column"]}>
        <InvestmentTypeList />
      </section>

      <section className={styles["column"]}>
        <InvestmentList />
      </section>
      <section className={`${styles["column"]} ${styles["investment-type-details-column"]}`}>
        <InvestmentTypeInfo />
      </section>
    </main>
  );
}

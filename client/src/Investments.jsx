import styles from "./Investments.module.css";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { Link } from "react-router-dom";

// function ScenarioList() {
//   const {
//     selectedScenario,
//     setSelectedScenario,
//     deselectScenario,
//     deselectInvestment,
//   } = useSelected();
//   const { scenarios } = useData();

//   function selectScenario(scenario) {
//     if (selectedScenario && scenario.id === selectedScenario.id) {
//       deselectScenario();
//     } else if (scenario.id !== 0) {
//       setSelectedScenario(scenario);
//       console.log(scenario);
//       deselectInvestment();
//     }
//   }
//   let scenariosList = scenarios;

//   // If the scenarios list is empty, display a placeholder item
//   if (scenariosList.length <= 0) {
//     scenariosList = [{ name: "No scenarios available...", id: null }];
//   }

//   return (
//     <section
//       className={`${styles["outer-container"]} ${styles["scenario-list-container"]}`}
//     >
//       <div
//         className={`${styles["inner-container"]} ${styles["scenario-list"]}`}
//       >
//         <h2 className={styles["scenario-list-title"]}>Scenarios:</h2>
//         <div className={styles["scenario-item-list"]}>
//           {scenariosList.map((scenario, index) => (
//             <div
//               key={index}
//               className={
//                 selectedScenario && scenario.id === selectedScenario.id
//                   ? `${styles["selected"]} ${styles["scenario-item"]}`
//                   : styles["scenario-item"]
//               }
//               onClick={
//                 scenario.id !== null ? () => selectScenario(scenario) : undefined
//               }
//             >
//               <span>{scenario.name}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

function ScenarioList() {
  const {
    selectedScenario,
    setSelectedScenario,
    deselectScenario,
    deselectInvestment,
    shared, 
    setShared 
  } = useSelected();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      console.log(scenario);
      deselectInvestment();
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


  // If the scenarios list is empty, display a placeholder item
  if (scenariosList.length <= 0) {
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
          {shared === true ? 
            (sharedScenariosList.map((shared_scenario, index) => (
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
              </div>
            ))) 
            :
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
              </div>
            )))
          }
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
      if(selectedInvestment && selectedInvestment.type !== investmentType.id){
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
        <h2>Types:</h2>
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
  const { selectedScenario, deselectInvestmentType, setSelectedInvestmentType } = useSelected();
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
      const duplicatedInvestmentType = await duplicateInvestmentType(selectedScenario.id, investmentType.id);
      if (duplicatedInvestmentType){
        setSelectedInvestmentType(duplicatedInvestmentType);
      }
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
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Create
              </button>
            </Link>
          ) : (
            <Link to="" className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
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
            disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
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
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Edit
              </button>
            </Link>
          ) : (
            <Link className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Edit
              </button>
            </Link>
          )}

          <button
            className={`${styles["action-button"]} ${styles["delete"]}`}
            onClick={handleDeleteButtonClick}
            disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
          >
            Delete
          </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestmentTypeInfo() {
  const { selectedInvestment, selectedInvestmentType } = useSelected();
  let investment = selectedInvestment;
  if (!investment) {
    investment = {
      account: null,
      value: null
    };
  }


  let type = selectedInvestmentType;
  if (!type) {
      type= {
        name: null,
        description: null,
        expected_change_value: null,
        expense_ratio: null,
        expected_income_value: null,
        taxability: null,
      }
  }

  return (
    <section className={styles["investment-basic-info"]}>
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
              {type.expected_change_type === "fixed" ? (
                <label className={styles["info-value"]}>{type.expected_change_value}</label>
              ) : type.expected_change_type === "normal" ? (
                <label className={styles["info-value"]}>
                  Mean: {type.expected_change_mean}, Std Dev: {type.expected_change_std_dev}
                </label>
              ) : (
                <label className={styles["info-value"]}></label>
              )}
            </div>
            <div className={styles["info-row"]}>
              <label className={styles["info-item"]}>Expense Ratio: </label>
              <label className={styles["info-value"]}>{type !== null && type.expense_ratio !== null ? `%${type.expense_ratio}` : ""}</label>
            </div>
            <div className={styles["info-row"]}>
              <label className={styles["info-item"]}>Expected Income: </label>
              {type.expected_income_type === "fixed" ? (
                <label className={styles["info-value"]}>{type.expected_income_value}</label>
              ) : type.expected_income_type === "normal" ? (
                <label className={styles["info-value"]}>
                  Mean: {type.expected_income_mean}, Std Dev: {type.expected_income_std_dev}
                </label>
              ) : (
                <label className={styles["info-value"]}></label>
              )}
            </div>
            <div className={styles["info-row"]}>
              <label className={styles["info-item"]}>Taxability: </label>
              <label className={styles["info-value"]}>{type.taxability}</label>
            </div>
          </div>
        </div>
      </section>
      <section className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          <div className={styles["investment-info"]}>
            <h2 className={styles["investment-title"]}>Investment Details:</h2>

            <div className={styles["info-row"]}>
              <label className={styles["info-item"]}>Account Tax Status: </label>
              <label className={styles["info-value"]}>{investment.tax_status}</label>
            </div>
            <div className={styles["info-row"]}>
              <label className={styles["info-item"]}>Current Value: </label>
              <label className={styles["info-value"]}>{investment !== null && investment.value !== null ? `$${investment.value.toLocaleString()}` : ""}</label>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export function get_type_from_id(investment_type_id, selectedScenario){
  if (selectedScenario === null || (selectedScenario && selectedScenario.InvestmentTypes === null)){
    return null;
  }

  return selectedScenario.InvestmentTypes.find(
    (type) => String(type.id) === String(investment_type_id)
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
      setSelectedInvestmentType(get_type_from_id(investment.investment_type_id, selectedScenario))
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
                {get_type_from_id(investment.investment_type_id, selectedScenario)?.name ?? "—"}
              </span>
  
              <span className={styles["investment-span"]}>
                {investment?.tax_status ?? "—"}
              </span>
    
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

function InvestmentActions({ investment }) {
  const { selectedScenario, deselectInvestment, setSelectedInvestment, setSelectedInvestmentType } = useSelected();
  const { duplicateInvestment, deleteInvestment } = useData();

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

  async function handleDuplicateButtonClick() {
    if (investment.id !== null && selectedScenario?.id) {
      const duplicated_investment = await duplicateInvestment(selectedScenario.id, investment.id);
      if (duplicated_investment){
        setSelectedInvestmentType(get_type_from_id(duplicated_investment.investment_type_id, selectedScenario));
        setSelectedInvestment(duplicated_investment);
      }
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
          <div className={styles["button-container"]}>
            {selectedScenario ? (
              <Link to="/create-investment" className={styles["action-button"]}>
                <button
                  className={`${styles["action-button"]} ${styles["create"]}`}
                  disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
                >
                  Create
                </button>
              </Link>
            ) : (
              <Link to="" className={styles["action-button"]}>
                <button
                  className={`${styles["action-button"]} ${styles["create"]}`}
                  disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
                >
                  Create
                </button>
              </Link>
            )}

            <h3 className={styles["selected-header"]}>
              <label>Selected:</label>
              <label>{(investment !== null && get_type_from_id(investment.investment_type_id, selectedScenario)?.name) || "None!"}</label>
            </h3>

            <button
              className={`${styles["action-button"]} ${styles["duplicate"]}`}
              onClick={handleDuplicateButtonClick}
              disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
            >
              Duplicate
            </button>

            {investment && investment.id !== null ? (
              <Link
                to={`/edit-investment/${investment?.id}`}
                className={styles["action-button"]}
              >
                <button
                  className={`${styles["action-button"]} ${styles["edit"]}`}
                  disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
                >
                  Edit
                </button>
              </Link>
            ) : (
              <Link
                className={styles["action-button"]}
              >
                <button
                  className={`${styles["action-button"]} ${styles["edit"]}`}
                  disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
                >
                  Edit
                </button>
              </Link>
            )}

            <button
              className={`${styles["action-button"]} ${styles["delete"]}`}
              onClick={handleDeleteButtonClick}
              disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
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

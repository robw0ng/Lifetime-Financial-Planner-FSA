import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import styles from "./Strategies.module.css";
import { get_type_from_id } from "./Investments";

function get_investment_from_special_id(investment_special_id, selectedScenario){
  if (selectedScenario === null || (selectedScenario && selectedScenario.Investments === null)){
    return null;
  }

  const investment_obj =  selectedScenario.Investments.find(
    (investment) => investment.special_id === investment_special_id
  );

  return investment_obj;
}

function get_type_from_special_id(investment_special_id, selectedScenario){
  const investment_obj = get_investment_from_special_id(investment_special_id, selectedScenario);

  if (investment_obj){
    return get_type_from_id(investment_obj.investment_type_id, selectedScenario);    
  }
  return null;
}

function get_expense_from_id(expense_id, selectedScenario){
  console.log("expense_id:", expense_id);
  const expense_obj = selectedScenario.EventSeries.find((event) => Number(event.id) === Number(expense_id));
  console.log("expense returned", expense_obj);
  return expense_obj;
}

function ScenarioList() {
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

function StrategyList({ title, strategyKey, strategyItems }) {
  const { selectedScenario } = useSelected();
  const { reorderStrategy } = useData();

  function handleMove(index, direction) {
    const toIndex = direction === "up" ? index - 1 : index + 1;
    reorderStrategy(selectedScenario.id, strategyKey, index, toIndex);
  }

  return (
    <div className={`${styles["outer-container"]} ${styles["strategies-list-container"]}`}>
      <div className={`${styles["inner-container"]} ${styles["strategies-list"]}`}>
        <h2 className={styles["title"]}>{title}</h2>
        <div className={styles["strategy-list-header"]}>
          <span className={styles["strategy-span"]}>Move</span>
          <span>|</span>
          <span className={styles["strategy-span"]}>Name</span>
          <span>|</span>
          <span className={styles["strategy-span"]}>Value</span>
        </div>
        {strategyItems.length === 0 ? (
          <div className={styles["strategy-item"]}>
            <span className={styles["strategy-span"]}>—</span>
            <span className={styles["strategy-span"]}>—</span>
            <span className={styles["strategy-span"]}>—</span>
          </div>
        ) : (
          strategyItems.map((item, index) => (
            <div key={index} className={styles["strategy-item"]}>
              <span className={`${styles["strategy-span"]} ${styles["move-controls"]}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "up");
                  }}
                  disabled={index <= 0 || (selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw")}
                  className={styles["move-button"]}
                >
                  ⬆️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "down");
                  }}
                  disabled={index >= strategyItems.length - 1 || (selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw")}
                  className={styles["move-button"]}
                >
                  ⬇️
                </button>
              </span>
              <span className={styles["strategy-span"]}>
                {get_type_from_special_id(item, selectedScenario)?.name || get_expense_from_id(item, selectedScenario)?.name || "—"}
              </span>
              <span className={styles["strategy-span"]}>
                ${get_investment_from_special_id(item, selectedScenario)?.value?.toLocaleString() || get_expense_from_id(item, selectedScenario)?.initial_amount || "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Strategies() {
  const { selectedScenario } = useSelected();

  return (
    <main className={`${styles["strategies"]}`}>
      <section className={`${styles['column']} ${styles["actions"]}`}>
        <ScenarioList />
      </section>

      <section className={`${styles['column']} ${styles["spending"]}`}>
        <StrategyList
          title="Spending"
          strategyKey="spending_strategy"
          strategyItems={selectedScenario?.spending_strategy || []}
        />
      </section>

      <section className={`${styles['column']} ${styles["expense"]}`}>
        <StrategyList
          title="Expense Withdrawal"
          strategyKey="expense_withdrawl_strategy"
          strategyItems={selectedScenario?.expense_withdrawl_strategy || []}
        />
      </section>

      <section className={`${styles['column']} ${styles["roth"]}`}>
        <StrategyList
          title="Roth Conversion"
          strategyKey="roth_conversion_strategy"
          strategyItems={selectedScenario?.roth_conversion_strategy || []}
        />
      </section>

      <section className={`${styles['column']} ${styles["rmd"]}`}>
        <StrategyList
          title="RMD"
          strategyKey="rmd_strategy"
          strategyItems={selectedScenario?.rmd_strategy || []}
        />
      </section>
    </main>
  );
}

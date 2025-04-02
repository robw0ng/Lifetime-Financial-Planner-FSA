import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import styles from "./Strategies.module.css";

function ScenarioList() {
  const {
    selectedScenario,
    setSelectedScenario,
    deselectScenario,
  } = useSelected();
  const { scenarios } = useData();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
    }
  }
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
            <span className={styles["strategy-span"]}>None</span>
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
                  disabled={index <= 0}
                  className={styles["move-button"]}
                >
                  ⬆️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "down");
                  }}
                  disabled={index >= strategyItems.length - 1}
                  className={styles["move-button"]}
                >
                  ⬇️
                </button>
              </span>
              {item?.type && <span>:</span>}

              <span className={styles["strategy-span"]}>
                {item.type?.name || item.name}
              </span>

              {item?.type && <span>:</span>}
              <span className={styles["strategy-span"]}>
                ${item.value?.toLocaleString() ?? "—"}
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
          strategyKey="spendingStrategy"
          strategyItems={selectedScenario?.spendingStrategy || []}
        />
      </section>

      <section className={`${styles['column']} ${styles["expense"]}`}>
        <StrategyList
          title="Expense Withdrawal"
          strategyKey="expenseWithdrawalStrategy"
          strategyItems={selectedScenario?.expenseWithdrawalStrategy || []}
        />
      </section>

      <section className={`${styles['column']} ${styles["roth"]}`}>
        <StrategyList
          title="Roth Conversion"
          strategyKey="rothConversionStrategy"
          strategyItems={selectedScenario?.rothConversionStrategy || []}
        />
      </section>

      <section className={`${styles['column']} ${styles["rmd"]}`}>
        <StrategyList
          title="RMD"
          strategyKey="rmdStrategy"
          strategyItems={selectedScenario?.rmdStrategy || []}
        />
      </section>
    </main>
  );
}

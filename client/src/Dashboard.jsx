import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";
import styles from "./Dashboard.module.css";

function ScenarioList() {
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

  const { scenarios, setScenarios } = useData();
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

function Summary(){
  const {selectedScenario} = useSelected();
  const totalPortfolioValue = selectedScenario?.investments
    ? Array.from(selectedScenario.investments).reduce((sum, investment) => sum + investment.value, 0)
    : 0;
    const formatToDollars = (value) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);

    const formattedPortfolioValue = formatToDollars(totalPortfolioValue);
  return (
    <div className={styles["summary"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
        <h2 className={styles["summary-title"]}>Summary:</h2>
          <div className={styles["active-scenario"]}>
            <span>📊 Active Scenario: </span>
            <span>{selectedScenario?.name ?? "None Selected!"}</span>
          </div>
          <div className={styles["total-portfolio-value"]}>
            <span>💰 Total Portfolio Value: </span>
            <span>{formattedPortfolioValue}</span>
          </div>
          <div className={styles["last-simulation-run"]}>
            <span>📈 Last Simulation Run: </span>
          </div>
          <div className={styles["probability-success"]}>
            <span>🎯 Probability Of Success: </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessGraph(){
  return (
    <div className={styles["success-graph"]}>
        <div className={styles["outer-container"]}>
          <div className={styles["inner-container"]}>
            SUCCESS GRAPH HERE
          </div>
        </div>
    </div>
  )
}

function InvestmentsGraph(){
  return (
    <div className={styles["investment-graph"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          INVESTMENTS GRAPH HERE
        </div>
      </div>
    </div>

  )
}

export default function Dashboard(){
    return (
        <div className={styles["dashboard"]}>
            <div className={`${styles["column"]} ${styles["col-1"]}`}> 
                <Summary />
                <ScenarioList />
            </div>
            <div className={`${styles["column"]} ${styles["col-2"]}`}>
              <SuccessGraph />
              <InvestmentsGraph />
            </div>
        </div>
    )
}
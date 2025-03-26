import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import "./EventSeries.css"; // reusing your existing styles
import { Link } from "react-router-dom";
import './Strategies.css';

function ScenarioList() {
    const { selectedScenario, setSelectedScenario, deselectScenario } = useSelected();

    function selectScenario(scenario){
        if (selectedScenario && (scenario.id === selectedScenario.id)){
            deselectScenario();
        }
        else if (scenario.id !== 0){
            setSelectedScenario(scenario);
        }
    }

    const {scenarios, setScenarios} = useData();
    let scenariosList = scenarios;
    // console.log(scenariosList);

    if (scenariosList.length <= 0) {
        scenariosList = [{ name: 'No scenarios available...', id: null }];
    }

    return (
        <section className={"scenarioListContainer"}>
            <div className={"scenarioList"}>
                <div className={"title"}>
                    <h2 className={"title"}>Scenarios:</h2>
                    <div className={"header"}>
                        <span>Name:</span>
                    </div>
                    {scenariosList.map((scenario, index) => (
                        <div
                            key={index}
                            className={
                                selectedScenario && (scenario.id === selectedScenario.id)
                                    ? "selectedScenarioItem"
                                    : "scenarioItem"
                            }
                            onClick={scenario.id !== null ? () => selectScenario(scenario) : undefined}
                        >
                            <span>{scenario.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SpendingStrategyList() {
    const {
      selectedScenario,
      setSelectedScenario,
      selectedStrategy,
      deselectStrategy,
      selectedStrategyItem,
      setSelectedStrategy,
      setSelectedStrategyItem,
      deselectStrategyItem,
    } = useSelected();

    const { reorderSpendingStrategy } = useData(); // use the context function
  
    let spendingStrategy = [];
    if (selectedScenario) {
      spendingStrategy = Array.from(selectedScenario.spendingStrategy);
    }
  
    if (!selectedScenario || spendingStrategy.length === 0) {
      spendingStrategy = [
        {
          id: null,
          name: "No expenses to show!",
          startYear: null,
          duration: null,
        },
      ];
    }
  
    function handleMove(index, direction) {
        if (!selectedScenario) return;
      
        const targetIndex = direction === "up" ? index - 1 : index + 1;
      
        reorderSpendingStrategy(selectedScenario.id, index, targetIndex);
        console.log(selectedScenario)
    }

    return (
      <div className="strategies-list-container">  
        <div className="strategies-inner">
          <h2 className="title">Spending Strategy</h2>
          <div className="header">
            <span className="strategies-span">Move</span>
            <span className="strategies-span">Name</span>
            <span className="strategies-span">Year</span>
          </div>
          {spendingStrategy.map((spend, index) => (
            <div
              key={index}
              className={
                selectedStrategyItem === spend
                  ? "selected-strategy-item"
                  : "strategy-item"
              }
            >
            <span className="strategies-span move-controls">
            <button
                onClick={(e) => {
                e.stopPropagation();
                handleMove(index, "up");
                }}
                disabled={index <= 0}
                className="move-button"
            >
                ⬆️
            </button>
            <button
                onClick={(e) => {
                e.stopPropagation();
                handleMove(index, "down");
                }}
                disabled={index >= spendingStrategy.length - 1}
                className="move-button"
            >
                ⬇️
            </button>
            </span>

              <span className="strategies-span">{spend.name}</span>
              <span className="strategies-span">
                {spend.startYear?.value ?? ""}
              </span>
            </div>
          ))}
        </div>
      </div>
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
      <div className="strategies-list-container">
        <div className="strategies-inner">
          <h2 className="title">{title}</h2>
          <div className="header">
            <span className="strategies-span">Move</span>
            <span className="strategies-span">Name</span>
            <span className="strategies-span">Value</span>
          </div>
          {strategyItems.length === 0 ? (
            <div className="strategy-item">
              <span className="strategies-span">—</span>
              <span className="strategies-span">None</span>
              <span className="strategies-span">—</span>
            </div>
          ) : (
            strategyItems.map((item, index) => (
              <div key={index} className="strategy-item">
                <span className="strategies-span move-controls">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "up");
                    }}
                    disabled={index <= 0}
                    className="move-button"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "down");
                    }}
                    disabled={index >= strategyItems.length - 1}
                    className="move-button"
                  >
                    ⬇️
                  </button>
                </span>
                <span className="strategies-span">{item.type?.name || item.name}</span>
                <span className="strategies-span">
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

  const spendingStrategy = selectedScenario?.spendingStrategy || [];
  const expenseWithdrawalStrategy = selectedScenario?.expenseWithdrawalStrategy || [];
  const rothConversionStrategy = selectedScenario?.rothConversionStrategy || [];
  const rmdStrategy = selectedScenario?.rmdStrategy || [];

  return (
    <main className="event-series">
        <section className="actions column">
            <ScenarioList />
        </section>

        <section className="spending column">
            {/* <SpendingStrategyList scenario={selectedScenario} /> */}
            <StrategyList
            title="Spending Strategy"
            strategyKey="spendingStrategy"
            strategyItems={selectedScenario?.spendingStrategy || []}
            />
        </section>

        <section className="expense column">
            <StrategyList
            title="Expense Withdrawal Strategy"
            strategyKey="expenseWithdrawalStrategy"
            strategyItems={selectedScenario?.expenseWithdrawalStrategy || []}
            />
        </section>

        <section className="roth column">
            <StrategyList
            title="Roth Conversion Strategy"
            strategyKey="rothConversionStrategy"
            strategyItems={selectedScenario?.rothConversionStrategy || []}
            />
        </section>

        <section className="rmd column">
            <StrategyList
            title="RMD Strategy"
            strategyKey="rmdStrategy"
            strategyItems={selectedScenario?.rmdStrategy || []}
            />
        </section>
    </main>
  );
}

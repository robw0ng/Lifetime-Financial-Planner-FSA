import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { ScenarioList } from "./Scenarios";
import "./EventSeries.css"; // reusing your existing styles
import { Link } from "react-router-dom";
import './Strategies.css';

function StrategyActions({}){
    return (
        <div>test</div>
    );
}

function StrategySection({ title, items, itemType }) {
  return (
    <div className="strategies-list-container">
      <div className="strategies-actions">
        <h2 className="title">{title}</h2>
        <div className="header">
          <span className="strategies-span">Name</span>
          {itemType === "investment" && <span className="investment-span">Value</span>}
          <span className="investment-span">Type</span>
        </div>
        {items.length === 0 ? (
          <div className="investmentItem">
            <span className="investment-span">None</span>
            {itemType === "investment" && <span className="investment-span">—</span>}
            <span className="investment-span">—</span>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id ?? index} className="investmentItem">
              <span className="investment-span">{item.name || item.type?.name || "Unnamed"}</span>
              {itemType === "investment" && (
                <span className="investment-span">
                  ${item.value?.toLocaleString() ?? "—"}
                </span>
              )}
              <span className="investment-span">{item.type || item.type?.name || "—"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function  ScenarioActions({ scenario }){
    const isScenarioSelected = scenario;
    // const { duplicateScenario, deleteScenario } = useData();
    // const { deselectScenario } = useSelected();
    if (!scenario) {
        scenario = {
            id: null,
            name: "None!",
        };
    }

    // function handleDeleteButtonClick() {
    //     if (scenario.id !== null) {
    //         const confirmDelete = window.confirm("Are you sure you want to delete this scenario?");
    //         if (confirmDelete) {
    //             deleteScenario(scenario.id);
    //             deselectScenario();
    //         }
    //     }
    // }

    // function handleDuplicateButtonClick() {
    //     if (scenario.id !== null) {
    //         duplicateScenario(scenario.id);
    //     }
    // }

    return (
      <section className={'strategies-actions-container'}>
        <div className={'strategies-actions'}>
            <h2 className={''}>Actions:</h2>
            <Link to="/create-scenario" className={'action-button create-btn'}>
                Create New Scenario
            </Link>

            <h3 className={''}>
            <label className={''}>Selected Scenario: <br></br></label>
            <label className={''}>{scenario.name}</label>
            </h3>
            <button className={`action-button dup-btn`} onClick={undefined}>Duplicate Scenario</button>
            {isScenarioSelected ? (
                <Link to={`/edit-scenario/${scenario.id}`} className={'action-button edit-btn'}>
                    Edit Scenario
                </Link>
            ) : (
                <Link className={`action-button edit-btn`}>
                    Edit Scenario
                </Link>
            )}
            <button className={`action-button del-btn`} onClick={undefined} >Delete Scenario</button>
        </div>
      </section>
    );
};

export default function Strategies() {
  const { selectedScenario } = useSelected();

  const spendingStrategy = selectedScenario?.spendingStrategy || [];
  const expenseWithdrawalStrategy = selectedScenario?.expenseWithdrawalStrategy || [];
  const rothConversionStrategy = selectedScenario?.rothConversionStrategy || [];
  const rmdStrategy = selectedScenario?.rmdStrategy || [];

  return (
    <main className="event-series">
      <section className="actions column">
        <StrategyActions />
        <ScenarioList />
      </section>

      <section className="spending column">
        <StrategySection
          title="Spending Strategy (Discretionary Expenses)"
          items={spendingStrategy}
          itemType="event"
        />

      </section>
    {/* <section className="expense column">
        <StrategySection
          title="Expense Withdrawal Strategy"
          items={expenseWithdrawalStrategy}
          itemType="investment"
        />
    </section>
      <section className="roth column">
        <StrategySection
          title="Roth Conversion Strategy"
          items={rothConversionStrategy}
          itemType="investment"
        />
      </section>
    <section className="rmd column">
        <StrategySection
            title="RMD Strategy"
            items={rmdStrategy}
            itemType="investment"
            />
    </section> */}

    </main>
  );
}

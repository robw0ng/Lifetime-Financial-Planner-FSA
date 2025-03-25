import "./Investments.css";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

function ScenarioList() {
    const { selectedScenario, setSelectedScenario, deselectScenario } = useSelected();
    const { scenarios } = useData();

    function selectScenario(scenario){
        if (selectedScenario && (scenario.id === selectedScenario.id)){
            deselectScenario();
        }
        else if (scenario.id !== 0){
            setSelectedScenario(scenario);
        }
    }
    let scenariosList = scenarios;

    // If the scenarios list is empty, display a placeholder item
    if (scenariosList.length <= 0) {
        scenariosList = [{ name: 'No scenarios to show...', id: null }];
    }

    return (
        <section className="scenarioListContainer">
            <div className="scenario-list">
                <div className="title">
                    <h2 className="title">Scenarios:</h2>
                    <div className="header">
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

function InvestmentList(){
    const { selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment, deselectInvestment } = useSelected();

    function selectInvestment(investment){
        if (selectedInvestment && (investment.id === selectedInvestment.id)){
            deselectInvestment();
        }
        else if (investment.id !== null || investment.id !== 0){
            setSelectedInvestment(investment);
        }
    }

    let investmentsArray = [];

    if (selectedScenario){
        investmentsArray = Array.from(selectedScenario.investments);
    }

    if (investmentsArray.length == 0){
        investmentsArray = [{id: null, type: {name:'No investments Available'}, value: ''}]
    }

    return (
        <div className="investmentListContainer">
            <div className="investmentList">
                <h2 className="title">Investments:</h2>
                <div className="header">
                    <span className="investment-span">Type</span>
                    <span className="investment-span">Account</span>
                    <span className="investment-span">Value</span>
                </div>
                {investmentsArray.map((investment, index) => (
                    <div key={index} className={
                        selectedInvestment && (investment.id === selectedInvestment.id)
                        ? "selectedInvestmentItem"
                        : "investmentItem"
                    }
                    onClick={investment.id !== null ? () => selectInvestment(investment): undefined}
                    >
                    <span className="investment-span">{investment.type.name}</span>
                    <span className="investment-span">{investment.account}</span>
                    <span className="investment-span">${investment.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

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
    }
  }

  const type = investment.type;

  return (
    <section className={"investment-info-container"}>
    <div className={"investment-inner-container"}>
      <h2 className={"investment-title"}>
        Investment Type Details:
      </h2>
        <div className={"info-row"}>
          <label className={"info-item"}>Name: </label>
          <label className={""}>{type.name}</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Description: </label>
          <label className={""}>{type.description}</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Expected Annual Return: </label>
          <label className={""}>{type.expectedChange}</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Expense Ratio: </label>
          <label className={""}>{type.expenseRatio}%</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Expected Income: </label>
          <label className={""}>{type.expectedIncome}</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Taxability: </label>
          <label className={""}>{type.taxability}</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Account Tax Status: </label>
          <label className={""}>{investment.account}</label>
        </div>
        <div className={"info-row"}>
          <label className={"info-item"}>Current Value: </label>
          <label className={""}>${investment.value.toLocaleString()}</label>
        </div>
      </div>
    </section>
  );
}


function InvestmentActions({ investment }){

    // const isScenarioSelected = scenario;
    // const { duplicateScenario, deleteScenario } = useData();
    // const { deselectScenario } = useSelected();
    if (!investment) {
        investment = {
            id: null,
            type: {name:"None!"},
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
      <section className="investment-actions-container">
        <div className="investment-actions">
            <h2 className="">Investment Actions:</h2>
            <Link to="/create-scenario" className="action-button create-btn">
                Create New Investment
            </Link>

            <h3 className="">
            <label className="">Selected Investment:</label>
            <label className="">{investment.type.name}</label>
            </h3>
            <button className="action-button dup-btn" onClick={undefined}>Duplicate Investment</button>
                <Link className="action-button edit-btn">
                    Edit Investment
                </Link>
            <button className="action-button del-btn" onClick={undefined} >Delete Investment</button>
        </div>
      </section>
    );
};

export default function Investments(){
    const { selectedInvestment } = useSelected();
    return (
        <main className="investments">
            <section className="column">
                <InvestmentActions investment={selectedInvestment}/>
                <ScenarioList />
            </section>
            <section className="column">
                <InvestmentList />
            </section>
            <section className="column">
                <InvestmentTypeInfo investment={selectedInvestment}/>
            </section>
        </main>

    )
}
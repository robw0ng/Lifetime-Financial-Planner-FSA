"use client";
import React, { useState } from "react";
import styles from "./Scenarios.module.css";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import { Link } from "react-router-dom";

function ScenarioActions({ scenario }) {
	const isScenarioSelected = scenario;
	const { duplicateScenario, deleteScenario } = useData();
	const { deselectScenario } = useSelected();
	if (!scenario) {
		scenario = {
			id: null,
			name: "None!",
		};
	}

	function handleDeleteButtonClick() {
		if (scenario.id !== null) {
			const confirmDelete = window.confirm("Are you sure you want to delete this scenario?");
			if (confirmDelete) {
				deleteScenario(scenario.id);
				deselectScenario();
			}
		}
	}

	function handleDuplicateButtonClick() {
		if (scenario.id !== null) {
			duplicateScenario(scenario.id);
		}
	}

	return (
		<section className={styles.scenarioActionsContainer}>
			<div className={styles.scenarioActions}>
				<h2 className={styles.actionsHeader}>Actions:</h2>
				<Link to="/create-scenario" className={`${styles.actionButton} ${styles.createNewScenario}`}>
					Create New Scenario
				</Link>

				<h3 className={styles.selectedScenario}>
					<label className={styles.underline}>
						Selected Scenario: <br></br>
					</label>
					<label className={styles.value}>{scenario.name}</label>
				</h3>
				<button
					className={`${styles.actionButton} ${styles.duplicateScenario}`}
					onClick={handleDuplicateButtonClick}>
					Duplicate Scenario
				</button>
				{isScenarioSelected ? (
					<Link
						to={`/edit-scenario/${scenario.id}`}
						className={`${styles.actionButton} ${styles.editScenario}`}>
						Edit Scenario
					</Link>
				) : (
					<Link className={`${styles.actionButton} ${styles.editScenario}`}>Edit Scenario</Link>
				)}
				<button className={`${styles.actionButton} ${styles.deleteScenario}`} onClick={handleDeleteButtonClick}>
					Delete Scenario
				</button>
			</div>
		</section>
	);
}

function BasicInformation({ scenario }) {
	if (!scenario) {
		scenario = {
			name: "",
			isMarried: false,
			lifeExpectancySpouse: "",
			birthYear: "",
			lifeExpectancy: "",
			stateOfResidence: "",
			financialGoal: "",
			inflationAssumption: "",
		};
	}

	return (
		<section className={styles.basic_info}>
			<h2 className={styles.sectionTitle}>Basic Information:</h2>
			<div className={styles.info_values}>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Name:</p>
					<p className={styles.info_value}>{scenario.name}</p>
				</div>
				{/* <div className={styles.info_row}>
                <p className={styles.info_item}>Description:</p>
                <p className={styles.info_value}>{scenario.description}</p>
            </div> */}
				<div className={styles.info_row}>
					<p className={styles.info_item}>Marital Status:</p>
					<p className={styles.info_value}>{scenario.isMarried ? "Married" : "Single"}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Spouse Life Expectancy:</p>
					<p className={styles.info_value}>{scenario.lifeExpectancySpouse}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Birth Year:</p>
					<p className={styles.info_value}>{scenario.birthYear}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Life Expectancy:</p>
					<p className={styles.info_value}>{scenario.lifeExpectancy}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>State:</p>
					<p className={styles.info_value}>{scenario.stateOfResidence}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Financial Goal:</p>
					<p className={styles.info_value}>{scenario.financialGoal}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Inflation Assumption:</p>
					<p className={styles.info_value}>{scenario.inflationAssumption}</p>
				</div>
			</div>
		</section>
	);
}

function CashBalance({ scenario }) {
	let cashInvestment = 0;

	scenario.investments.forEach((investment) => {
		if (investment.type === "cash") {
			cashInvestment = investment.value;
		}
	});

	return (
		<section className={styles.cashSection}>
			<h2 className={styles.sectionTitle}>Account Balance: {cashInvestment}</h2>
		</section>
	);
}

function InvestmentList({ scenario }) {
	let investmentsArray = [];

	const { setSelectedInvestment } = useSelected();

	if (scenario) {
		investmentsArray = Array.from(scenario.investments);
	}

	if (investmentsArray.length == 0) {
		investmentsArray = [{ id: null, type: { name: "No investments Available" }, value: "" }];
	}
	const topInvestments = investmentsArray.sort((a, b) => b.value - a.value).slice(0, 3);

	function selectInvestment(investment) {
		if (investment.id !== null || investment.id !== 0) {
			setSelectedInvestment(investment);
		}
	}

	return (
		<div className={styles.investmentList}>
			<div className={styles.title}>
				<h2 className={styles.title}>Top Investments:</h2>
				<div className={styles.header}>
					<span>Type</span>
					<span>Value</span>
				</div>
				{topInvestments.map((investment, index) => (
					<Link
						key={index}
						to="/investments"
						onClick={investment.id !== null ? () => selectInvestment(investment) : undefined}>
						<div className={styles.investmentItem}>
							<span>{investment.type.name}</span>
							<span>${investment.value.toLocaleString()}</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

function Settings({ scenario }) {
	if (!scenario) {
		scenario = {
			preTaxContributionLimit: "",
			afterTaxContributionLimit: "",
			rothConversionOptimizerEnabled: false,
			rothConversionOptimizerStartYear: "",
			rothConversionOptimizerEndYear: "",
		};
	}

	let start = scenario.rothConversionOptimizerStartYear;
	let end = scenario.rothConversionOptimizerEndYear;

	return (
		<section className={styles.settingsContainer}>
			<h2 className={styles.sectionTitle}>Settings and Limits:</h2>
			<div className={styles.info_values}>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Pre-Tax Contribution Limit:</p>
					<p className={styles.info_value}>{scenario.preTaxContributionLimit}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>After-Tax Contribution Limit:</p>
					<p className={styles.info_value}>{scenario.afterTaxContributionLimit}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Roth Optimizer Enabled:</p>
					<p className={styles.info_value}>{scenario.rothConversionOptimizerEnabled ? "Yes" : "No"}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Roth Optimizer Start Year:</p>
					<p className={styles.info_value}>{scenario.rothConversionOptimizerStartYear}</p>
				</div>
				<div className={styles.info_row}>
					<p className={styles.info_item}>Roth Optimizer End Year:</p>
					<p className={styles.info_value}>{scenario.rothConversionOptimizerEndYear}</p>
				</div>
			</div>
		</section>
	);
}

function ScenarioInfo({ scenario }) {
	return (
		<section className={styles.info_container}>
			<BasicInformation scenario={scenario} />
			<InvestmentList scenario={scenario} />

			<Settings scenario={scenario} />
		</section>
	);
}

export function ScenarioList() {
	const { selectedScenario, setSelectedScenario, deselectScenario } = useSelected();

	function selectScenario(scenario) {
		if (selectedScenario && scenario.id === selectedScenario.id) {
			deselectScenario();
		} else if (scenario.id !== 0) {
			setSelectedScenario(scenario);
		}
	}

	const { scenarios, setScenarios } = useData();
	let scenariosList = scenarios;
	console.log(scenariosList);

	if (scenariosList.length <= 0) {
		scenariosList = [{ name: "No scenarios available...", id: null }];
	}

	return (
		<section className={styles.scenarioListContainer}>
			<div className={styles.scenarioList}>
				<div className={styles.title}>
					<h2 className={styles.title}>Scenarios:</h2>
					<div className={styles.header}>
						<span>Name:</span>
					</div>
					{scenariosList.map((scenario, index) => (
						<div
							key={index}
							className={
								selectedScenario && scenario.id === selectedScenario.id
									? styles.selectedScenarioItem
									: styles.scenarioItem
							}
							onClick={scenario.id !== null ? () => selectScenario(scenario) : undefined}>
							<span>{scenario.name}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

const Scenarios = () => {
	const { selectedScenario, setSelectedScenario } = useSelected();

	return (
		<main className={styles.scenarios}>
			<section className={styles.column}>
				<ScenarioActions scenario={selectedScenario} />
				<ScenarioList />
			</section>
			<section className={styles.column}>
				<ScenarioInfo scenario={selectedScenario} />
			</section>
		</main>
	);
};

export default Scenarios;
// "use client";
// import React from "react";
// import styles from "./Scenarios.module.css";
// import { useSelectedScenario } from "./SelectedContext";

// function  ScenarioActions({ scenario }){
//     return (
//       <section className={styles.scenarioActions}>
//         <h2 className={styles.actionsHeader}>Actions:</h2>
//         <button className={styles.createNewScenario}>Create New Scenario</button>
//         <h3 className={styles.selectedScenario}>
//           <span className={styles.underline}>Selected Scenario: {scenario.name}</span>
//         </h3>
//         <div className={styles.actionButtons}>
//           <button className={styles.duplicateScenario}>Duplicate Scenario</button>
//           <button className={styles.editScenario}>Edit Scenario</button>
//         </div>
//         <button className={styles.deleteScenario}>Delete Scenario</button>
//       </section>
//     );
// };

// function BasicInformation({ scenario }) {
//     return (
//         <section className={styles.infoSection}>
//           <h2 className={styles.sectionTitle}>
//             Basic Information:
//           </h2>
//           <p className={styles.infoItem}>Name: {scenario.name}</p>
//           <p className={styles.infoItem}>Description: {scenario.description}</p>
//           <p className={styles.infoItem}>Marital Status: {scenario.isMarried}</p>
//           <p className={styles.infoItem}>Birth Year: {scenario.birthYear}</p>
//           <p className={styles.infoItem}>Life Expectancy: {scenario.lifeExpectancy}</p>
//           <p className={styles.infoItem}>State: {scenario.stateOfResidence}</p>
//           <p className={styles.infoItem}>Financial Goal: {scenario.financialGoal}</p>
//           <p className={styles.infoItem}>Inflation Assumption: {scenario.inflationAssumption}</p>
//         </section>
//     );
// }

// function CashBalance({scenario}){
//   let cashInvestment = 0;

//   scenario.investments.forEach(investment => {
//     if (investment.type === 'cash') {
//       cashInvestment = investment.value;
//     }
//   });

//   return (
//       <section className={styles.cashSection}>
//         <h2 className={styles.sectionTitle}>
//           Account Balance: {cashInvestment}
//         </h2>
//       </section>
//   );
// }

// function ScenarioInfo({ scenario }){
//     return (
//         <section className={styles.container}>
//             <BasicInformation scenario={scenario} />
//             <CashBalance scenario={scenario}/>
//         </section>
//     );
// }

// const Scenarios = () => {
//     const {selectedScenario, setSelectedScenario} = useSelectedScenario()
//     console.log(selectedScenario);
//     return (
//         <main className={styles.scenarios}>
//         <div className={styles.div4}>
//             <div className={styles.div}>
//             <section className={styles.column4}>
//                 <div className={styles.div5}>
//                 <ScenarioActions scenario={selectedScenario}/>
//                 <ScenarioInfo scenario={selectedScenario}/>
//                 </div>

//             </section>

//             </div>
//         </div>
//         </main>
//     );
// };

// export default Scenarios;

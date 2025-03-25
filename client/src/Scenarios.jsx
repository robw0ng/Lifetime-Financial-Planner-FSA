"use client";
import React, { useState } from "react";
import styles from "./Scenarios.module.css";
import { useSelectedScenario } from "./SelectedContext";
import CreateScenarioModal from "./modals/CreateScenarioModal";
import EditScenarioModal from "./modals/EditScenarioModal";
import DuplicateScenarioModal from "./modals/DuplicateScenarioModal";
import DeleteScenarioModal from "./modals/DeleteScenarioModal";

function ScenarioActions({ scenario }) {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalType) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  return (
    <section className={styles.scenarioActions}>
      <h2 className={styles.actionsHeader}>Actions:</h2>
      <button className={styles.createNewScenario} onClick={() => openModal("create")}>
        Create New Scenario
      </button>

      <h3 className={styles.selectedScenario}>
        <span className={styles.underline}>Selected Scenario: {scenario.name}</span>
      </h3>

      <div className={styles.actionButtons}>
        <button className={styles.duplicateScenario} onClick={() => openModal("duplicate")}>
          Duplicate Scenario
        </button>
        <button className={styles.editScenario} onClick={() => openModal("edit")}>
          Edit Scenario
        </button>
      </div>

      <button className={styles.deleteScenario} onClick={() => openModal("delete")}>
        Delete Scenario
      </button>

      {/* Render modals dynamically based on activeModal */}
      {activeModal === "create" && <CreateScenarioModal onClose={closeModal} />}
      {activeModal === "edit" && <EditScenarioModal onClose={closeModal} scenario={scenario} />}
      {activeModal === "duplicate" && <DuplicateScenarioModal onClose={closeModal} scenario={scenario} />}
      {activeModal === "delete" && <DeleteScenarioModal onClose={closeModal} scenario={scenario} />}
    </section>
  );
}



function BasicInformation({ scenario }) {
    return (
        <section className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>
            Basic Information:
          </h2>
          <p className={styles.infoItem}>Name: {scenario.name}</p>
          <p className={styles.infoItem}>Description: {scenario.description}</p>
          <p className={styles.infoItem}>Marital Status: {scenario.isMarried}</p>
          <p className={styles.infoItem}>Birth Year: {scenario.birthYear}</p>
          <p className={styles.infoItem}>Life Expectancy: {scenario.lifeExpectancy}</p>
          <p className={styles.infoItem}>State: {scenario.stateOfResidence}</p>
          <p className={styles.infoItem}>Financial Goal: {scenario.financialGoal}</p>
          <p className={styles.infoItem}>Inflation Assumption: {scenario.inflationAssumption}</p>
        </section>
    );
}

function CashBalance({scenario}){
  let cashInvestment = 0;

  scenario.investments.forEach(investment => {
    if (investment.type === 'cash') {
      cashInvestment = investment.value;
    }
  });

  return (
      <section className={styles.cashSection}>
        <h2 className={styles.sectionTitle}>
          Account Balance: {cashInvestment}
        </h2>
      </section>
  );
}

function ScenarioInfo({ scenario }){
    return (
        <section className={styles.container}>
            <BasicInformation scenario={scenario} />
            <CashBalance scenario={scenario}/>
        </section>
    );
}


const Scenarios = () => {
    const {selectedScenario, setSelectedScenario} = useSelectedScenario()
    console.log(selectedScenario);
    return (
        <main className={styles.scenarios}>
        <div className={styles.div4}>
            <div className={styles.div}>
            <section className={styles.column4}>
                <div className={styles.div5}>
                <ScenarioActions scenario={selectedScenario}/>
                <ScenarioInfo scenario={selectedScenario}/>
                </div>

            </section>

            </div>
        </div>
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSelected } from './SelectedContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth(); // ✅ Use email from AuthContext
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment } = useSelected();
  
  // const mockScenarios = [
  //   {
  //     id: "1",
  //     name: "Unemployed",
  //     isMarried: false,
  //     birthYear: 1990,
  //     birthYearSpouse: null,
  //     lifeExpectancy: 85,
  //     lifeExpectancySpouse: null,
  //     inflationAssumption: 2.5,
  //     preTaxContributionLimit: 19000,
  //     afterTaxContributionLimit: 6000,
  //     sharingSettings: "Private",
  //     financialGoal: 1000000,
  //     stateOfResidence: "NY",
  //     rothConversionOptimizerEnabled: true,
  //     rothConversionOptimizerStartYear: 2025,
  //     rothConversionOptimizerEndYear: 2030,
      // investments: new Set([
      //   {
      //     id: "1",
      //     type: {
      //       name: "Stocks",
      //       description: "",
      //       expected_annual_return: "",
      //       expense_ratio: "",
      //       expected_annual_income: "",
      //       taxability: "",
      //     },
      //     account: "PTR",
      //     value: 15000,
      //   },
      // ]),
  //     events: new Set([
  //       {
  //         id: "ev1",
  //         name: "Part-Time Job Income",
  //         description: "Supplemental work during unemployment",
  //         type: "income",
  //         startYear: { value: 2024, type: "fixed" },
  //         duration: { value: 2, type: "fixed" },
  //         initialAmount: 12000,
  //         expectedChange: { value: "2%", type: "fixed" },
  //         inflationAdjusted: true,
  //         userPercentage: 100,
  //         isSocialSecurity: false,
  //       },
  //       {
  //         id: "ev2",
  //         name: "Rent",
  //         description: "Monthly housing cost",
  //         type: "expense",
  //         startYear: { value: 2024, type: "fixed" },
  //         duration: { value: 10, type: "fixed" },
  //         initialAmount: 18000,
  //         expectedChange: { value: "3%", type: "fixed" },
  //         inflationAdjusted: false,
  //         userPercentage: 100,
  //         isDiscretionary: false,
  //       },
  //       {
  //         id: "ev3",
  //         name: "Conservative Investing Strategy",
  //         description: "Basic 60/40 investment allocation",
  //         type: "invest",
  //         startYear: { value: 2025, type: "fixed" },
  //         duration: { value: 30, type: "fixed" },
  //         allocationType: "fixed",
  //         allocation: {
  //           "Stocks": 60,
  //           "Bonds": 40,
  //         },
  //         maxCash: 5000,
  //       },
  //     ]),
  //     spendingStrategy: [],
  //     rmdStrategy: [],
  //     rothConversionStrategy: [],
  //     expenseWithdrawalStrategy: [],
  //   },
  
  //   {
  //     id: "2",
  //     name: "Gaming",
  //     isMarried: true,
  //     birthYear: 1995,
  //     birthYearSpouse: 1997,
  //     lifeExpectancy: 80,
  //     lifeExpectancySpouse: 78,
  //     inflationAssumption: 3.0,
  //     preTaxContributionLimit: 18000,
  //     afterTaxContributionLimit: 5000,
  //     sharingSettings: "Public",
  //     financialGoal: 2000000,
  //     stateOfResidence: "CA",
  //     rothConversionOptimizerEnabled: false,
  //     rothConversionOptimizerStartYear: null,
  //     rothConversionOptimizerEndYear: null,
  //     investments: new Set(),
  //     events: new Set([
  //       {
  //         id: "ev4",
  //         name: "YouTube Income",
  //         type: "income",
  //         startYear: { value: 2023, type: "fixed" },
  //         duration: { value: 5, type: "normal" },
  //         initialAmount: 50000,
  //         expectedChange: { value: "N(5%, 2%)", type: "normal" },
  //         inflationAdjusted: true,
  //         userPercentage: 60,
  //         isSocialSecurity: false,
  //       },
  //       {
  //         id: "ev5",
  //         name: "Lifestyle Expenses",
  //         type: "expense",
  //         startYear: { value: 2023, type: "fixed" },
  //         duration: { value: 40, type: "fixed" },
  //         initialAmount: 30000,
  //         expectedChange: { value: "1%", type: "fixed" },
  //         inflationAdjusted: true,
  //         userPercentage: 50,
  //         isDiscretionary: true,
  //       },
  //       {
  //         id: "ev6",
  //         name: "Rebalancing Strategy",
  //         type: "rebalance",
  //         startYear: { value: 2024, type: "fixed" },
  //         duration: { value: 35, type: "fixed" },
  //         allocationType: "glide",
  //         allocation: {
  //           initial: {
  //             "Stocks": 70,
  //             "Bonds": 30,
  //           },
  //           final: {
  //             "Stocks": 50,
  //             "Bonds": 50,
  //           },
  //         },
  //       },
  //     ]),
  //     spendingStrategy: [
  //       {
  //         id: "ev101",
  //         name: "Lifestyle Expenses",
  //         type: "expense",
  //         startYear: { value: 2023, type: "fixed" },
  //         duration: { value: 40, type: "fixed" },
  //         initialAmount: 30000,
  //         expectedChange: { value: "1%", type: "fixed" },
  //         inflationAdjusted: true,
  //         userPercentage: 50,
  //         isDiscretionary: true,
  //       },
  //       {
  //         id: "ev102",
  //         name: "Vacation Travel",
  //         type: "expense",
  //         startYear: { value: 2025, type: "fixed" },
  //         duration: { value: 15, type: "fixed" },
  //         initialAmount: 12000,
  //         expectedChange: { value: "3%", type: "fixed" },
  //         inflationAdjusted: true,
  //         userPercentage: 100,
  //         isDiscretionary: true,
  //       },
  //       {
  //         id: "ev103",
  //         name: "Dining Out",
  //         type: "expense",
  //         startYear: { value: 2024, type: "fixed" },
  //         duration: { value: 35, type: "fixed" },
  //         initialAmount: 6000,
  //         expectedChange: { value: "2%", type: "fixed" },
  //         inflationAdjusted: false,
  //         userPercentage: 70,
  //         isDiscretionary: true,
  //       },
  //       {
  //         id: "ev104",
  //         name: "Entertainment Subscriptions",
  //         type: "expense",
  //         startYear: { value: 2023, type: "fixed" },
  //         duration: { value: 30, type: "fixed" },
  //         initialAmount: 1500,
  //         expectedChange: { value: "$50", type: "fixed" },
  //         inflationAdjusted: false,
  //         userPercentage: 90,
  //         isDiscretionary: true,
  //       },
  //       {
  //         id: "ev105",
  //         name: "Seasonal Shopping",
  //         type: "expense",
  //         startYear: { value: 2026, type: "fixed" },
  //         duration: { value: 20, type: "fixed" },
  //         initialAmount: 5000,
  //         expectedChange: { value: "1.5%", type: "fixed" },
  //         inflationAdjusted: true,
  //         userPercentage: 60,
  //         isDiscretionary: true,
  //       },
  //       {
  //         id: "ev106",
  //         name: "Hobbies and Gear",
  //         type: "expense",
  //         startYear: { value: 2024, type: "fixed" },
  //         duration: { value: 25, type: "fixed" },
  //         initialAmount: 8000,
  //         expectedChange: { value: "2.5%", type: "fixed" },
  //         inflationAdjusted: true,
  //         userPercentage: 75,
  //         isDiscretionary: true,
  //       },
  //     ],
      
  //     rmdStrategy: [
  //       {
  //         id: "inv3", // Real Estate Fund
  //         type: { name: "Real Estate Fund" },
  //         account: "PTR",
  //         value: 50000,
  //       },
  //       {
  //         id: "inv1", // S&P 500
  //         type: { name: "S&P 500" },
  //         account: "PTR",
  //         value: 60000,
  //       },
  //     ],
  //     rothConversionStrategy: [
  //       {
  //         id: "inv1", // S&P 500
  //         type: { name: "S&P 500" },
  //         account: "PTR",
  //         value: 60000,
  //       },
  //       {
  //         id: "inv3", // Real Estate Fund
  //         type: { name: "Real Estate Fund" },
  //         account: "PTR",
  //         value: 50000,
  //       },
  //     ],
  //     expenseWithdrawalStrategy: [
  //       {
  //         id: "inv4", // Cash
  //         type: { name: "Cash" },
  //         account: "NR",
  //         value: 10000,
  //       },
  //       {
  //         id: "inv2", // Municipal Bonds
  //         type: { name: "Municipal Bonds" },
  //         account: "NR",
  //         value: 20000,
  //       },
  //       {
  //         id: "inv5", // Crypto Index
  //         type: { name: "Crypto Index" },
  //         account: "ATR",
  //         value: 15000,
  //       },
  //     ],
  //   },
  // ];
  
  const localScenarios = []

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      setScenarios(localScenarios);
      
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createScenario = async (newScenario) => {
    try {
      if (user?.email) {
        // TODO: Uncomment when backend is set up
        // const response = await fetch('/api/scenarios', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...newScenario,
        //     email: user.email
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to create scenario');
        // }

        // const createdScenario = await response.json();

        // ✅ Add to the list without waiting for a re-fetch
        const createdScenario = { ...newScenario, id: `${Date.now()}` }
        setScenarios((prev) => [...prev, createdScenario]);
        return createdScenario;
      } else {
        // ✅ If no user email → Directly add to context
        const createdScenario = { ...newScenario, id: `${Date.now()}` }
        setScenarios((prev) => [...prev, createdScenario]);
        return createdScenario;
      }

    } catch (error) {
      console.error('Error creating scenario:', error);
    }
    return null
  };

  const editScenario = async (editedScenario) => {
    try {
      if (user?.email) {
        // TODO: Uncomment when backend is set up
        // const response = await fetch(`/api/scenarios/${editedScenario.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...editedScenario,
        //     email: user.email,
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to edit scenario');
        // }

        // const updatedScenario = await response.json();

        // ✅ Update the scenario in the list without waiting for a re-fetch
        const modifiedScenario = editedScenario;
        setScenarios((prev) =>
          prev.map((scenario) =>
            scenario.id === modifiedScenario.id ? modifiedScenario : scenario
          )
        );
        return modifiedScenario;
      } else {
        // ✅ If no user email → Directly update in context
        const modifiedScenario = editedScenario;
        setScenarios((prev) =>
          prev.map((scenario) =>
            scenario.id === modifiedScenario.id ? modifiedScenario : scenario
          )
        );
        return modifiedScenario;
      }
    } catch (error) {
      console.error('Error editing scenario:', error);
    }
    return null
  };

  const duplicateScenario = async (scenarioId) => {
    try {
      const scenarioToDuplicate = scenarios.find((scenario) => scenario.id === scenarioId);
      if (!scenarioToDuplicate) {
        console.error('Scenario not found for duplication');
        return;
      }

      const duplicatedScenario = {
        ...scenarioToDuplicate,
        id: `${Date.now()}`, // Assign a new unique ID
        name: `${scenarioToDuplicate.name} (Copy)`, // Append "Copy" to the name
      };

      if (user?.email) {
        // TODO: Uncomment when backend is set up
        // const response = await fetch('/api/scenarios', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     ...duplicatedScenario,
        //     email: user.email,
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to duplicate scenario');
        // }

        // const createdScenario = await response.json();
        // setScenarios((prev) => [...prev, createdScenario]);

        // ✅ Temporarily add to context until backend is ready
        setScenarios((prev) => [...prev, duplicatedScenario]);
        return duplicatedScenario;
      } else {
        // ✅ If no user email → Directly add to context
        setScenarios((prev) => [...prev, duplicatedScenario]);
        return duplicatedScenario;
      }
    } catch (error) {
      console.error('Error duplicating scenario:', error);
    }
    return null
  };

  const deleteScenario = async (scenarioId) => {
    try {
      if (user?.email) {
        // TODO: Uncomment when backend is set up
        // const response = await fetch(`/api/scenarios/${scenarioId}`, {
        //   method: 'DELETE',
        //   headers: { 'Content-Type': 'application/json' },
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to delete scenario');
        // }

        // ✅ Remove the scenario from the list without waiting for a re-fetch
        setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
      } else {
        // ✅ If no user email → Directly remove from context
        setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
  };

  // const createInvestment = async (scenarioId, newInvestment) => {
  //   try {
  //     const newInvestmentWithId = { ...newInvestment, id: `${Date.now()}` };
  
  //     let updatedScenarioToSelect = null;
  
  //     setScenarios((prevScenarios) =>
  //       prevScenarios.map((scenario) => {
  //         if (scenario.id === scenarioId) {
  //           const updatedInvestments = new Set(scenario.investments);
  //           updatedInvestments.add(newInvestmentWithId);
  
  //           // Determine updated strategies
  //           const updatedExpenseWithdrawalStrategy = [
  //             ...scenario.expenseWithdrawalStrategy,
  //             newInvestmentWithId,
  //           ];
  
  //           const updatedRothConversionStrategy =
  //             newInvestmentWithId.account === "PTR"
  //               ? [...scenario.rothConversionStrategy, newInvestmentWithId]
  //               : [...scenario.rothConversionStrategy];
  
  //           const updatedRmdStrategy =
  //             newInvestmentWithId.account === "PTR"
  //               ? [...scenario.rmdStrategy, newInvestmentWithId]
  //               : [...scenario.rmdStrategy];
  
  //           const updatedScenario = {
  //             ...scenario,
  //             investments: updatedInvestments,
  //             expenseWithdrawalStrategy: updatedExpenseWithdrawalStrategy,
  //             rothConversionStrategy: updatedRothConversionStrategy,
  //             rmdStrategy: updatedRmdStrategy,
  //           };
  
  //           updatedScenarioToSelect = updatedScenario;
  //           return updatedScenario;
  //         }
  //         return scenario;
  //       })
  //     );
  
  //     if (selectedScenario?.id === scenarioId) {
  //       setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
  //       setTimeout(() => setSelectedInvestment(newInvestmentWithId), 0);
  //     }
  
  //     // TODO: Sync with backend in production
  //   } catch (error) {
  //     console.error("Error creating investment:", error);
  //   }
  // };
  
  const createInvestment = async (scenarioId, newInvestment) => {
    try {
      // Generate a unique ID for the new investment
      const newInvestmentWithId = { ...newInvestment, id: `${Date.now()}` };
  
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            // Clone the existing investments set and add the new investment
            const updatedInvestments = new Set(scenario.investments);
            updatedInvestments.add(newInvestmentWithId);
  
            // Check if the new investment type already exists in investmentTypes
            const updatedInvestmentTypes = new Set(scenario.investmentTypes);
            const typeExists = Array.from(updatedInvestmentTypes).some(
              (type) => type.name === newInvestmentWithId.type.name
            );
  
            // Add the new type to the investmentTypes set if it doesn't already exist
            if (!typeExists) {
              updatedInvestmentTypes.add(newInvestmentWithId.type);
            }
  
            // Determine updated strategies
            const updatedExpenseWithdrawalStrategy = [
              ...scenario.expenseWithdrawalStrategy,
              newInvestmentWithId,
            ];
  
            const updatedRothConversionStrategy =
              newInvestmentWithId.account === "PTR"
                ? [...scenario.rothConversionStrategy, newInvestmentWithId]
                : [...scenario.rothConversionStrategy];
  
            const updatedRmdStrategy =
              newInvestmentWithId.account === "PTR"
                ? [...scenario.rmdStrategy, newInvestmentWithId]
                : [...scenario.rmdStrategy];
  
            // Update scenario with the new investment and investmentTypes
            const updatedScenario = {
              ...scenario,
              investments: updatedInvestments,
              investmentTypes: updatedInvestmentTypes, // Updated with new type
              expenseWithdrawalStrategy: updatedExpenseWithdrawalStrategy,
              rothConversionStrategy: updatedRothConversionStrategy,
              rmdStrategy: updatedRmdStrategy,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      // Update selected scenario and selected investment if applicable
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        setTimeout(() => setSelectedInvestment(newInvestmentWithId), 0);
      }
  
      // TODO: Sync with backend in production
    } catch (error) {
      console.error("Error creating investment:", error);
    }
  };
  
  // const editInvestment = async (scenarioId, updatedInvestment) => {
  //   try {
  //     setScenarios((prevScenarios) =>
  //       prevScenarios.map((scenario) => {
  //         if (scenario.id !== scenarioId) return scenario;
  
  //         const updatedInvestments = new Set();
  //         let found = false;
  
  //         scenario.investments.forEach((inv) => {
  //           if (inv.id === updatedInvestment.id) {
  //             updatedInvestments.add(updatedInvestment);
  //             found = true;
  //           } else {
  //             updatedInvestments.add(inv);
  //           }
  //         });
  
  //         if (!found) updatedInvestments.add(updatedInvestment); // fallback in case not found
  
  //         const isPTR = updatedInvestment.account === "PTR";
  
  //         const updatedScenario = {
  //           ...scenario,
  //           investments: updatedInvestments,
  //           expenseWithdrawalStrategy: [
  //             ...Array.from(updatedInvestments),
  //           ],
  //           rothConversionStrategy: isPTR
  //             ? [...Array.from(updatedInvestments).filter((inv) => inv.account === "PTR")]
  //             : [...scenario.rothConversionStrategy.filter((inv) => inv.id !== updatedInvestment.id)],
  //           rmdStrategy: isPTR
  //             ? [...Array.from(updatedInvestments).filter((inv) => inv.account === "PTR")]
  //             : [...scenario.rmdStrategy.filter((inv) => inv.id !== updatedInvestment.id)],
  //         };
  
  //         if (selectedScenario?.id === scenarioId) {
  //           setTimeout(() => setSelectedScenario(updatedScenario), 0);
  //         }
  
  //         return updatedScenario;
  //       })
  //     );
  
  //     // TODO: Sync with backend
  //   } catch (error) {
  //     console.error("Error editing investment:", error);
  //   }
  // };
  
  const editInvestment = async (scenarioId, updatedInvestment) => {
    try {
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const updatedInvestments = new Set();
          let found = false;
  
          // Check if the investment already exists in the set, and update it if found
          scenario.investments.forEach((inv) => {
            if (inv.id === updatedInvestment.id) {
              updatedInvestments.add(updatedInvestment);
              found = true;
            } else {
              updatedInvestments.add(inv);
            }
          });
  
          // Fallback in case investment was not found (unlikely, but added for safety)
          if (!found) updatedInvestments.add(updatedInvestment);
  
          // Clone and update the investment types
          const updatedInvestmentTypes = new Set(scenario.investmentTypes);
          const typeExists = Array.from(updatedInvestmentTypes).some(
            (type) => type.name === updatedInvestment.type.name
          );
  
          // Add new type to investmentTypes only if it doesn’t exist
          if (!typeExists) {
            updatedInvestmentTypes.add(updatedInvestment.type);
          }
  
          // Determine if the investment is in a Pre-Tax Retirement account (PTR)
          const isPTR = updatedInvestment.account === "PTR";
  
          // Update strategies dynamically
          const updatedScenario = {
            ...scenario,
            investments: updatedInvestments,
            investmentTypes: updatedInvestmentTypes, // Include updated types
            expenseWithdrawalStrategy: [...Array.from(updatedInvestments)],
            rothConversionStrategy: isPTR
              ? [...Array.from(updatedInvestments).filter((inv) => inv.account === "PTR")]
              : [...scenario.rothConversionStrategy.filter((inv) => inv.id !== updatedInvestment.id)],
            rmdStrategy: isPTR
              ? [...Array.from(updatedInvestments).filter((inv) => inv.account === "PTR")]
              : [...scenario.rmdStrategy.filter((inv) => inv.id !== updatedInvestment.id)],
          };
  
          // Update selected scenario if it’s the one being edited
          if (selectedScenario?.id === scenarioId) {
            setTimeout(() => setSelectedScenario(updatedScenario), 0);
            setTimeout(() => setSelectedInvestment(updatedInvestment), 0);
          }
  
          return updatedScenario;
        })
      );
  
      // TODO: Sync with backend
    } catch (error) {
      console.error("Error editing investment:", error);
    }
  };
  

  const duplicateInvestment = async (scenarioId, investmentId) => {
    try {
      const investmentToDuplicate = scenarios
        .find((s) => s.id === scenarioId)
        ?.investments
        ? Array.from(scenarios.find((s) => s.id === scenarioId).investments)
            .find((inv) => inv.id === investmentId)
        : null;
  
      if (!investmentToDuplicate) return;
  
      const duplicated = {
        ...investmentToDuplicate,
        id: `${Date.now()}`,
        name: `${investmentToDuplicate.type.name} (Copy)`
      };
  
      await createInvestment(scenarioId, duplicated); // handles strategy update
  
    } catch (error) {
      console.error("Error duplicating investment:", error);
    }
  };
  
  const deleteInvestment = async (scenarioId, investmentId) => {
    try {
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const updatedInvestments = new Set(
            Array.from(scenario.investments).filter((inv) => inv.id !== investmentId)
          );
  
          const updatedScenario = {
            ...scenario,
            investments: updatedInvestments,
            expenseWithdrawalStrategy: scenario.expenseWithdrawalStrategy.filter(
              (inv) => inv.id !== investmentId
            ),
            rothConversionStrategy: scenario.rothConversionStrategy.filter(
              (inv) => inv.id !== investmentId
            ),
            rmdStrategy: scenario.rmdStrategy.filter(
              (inv) => inv.id !== investmentId
            ),
          };
  
          if (selectedScenario?.id === scenarioId) {
            setTimeout(() => setSelectedScenario(updatedScenario), 0);
          }
  
          return updatedScenario;
        })
      );
  
      // TODO: Sync with backend
    } catch (error) {
      console.error("Error deleting investment:", error);
    }
  };
  
  const createEventSeries = async (scenarioId, newEventSeries) => {
    try {
      const newEventWithId = { ...newEventSeries, id: `${Date.now()}` };
  
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          console.log(scenario);
          if (scenario.id === scenarioId) {
            const updatedEvents = new Set(scenario.events);
            updatedEvents.add(newEventWithId);
  
            const updatedSpendingStrategy = (
              newEventWithId.type === "expense" && newEventWithId.isDiscretionary
                ? [...scenario.spendingStrategy, newEventWithId]
                : [...scenario.spendingStrategy]
            );
  
            const updatedScenario = {
              ...scenario,
              events: updatedEvents,
              spendingStrategy: updatedSpendingStrategy,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
  
      // TODO: Send to backend later
    } catch (error) {
      console.error('Error creating event series:', error);
    }
  };
  
  const editEventSeries = async (scenarioId, editedEventSeries) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const updatedEvents = new Set(
              Array.from(scenario.events).map((event) =>
                event.id === editedEventSeries.id ? editedEventSeries : event
              )
            );
  
            // Rebuild spendingStrategy
            const updatedSpendingStrategy = Array.from(updatedEvents).filter(
              (e) => e.type === "expense" && e.isDiscretionary
            );
  
            const updatedScenario = {
              ...scenario,
              events: updatedEvents,
              spendingStrategy: updatedSpendingStrategy,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
    } catch (error) {
      console.error('Error editing event series:', error);
    }
  };

  const duplicateEventSeries = async (scenarioId, eventSeriesId) => {
    try {
      let duplicatedEvent = null;
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const eventToDuplicate = Array.from(scenario.events).find(event => event.id === eventSeriesId);
            if (!eventToDuplicate) return scenario;
  
            duplicatedEvent = {
              ...eventToDuplicate,
              id: `${Date.now()}`,
              name: `${eventToDuplicate.name} (Copy)`,
            };
  
            const updatedEvents = new Set(scenario.events);
            updatedEvents.add(duplicatedEvent);
  
            const updatedSpendingStrategy = (
              duplicatedEvent.type === "expense" && duplicatedEvent.isDiscretionary
                ? [...scenario.spendingStrategy, duplicatedEvent]
                : [...scenario.spendingStrategy]
            );
  
            const updatedScenario = {
              ...scenario,
              events: updatedEvents,
              spendingStrategy: updatedSpendingStrategy,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
  
      return duplicatedEvent;
    } catch (error) {
      console.error('Error duplicating event series:', error);
    }
  };
  
  const deleteEventSeries = async (scenarioId, eventSeriesId) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const updatedEvents = new Set(
              Array.from(scenario.events).filter(event => event.id !== eventSeriesId)
            );
  
            const updatedSpendingStrategy = scenario.spendingStrategy.filter(
              (event) => event.id !== eventSeriesId
            );
  
            const updatedScenario = {
              ...scenario,
              events: updatedEvents,
              spendingStrategy: updatedSpendingStrategy,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
    } catch (error) {
      console.error('Error deleting event series:', error);
    }
  };
  
  const reorderStrategy = (scenarioId, strategyKey, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
  
    let updatedScenarioToSelect = null;
  
    setScenarios((prevScenarios) =>
      prevScenarios.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
  
        const strategyCopy = [...(scenario[strategyKey] || [])];
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= strategyCopy.length ||
          toIndex >= strategyCopy.length
        ) {
          return scenario;
        }
  
        const [moved] = strategyCopy.splice(fromIndex, 1);
        strategyCopy.splice(toIndex, 0, moved);
  
        const updatedScenario = {
          ...scenario,
          [strategyKey]: strategyCopy,
        };
  
        updatedScenarioToSelect = updatedScenario;
        return updatedScenario;
      })
    );
  
    if (selectedScenario?.id === scenarioId) {
      setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
    }
  
    // TODO: Push reordered strategy to backend (e.g., /api/scenarios/:id/:strategyKey)
  };
  
  useEffect(() => {
    if (user?.email) {
      fetchScenarios(); // ✅ Load hardcoded list for now
    }
  }, [user?.email]);

  return (
    <DataContext.Provider value={{ 
    scenarios, 
    setScenarios,
    loading, 
    fetchScenarios, 
    createScenario, 
    editScenario, 
    duplicateScenario, 
    deleteScenario,
    createInvestment,
    editInvestment,
    duplicateInvestment,
    deleteInvestment,
    createEventSeries,
    editEventSeries,
    duplicateEventSeries,
    deleteEventSeries,
    reorderStrategy
    }}>
      {children}
    </DataContext.Provider>
  );
};

// ✅ Custom hook to access scenario context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useScenarios must be used within a DataProvider');
  }
  return context;
};

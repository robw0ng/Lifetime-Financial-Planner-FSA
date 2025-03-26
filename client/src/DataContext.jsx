import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSelected } from './SelectedContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth(); // ✅ Use email from AuthContext
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment } = useSelected();

  // ✅ Temporary hardcoded list of scenarios
  const mockScenarios = [
    {
      id: "1",
      name: "Unemployed",
      isMarried: false,
      birthYear: 1990,
      birthYearSpouse: null,
      lifeExpectancy: 85,
      lifeExpectancySpouse: null,
      inflationAssumption: 2.5,
      preTaxContributionLimit: 19000,
      afterTaxContributionLimit: 6000,
      sharingSettings: "Private",
      financialGoal: 1000000,
      stateOfResidence: "NY",
      rothConversionOptimizerEnabled: true,
      rothConversionOptimizerStartYear: 2025,
      rothConversionOptimizerEndYear: 2030,
      investments: new Set([
        {
          id: "1",
          type: {
            name: "Stocks",
            description: "",
            expected_annual_return: "",
            expense_ratio: "",
            expected_annual_income: "",
            taxability: "",
          },
          account: "PTR",
          value: 15000,
        },
      ]),
      events: new Set([
        {
          id: "ev1",
          name: "Part-Time Job Income",
          description: "Supplemental work during unemployment",
          type: "income",
          startYear: { value: 2024, type: "fixed" },
          duration: { value: 2, type: "fixed" },
          initialAmount: 12000,
          expectedChange: { value: "2%", type: "fixed" },
          inflationAdjusted: true,
          userPercentage: 100,
          isSocialSecurity: false,
        },
        {
          id: "ev2",
          name: "Rent",
          description: "Monthly housing cost",
          type: "expense",
          startYear: { value: 2024, type: "fixed" },
          duration: { value: 10, type: "fixed" },
          initialAmount: 18000,
          expectedChange: { value: "3%", type: "fixed" },
          inflationAdjusted: false,
          userPercentage: 100,
          isDiscretionary: false,
        },
        {
          id: "ev3",
          name: "Conservative Investing Strategy",
          description: "Basic 60/40 investment allocation",
          type: "invest",
          startYear: { value: 2025, type: "fixed" },
          duration: { value: 30, type: "fixed" },
          allocationType: "fixed",
          allocation: {
            "Stocks": 60,
            "Bonds": 40,
          },
          maxCash: 5000,
        },
      ]),
      spendingStrategy: [],
      rmdStrategy: [],
      rothConversionStrategy: [],
      expenseWithdrawalStrategy: [],
    },
  
    {
      id: "2",
      name: "Gaming",
      isMarried: true,
      birthYear: 1995,
      birthYearSpouse: 1997,
      lifeExpectancy: 80,
      lifeExpectancySpouse: 78,
      inflationAssumption: 3.0,
      preTaxContributionLimit: 18000,
      afterTaxContributionLimit: 5000,
      sharingSettings: "Public",
      financialGoal: 2000000,
      stateOfResidence: "CA",
      rothConversionOptimizerEnabled: false,
      rothConversionOptimizerStartYear: null,
      rothConversionOptimizerEndYear: null,
      investments: new Set(),
      events: new Set([
        {
          id: "ev4",
          name: "YouTube Income",
          type: "income",
          startYear: { value: 2023, type: "fixed" },
          duration: { value: 5, type: "normal" },
          initialAmount: 50000,
          expectedChange: { value: "N(5%, 2%)", type: "normal" },
          inflationAdjusted: true,
          userPercentage: 60,
          isSocialSecurity: false,
        },
        {
          id: "ev5",
          name: "Lifestyle Expenses",
          type: "expense",
          startYear: { value: 2023, type: "fixed" },
          duration: { value: 40, type: "fixed" },
          initialAmount: 30000,
          expectedChange: { value: "1%", type: "fixed" },
          inflationAdjusted: true,
          userPercentage: 50,
          isDiscretionary: true,
        },
        {
          id: "ev6",
          name: "Rebalancing Strategy",
          type: "rebalance",
          startYear: { value: 2024, type: "fixed" },
          duration: { value: 35, type: "fixed" },
          allocationType: "glide",
          allocation: {
            initial: {
              "Stocks": 70,
              "Bonds": 30,
            },
            final: {
              "Stocks": 50,
              "Bonds": 50,
            },
          },
        },
      ]),
      spendingStrategy: [],
      rmdStrategy: [],
      rothConversionStrategy: [],
      expenseWithdrawalStrategy: [],
    },
  ];
  

  // ✅ Function to fetch scenarios using user's email
  const fetchScenarios = async () => {
    try {
      setLoading(true);

      // TODO: Uncomment when backend is set up
      // const response = await fetch(`/api/scenarios?email=${encodeURIComponent(user.email)}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch scenarios');
      // }
      // const data = await response.json();
      
      // ✅ Use temporary hardcoded scenarios for now
      setScenarios(mockScenarios);
      
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to create a new scenario
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
        setScenarios((prev) => [...prev, { ...newScenario, id: `${Date.now()}` }]);
      } else {
        // ✅ If no user email → Directly add to context
        setScenarios((prev) => [...prev, { ...newScenario, id: `${Date.now()}` }]);
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
    }
  };

  // ✅ Function to edit an existing scenario
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
        setScenarios((prev) =>
          prev.map((scenario) =>
            scenario.id === editedScenario.id ? editedScenario : scenario
          )
        );
      } else {
        // ✅ If no user email → Directly update in context
        setScenarios((prev) =>
          prev.map((scenario) =>
            scenario.id === editedScenario.id ? editedScenario : scenario
          )
        );
      }
    } catch (error) {
      console.error('Error editing scenario:', error);
    }
  };

  // ✅ Function to duplicate an existing scenario
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
      } else {
        // ✅ If no user email → Directly add to context
        setScenarios((prev) => [...prev, duplicatedScenario]);
      }
    } catch (error) {
      console.error('Error duplicating scenario:', error);
    }
  };

  // ✅ Function to delete a scenario
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

  // ✅ Function to create a new investment within a specific scenario
  const createInvestment = async (scenarioId, newInvestment) => {
    try {
      const newInvestmentWithId = { ...newInvestment, id: `${Date.now()}` };
  
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const updatedInvestments = new Set(scenario.investments);
            updatedInvestments.add(newInvestmentWithId);
  
            const updatedScenario = {
              ...scenario,
              investments: updatedInvestments,
            };
  
            // ✅ Store for later
            updatedScenarioToSelect = updatedScenario;
  
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      // ✅ Safe to call AFTER state update is queued
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        setTimeout(() => setSelectedInvestment(newInvestmentWithId), 0);
      }
  
      // TODO: Send to backend later
    } catch (error) {
      console.error('Error creating investment:', error);
    }
  };

  const editInvestment = async (scenarioId, editedInvestment) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const updatedInvestments = new Set(
              Array.from(scenario.investments).map((inv) =>
                inv.id === editedInvestment.id ? editedInvestment : inv
              )
            );
            
            const updatedScenario = {
              ...scenario,
              investments: updatedInvestments,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          }
          return scenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        setTimeout(() => setSelectedInvestment(editedInvestment), 0);
      }
    } catch (error) {
      console.error('Error editing investment:', error);
    }
  };
  

  // ✅ Duplicate an investment within a scenario
  const duplicateInvestment = async (scenarioId, investmentId) => {
    try {
      let updatedScenarioToSelect = null;

      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const investmentsArray = Array.from(scenario.investments);
            const investmentToDuplicate = investmentsArray.find(inv => inv.id === investmentId);
            if (!investmentToDuplicate) return scenario;

              const duplicatedInvestment = {
              ...investmentToDuplicate,
              id: `${Date.now()}`,
              type: { 
                ...investmentToDuplicate.type, 
                name: `${investmentToDuplicate.type.name} (Copy)` 
              },
              };

            const updatedInvestments = new Set(scenario.investments);
            updatedInvestments.add(duplicatedInvestment);

            const updatedScenario = {
              ...scenario,
              investments: updatedInvestments,
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

      // TODO: Sync with backend if needed
    } catch (error) {
      console.error('Error duplicating investment:', error);
    }
  };

  // ✅ Delete an investment from a scenario
  const deleteInvestment = async (scenarioId, investmentId) => {
    try {
      let updatedScenarioToSelect = null;

      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            const updatedInvestments = new Set(
              Array.from(scenario.investments).filter(inv => inv.id !== investmentId)
            );

            const updatedScenario = {
              ...scenario,
              investments: updatedInvestments,
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

      // TODO: Sync with backend if needed
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  // ✅ Automatically fetch scenarios when user logs in or email changes
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
      deleteInvestment
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

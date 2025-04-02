import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSelected } from './SelectedContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, logout } = useAuth(); // ✅ Use email from AuthContext
  const [ scenarios, setScenarios ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const { selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment } = useSelected();
  
  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error("Failed to fetch scenarios");
      }
  
      const data = await res.json();
      setScenarios(data);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const createScenario = async (newScenario) => {
    try {
      if (user?.email){
        const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newScenario),
        });

        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }    
    
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create scenario: ${errorText}`);
        }
    
        const { scenario: createdScenario } = await res.json();
    
        // setScenarios((prev) => [...prev, createdScenario]);
        fetchScenarios();
        return createdScenario;
      }
      else{
        const createdScenario = { ...newScenario, id: `${Date.now()}` }
        setScenarios((prev) => [...prev, createdScenario]);
        return createdScenario;
      }
    } catch (error) {
      console.error("Error creating scenario:", error);
    }
    return null;
  };
  
  const editScenario = async (editedScenario) => {
		try {
			if (user?.email) {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/edit/${editedScenario.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(editedScenario),
					credentials: "include",
				});

        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }

				if (res.status !== 200) {
					throw new Error("Failed to edit scenario");
				}

				const data = await res.json();
				const updatedScenario = data.scenario;
				// setScenarios((prev) =>
				// 	prev.map((scenario) => (scenario.id === updatedScenario.id ? updatedScenario : scenario))
				// );
        fetchScenarios();
        return updatedScenario;
			} else {
				setScenarios((prev) =>
					prev.map((scenario) => (scenario.id === editedScenario.id ? editedScenario : scenario))
				);
        return editedScenario;
			}
		} catch (error) {
			console.error("Error editing scenario:", error);
		}
    return null;
	};

  const deleteScenario = async (scenarioId) => {
    try {
      if (user?.email) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/delete/${scenarioId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }    

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to delete scenario: ${errorText}`);
        }
  
        console.log("Scenario deleted from backend");
        // setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
        fetchScenarios();
      } else {
        setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };
  
  const duplicateScenario = async (scenarioId) => {
    try {
      const scenarioToDuplicate = scenarios.find((scenario) => scenario.id === scenarioId);
      if (!scenarioToDuplicate) {
        console.error("Scenario not found for duplication");
        return null;
      }
  
      if (user?.email) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/scenarios/duplicate/${scenarioId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }          

        if (!res.ok){
          const errorText = await res.text();
          throw new Error(`Failed to duplicate scenario: ${errorText}`);
        }
  
        const { scenario: duplicatedScenario } = await res.json();
  
        // setScenarios((prev) => [...prev, duplicatedScenario]);
        fetchScenarios();
        return duplicatedScenario;
      } else {
        // Guest user fallback
        const duplicatedScenario = {
          ...scenarioToDuplicate,
          id: `${Date.now()}`,
          name: `${scenarioToDuplicate.name} (Copy)`,
        };
  
        setScenarios((prev) => [...prev, duplicatedScenario]);
        return duplicatedScenario;
      }
    } catch (error) {
      console.error("Error duplicating scenario:", error);
      return null;
    }
  };
  
  const createInvestment = async (scenarioId, newInvestment) => {
    try {
      // Generate a unique ID for the new investment
      const newInvestmentWithId = { ...newInvestment, id: `${Date.now()}` };
  
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id === scenarioId) {
            // Clone the existing investments set and add the new investment
            const updatedInvestments = new Set(scenario.Investments);
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
  
  const editInvestment = async (scenarioId, updatedInvestment) => {
    try {
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const updatedInvestments = new Set();
          let found = false;
  
          // Check if the investment already exists in the set, and update it if found
          scenario.Investments.forEach((inv) => {
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
            Array.from(scenario.Investments).filter((inv) => inv.id !== investmentId)
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
            const updatedEvents = new Set(scenario.EventSeries);
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
              Array.from(scenario.EventSeries).map((event) =>
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
            const eventToDuplicate = Array.from(scenario.EventSeries).find(event => event.id === eventSeriesId);
            if (!eventToDuplicate) return scenario;
  
            duplicatedEvent = {
              ...eventToDuplicate,
              id: `${Date.now()}`,
              name: `${eventToDuplicate.name} (Copy)`,
            };
  
            const updatedEvents = new Set(scenario.EventSeries);
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
              Array.from(scenario.EventSeries).filter(event => event.id !== eventSeriesId)
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

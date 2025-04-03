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
  
  const createInvestmentType = async (scenarioId, newInvestmentType) => {
    try {
      const newTypeWithId = { ...newInvestmentType, id: `${Date.now()}` };
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const updatedTypes = [...scenario.InvestmentTypes, newTypeWithId];
  
          const updatedScenario = {
            ...scenario,
            InvestmentTypes: updatedTypes,
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
      console.log("scenarios after create type", scenarios)
      return newTypeWithId;
    } catch (error) {
      console.error("Error creating investment type:", error);
      return null;
    }
  };
  
  const editInvestmentType = async (scenarioId, updatedType) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          // Update the InvestmentTypes list
          const updatedTypes = scenario.InvestmentTypes.map((type) =>
            type.id === updatedType.id ? updatedType : type
          );
  
          // Update investments that use this type
          const updatedInvestments = new Set();
          for (const inv of scenario.Investments) {
            if (inv.type.id === updatedType.id) {
              updatedInvestments.add({ ...inv, type: updatedType });
            } else {
              updatedInvestments.add(inv);
            }
          }
  
          const updatedScenario = {
            ...scenario,
            InvestmentTypes: updatedTypes,
            Investments: updatedInvestments,
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
  
      return updatedType;
    } catch (error) {
      console.error("Error editing investment type:", error);
      return null;
    }
  };
  
  const duplicateInvestmentType = async (scenarioId, investmentTypeId) => {
    try {
      let duplicatedType = null;
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const originalType = scenario.InvestmentTypes.find(
            (type) => `${type.id}` === `${investmentTypeId}`
          );
  
          if (!originalType) return scenario;
  
          duplicatedType = {
            ...originalType,
            id: `${Date.now()}`, // Unique ID
            name: `${originalType.name} (Copy)`,
          };
  
          const updatedTypes = [...scenario.InvestmentTypes, duplicatedType];
  
          const updatedScenario = {
            ...scenario,
            InvestmentTypes: updatedTypes,
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
  
      return duplicatedType;
    } catch (error) {
      console.error("Error duplicating investment type:", error);
      return null;
    }
  };  

  const deleteInvestmentType = async (scenarioId, investmentTypeId) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const updatedTypes = scenario.InvestmentTypes.filter(
            (type) => `${type.id}` !== `${investmentTypeId}`
          );
  
          const updatedInvestments = new Set(
            Array.from(scenario.Investments).filter(
              (inv) => `${inv.type.id}` !== `${investmentTypeId}`
            )
          );
  
          const updatedScenario = {
            ...scenario,
            InvestmentTypes: updatedTypes,
            Investments: updatedInvestments,
            expense_withdrawl_strategy: scenario.expense_withdrawl_strategy.filter(
              (inv) => `${inv.type.id}` !== `${investmentTypeId}`
            ),
            roth_conversion_strategy: scenario.roth_conversion_strategy.filter(
              (inv) => `${inv.type.id}` !== `${investmentTypeId}`
            ),
            rmd_strategy: scenario.rmd_strategy.filter(
              (inv) => `${inv.type.id}` !== `${investmentTypeId}`
            ),
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
  
      return true;
    } catch (error) {
      console.error("Error deleting investment type:", error);
      return false;
    }
  };

  const createInvestment = async (scenarioId, newInvestment) => {
    try {
      const newInvestmentWithId = { ...newInvestment, id: `${Date.now()}` };
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          // Add investment to the set
          const updatedInvestments = new Set(scenario.Investments);
          updatedInvestments.add(newInvestmentWithId);
  
          // Ensure investment type is tracked
          const updatedInvestmentTypes = scenario.InvestmentTypes;
          const typeExists = Array.from(updatedInvestmentTypes).some(
            (type) => type.name === newInvestmentWithId.type.name
          );
          if (!typeExists) {
            updatedInvestmentTypes.add(newInvestmentWithId.type);
          }
  
          // Determine updated strategies
          const updatedExpenseWithdrawalStrategy = [
            ...scenario.expense_withdrawl_strategy,
            newInvestmentWithId,
          ];
  
          const updatedRothConversionStrategy =
            newInvestmentWithId.account === "PTR"
              ? [...scenario.roth_conversion_strategy, newInvestmentWithId]
              : scenario.roth_conversion_strategy;
  
          const updatedRmdStrategy =
            newInvestmentWithId.account === "PTR"
              ? [...scenario.rmd_strategy, newInvestmentWithId]
              : scenario.rmd_strategy;
  
          // Build updated scenario
          const updatedScenario = {
            ...scenario,
            Investments: updatedInvestments,
            InvestmentTypes: updatedInvestmentTypes,
            expense_withdrawl_strategy: updatedExpenseWithdrawalStrategy,
            roth_conversion_strategy: updatedRothConversionStrategy,
            rmd_strategy: updatedRmdStrategy,
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      // Update selection state
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        setTimeout(() => setSelectedInvestment(newInvestmentWithId), 0);
      }
  
      return newInvestmentWithId;
    } catch (error) {
      console.error("Error creating investment:", error);
      return null;
    }
  };
  
  const editInvestment = async (scenarioId, updatedInvestment) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          // Update investments
          const updatedInvestments = new Set();
          for (const inv of scenario.Investments) {
            if (inv.id === updatedInvestment.id) {
              updatedInvestments.add(updatedInvestment);
            } else {
              updatedInvestments.add(inv);
            }
          }
  
          // Ensure type is tracked
          const updatedInvestmentTypes = new Set(scenario.InvestmentTypes);
          const typeExists = Array.from(updatedInvestmentTypes).some(
            (type) => type.name === updatedInvestment.type.name
          );
          if (!typeExists) {
            updatedInvestmentTypes.add(updatedInvestment.type);
          }
  
          // Update strategies
          const isPTR = updatedInvestment.account === "PTR";
  
          const updatedExpenseStrategy = Array.from(updatedInvestments);
          const updatedRothStrategy = isPTR
            ? updatedExpenseStrategy.filter((inv) => inv.account === "PTR")
            : scenario.roth_conversion_strategy.filter((inv) => inv.id !== updatedInvestment.id);
          const updatedRmdStrategy = isPTR
            ? updatedExpenseStrategy.filter((inv) => inv.account === "PTR")
            : scenario.rmd_strategy.filter((inv) => inv.id !== updatedInvestment.id);
  
          const updatedScenario = {
            ...scenario,
            Investments: updatedInvestments,
            InvestmentTypes: updatedInvestmentTypes,
            expense_withdrawl_strategy: updatedExpenseStrategy,
            roth_conversion_strategy: updatedRothStrategy,
            rmd_strategy: updatedRmdStrategy,
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        setTimeout(() => setSelectedInvestment(updatedInvestment), 0);
      }
  
      return updatedInvestment;
    } catch (error) {
      console.error("Error editing investment:", error);
    }
  };

  const duplicateInvestment = async (scenarioId, investmentId) => {
    try {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return;
  
      const original = Array.from(scenario.Investments).find((inv) => inv.id === investmentId);
      if (!original) return;
  
      const duplicated = {
        ...original,
        id: `${Date.now()}`,
        name: `${original.type.name} (Copy)`, // optional
      };
  
      await createInvestment(scenarioId, duplicated);
    } catch (error) {
      console.error("Error duplicating investment:", error);
    }
  };  

  const deleteInvestment = async (scenarioId, investmentId) => {
    try {
      let updatedScenarioToSelect = null;
  
      setScenarios((prevScenarios) =>
        prevScenarios.map((scenario) => {
          if (scenario.id !== scenarioId) return scenario;
  
          const updatedInvestments = new Set(
            Array.from(scenario.Investments).filter((inv) => inv.id !== investmentId)
          );
  
          const updatedScenario = {
            ...scenario,
            Investments: updatedInvestments,
            expense_withdrawl_strategy: scenario.expense_withdrawl_strategy.filter(
              (inv) => inv.id !== investmentId
            ),
            roth_conversion_strategy: scenario.roth_conversion_strategy.filter(
              (inv) => inv.id !== investmentId
            ),
            rmd_strategy: scenario.rmd_strategy.filter(
              (inv) => inv.id !== investmentId
            ),
          };
  
          updatedScenarioToSelect = updatedScenario;
          return updatedScenario;
        })
      );
  
      if (selectedScenario?.id === scenarioId) {
        setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
      }
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
    createInvestmentType,
    editInvestmentType,
    duplicateInvestmentType,
    deleteInvestmentType,
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

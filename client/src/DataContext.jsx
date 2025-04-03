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
      if (selectedScenario) {
        const updatedSelectedScenario = data.find((scenario) => scenario.id === selectedScenario.id);
        if (updatedSelectedScenario) {
          setSelectedScenario(updatedSelectedScenario);
        }
      }
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
      if (user?.email) {
        // Authenticated user: send to backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/investmenttypes/${scenarioId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newInvestmentType),
        });
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create investment type: ${errorText}`);
        }
  
        const { investmentType: createdType } = await res.json();
        fetchScenarios();
        return createdType;
      } else {
        // Guest mode: create local type
        const newTypeWithId = { ...newInvestmentType, id: `${Date.now()}`, Investments: [] };
  
        setScenarios((prevScenarios) =>
          prevScenarios.map((s) =>
            s.id === scenarioId
              ? { ...s, InvestmentTypes: [...s.InvestmentTypes, newTypeWithId] }
              : s
          )
        );
  
        return newTypeWithId;
      }
    } catch (err) {
      console.error("Error creating investment type:", err);
      return null;
    }
  };

  const editInvestmentType = async (scenarioId, updatedType) => {
    try {
      if (user?.email) {
        // Authenticated user: send update to backend
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/investmenttypes/edit/${scenarioId}/${updatedType.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedType),
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to edit investment type: ${errorText}`);
        }
  
        const { investmentType: updated } = await res.json();
  
        fetchScenarios();
        return updated;
      } else {
        // Guest mode: update locally only
        let updatedScenarioToSelect = null;
  
        setScenarios((prevScenarios) =>
          prevScenarios.map((scenario) => {
            if (scenario.id !== scenarioId) return scenario;
  
            const updatedTypes = scenario.InvestmentTypes.map((type) =>
              type.id === updatedType.id ? updatedType : type
            );
  
            const updatedInvestments = new Set(
              Array.from(scenario.Investments).map((inv) =>
                inv.type.id === updatedType.id ? { ...inv, type: updatedType } : inv
              )
            );
  
            updatedScenarioToSelect = {
              ...scenario,
              InvestmentTypes: updatedTypes,
              Investments: updatedInvestments,
            };
  
            return updatedScenarioToSelect;
          })
        );
  
        if (selectedScenario?.id === scenarioId) {
          setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        }
  
        return updatedType;
      }
    } catch (err) {
      console.error("Error editing investment type:", err);
      return null;
    }
  };

  const duplicateInvestmentType = async (scenarioId, investmentTypeId) => {
    try {
      if (user?.email) {
        // Logged-in user: use backend route
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/investmenttypes/duplicate/${scenarioId}/${investmentTypeId}`,
          {
            method: "POST",
            credentials: "include",
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to duplicate investment type: ${errorText}`);
        }
  
        const { investmentType: duplicated } = await res.json();
  
        fetchScenarios();
  
        return duplicated;
      } else {
        // Guest mode: duplicate locally
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
              id: `${Date.now()}`, // New ID for guest
              name: `${originalType.name} (Copy)`,
              Investments: [], // default
            };
  
            const updatedScenario = {
              ...scenario,
              InvestmentTypes: [...scenario.InvestmentTypes, duplicatedType],
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          })
        );
  
        if (selectedScenario?.id === scenarioId) {
          setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        }
  
        return duplicatedType;
      }
    } catch (error) {
      console.error("Error duplicating investment type:", error);
      return null;
    }
  };
  
  const deleteInvestmentType = async (scenarioId, investmentTypeId) => {
    try {
      if (user?.email) {
        // Logged-in user: delete via backend
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/investmenttypes/delete/${scenarioId}/${investmentTypeId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to delete investment type: ${errorText}`);
        }
  
        fetchScenarios();
        return true;
      } else {
        // Guest mode: delete locally only
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
  
            updatedScenarioToSelect = {
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
  
            return updatedScenarioToSelect;
          })
        );
  
        if (selectedScenario?.id === scenarioId) {
          setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
        }
  
        return true;
      }
    } catch (error) {
      console.error("Error deleting investment type:", error);
      return false;
    }
  };
    
  const createInvestment = async (scenarioId, newInvestment) => {
    try {
      const generatedId = `${Date.now()}`;
  
      if (user?.email) {
        // Construct backend-compatible payload
        const payload = {
          special_id: generatedId,
          value: Number(newInvestment.value),
          tax_status: newInvestment.account,
          investment_type_id: newInvestment.type, // This should be the investmentType ID
        };
  
        const res = await fetch(`${import.meta.env.VITE_API_URL}/investments/${scenarioId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create investment: ${errorText}`);
        }
  
        const { investment: created } = await res.json();
        fetchScenarios(); // Refresh state from server
        return created;
      } else {
        // Guest mode: Create locally
        const guestInvestment = {
          ...newInvestment,
          id: generatedId,
          special_id: generatedId,
          tax_status: newInvestment.account,
          investment_type_id: newInvestment.type,
        };
  
        let updatedScenarioToSelect = null;
  
        setScenarios((prevScenarios) =>
          prevScenarios.map((scenario) => {
            if (scenario.id !== scenarioId) return scenario;
  
            const updatedInvestments = new Set(scenario.Investments);
            updatedInvestments.add(guestInvestment);
  
            const updatedScenario = {
              ...scenario,
              Investments: updatedInvestments,
              expense_withdrawl_strategy: [...scenario.expense_withdrawl_strategy, guestInvestment],
              roth_conversion_strategy:
                guestInvestment.tax_status === "PTR"
                  ? [...scenario.roth_conversion_strategy, guestInvestment]
                  : scenario.roth_conversion_strategy,
              rmd_strategy:
                guestInvestment.tax_status === "PTR"
                  ? [...scenario.rmd_strategy, guestInvestment]
                  : scenario.rmd_strategy,
            };
  
            updatedScenarioToSelect = updatedScenario;
            return updatedScenario;
          })
        );
  
        if (selectedScenario?.id === scenarioId) {
          setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
          setTimeout(() => setSelectedInvestment(guestInvestment), 0);
        }
  
        return guestInvestment;
      }
    } catch (error) {
      console.error("Error creating investment:", error);
      return null;
    }
  };

  const editInvestment = async (scenarioId, updatedInvestment) => {
    try {
      if (user?.email) {
        // Prepare payload for backend
        const payload = {
          value: Number(updatedInvestment.value),
          tax_status: updatedInvestment.account,
          investment_type_id: updatedInvestment.type.id || updatedInvestment.type,
        };
  
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/investments/edit/${scenarioId}/${updatedInvestment.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to edit investment: ${errText}`);
        }
  
        const { investment: updatedFromServer } = await res.json();
        fetchScenarios();
        return updatedFromServer;
      } else {
        // Guest mode
        let updatedScenarioToSelect = null;
  
        setScenarios((prevScenarios) =>
          prevScenarios.map((scenario) => {
            if (scenario.id !== scenarioId) return scenario;
  
            const updatedInvestments = new Set();
            for (const inv of scenario.Investments) {
              if (inv.id === updatedInvestment.id) {
                updatedInvestments.add(updatedInvestment);
              } else {
                updatedInvestments.add(inv);
              }
            }
  
            const updatedInvestmentTypes = new Set(scenario.InvestmentTypes);
            const typeExists = Array.from(updatedInvestmentTypes).some(
              (type) => type.name === updatedInvestment.type.name
            );
            if (!typeExists) {
              updatedInvestmentTypes.add(updatedInvestment.type);
            }
  
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
      }
    } catch (error) {
      console.error("Error editing investment:", error);
      return null;
    }
  };  

  const duplicateInvestment = async (scenarioId, investmentId) => {
    try {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return;
  
      const original = Array.from(scenario.Investments).find((inv) => inv.id === investmentId);
      if (!original) return;
  
      if (user?.email) {
        // 🔁 Logged-in: Use backend endpoint
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/investments/duplicate/${scenarioId}/${investmentId}`,
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
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to duplicate investment: ${errorText}`);
        }
  
        const { investment: duplicatedFromServer } = await res.json();
        fetchScenarios();
        return duplicatedFromServer;
      } else {
        // Guest mode (local-only)
        const duplicated = {
          ...original,
          id: `${Date.now()}`,
          special_id: `${Date.now()}`,
          name: `${original.type.name} (Copy)`,
        };
  
        await createInvestment(scenarioId, duplicated);
        return duplicated;
      }
    } catch (error) {
      console.error("Error duplicating investment:", error);
      return null;
    }
  };  

  const deleteInvestment = async (scenarioId, investmentId) => {
    try {
      if (user?.email) {
        // 🔐 Logged-in: delete from backend
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/investments/delete/${scenarioId}/${investmentId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to delete investment: ${errorText}`);
        }
  
        // Refresh from backend
        fetchScenarios();
      } else {
        // 👤 Guest mode: local-only update
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
  
  // const reorderStrategy = (scenarioId, strategyKey, fromIndex, toIndex) => {
  //   if (fromIndex === toIndex) return;
  
  //   let updatedScenarioToSelect = null;
  
  //   setScenarios((prevScenarios) =>
  //     prevScenarios.map((scenario) => {
  //       if (scenario.id !== scenarioId) return scenario;
  
  //       const strategyCopy = [...(scenario[strategyKey] || [])];
  //       if (
  //         fromIndex < 0 ||
  //         toIndex < 0 ||
  //         fromIndex >= strategyCopy.length ||
  //         toIndex >= strategyCopy.length
  //       ) {
  //         return scenario;
  //       }
  
  //       const [moved] = strategyCopy.splice(fromIndex, 1);
  //       strategyCopy.splice(toIndex, 0, moved);
  
  //       const updatedScenario = {
  //         ...scenario,
  //         [strategyKey]: strategyCopy,
  //       };
  
  //       updatedScenarioToSelect = updatedScenario;
  //       return updatedScenario;
  //     })
  //   );
  
  //   if (selectedScenario?.id === scenarioId) {
  //     setTimeout(() => setSelectedScenario(updatedScenarioToSelect), 0);
  //   }
  
  //   // TODO: Push reordered strategy to backend (e.g., /api/scenarios/:id/:strategyKey)
  // };
  
  const reorderStrategy = async (scenarioId, strategyKey, fromIndex, toIndex) => {
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
  
    // ✅ Push to backend if user is logged in
    if (user?.email) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/strategy/${scenarioId}/${strategyKey}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ strategy: updatedScenarioToSelect[strategyKey] }),
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to update strategy order:", errorText);
        }
      } catch (err) {
        console.error("Error syncing strategy to backend:", err);
      }
    }
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSelected } from './SelectedContext';
import yaml from "js-yaml";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, logout } = useAuth(); // ✅ Use email from AuthContext
  const [ scenarios, setScenarios ] = useState([]);
  const [ sharedScenarios, setSharedScenarios ] = useState([]);
  const [ allScenarios, setAllScenarios ] = useState([]);
  const [ accessList, setAccessList ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const { selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment } = useSelected();
  
  const fetchOwned = async () => {
    try {
      // setLoading(true);
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
      // if (selectedScenario) {
      //   const updatedSelectedScenario = data.find((scenario) => scenario.id === selectedScenario.id);
      //   if (updatedSelectedScenario) {
      //     setSelectedScenario(updatedSelectedScenario);
      //   }
      // }
      return data;
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    } 
    // finally {
      // setLoading(false);
    // }
    return null;
  };

  const fetchShared = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/shared`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error("Failed to fetch scenarios");
      }
      const data = await res.json();
      setSharedScenarios(data);
      // if (selectedScenario) {
      //   const updatedSelectedScenario = data.find((shared_scenario) => shared_scenario.id === selectedScenario.id);
      //   if (updatedSelectedScenario) {
      //     setSelectedScenario(updatedSelectedScenario);
      //   }
      // }
      return data;
    }
    catch (error){
      console.error("Error fetching shared scenarios:", error);
    }
    return null;
  };

  const fetchScenarios = async () => {
    let owned = await fetchOwned();
    let shared = await fetchShared();
    let new_all_scenarios = [...owned, ...shared]
    setAllScenarios(new_all_scenarios);
    if (selectedScenario) {
      const updatedSelectedScenario = new_all_scenarios.find((scenario) => String(scenario.id) === String(selectedScenario.id));
      if (updatedSelectedScenario) {
        console.log("updating selected scenario to", updatedSelectedScenario);
        setSelectedScenario(updatedSelectedScenario);
      }
    }

  };

  const fetchAccessList = async (scenarioId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/access/${scenarioId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch access list");
      const data = await res.json();
      setAccessList(data);
    } catch (err) {
      console.error("Error fetching access list:", err.message);
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
    
        await fetchScenarios();
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
        await fetchScenarios();
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
        await fetchScenarios();
      } else {
        setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };
  
  const duplicateScenario = async (scenarioId) => {
    try {
      const scenarioToDuplicate = scenarios.find((scenario) => scenario.id === scenarioId) || 
                  sharedScenarios.find((sharedScenario) => sharedScenario.id === scenarioId);
      console.log("scenario to dup", scenarioToDuplicate);
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
  
        await fetchScenarios();
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
  
  const leaveScenario = async(scenarioId) => {
    try{
      if (user?.email) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/scenarios/leave/${scenarioId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        console.log(res.json);
        await fetchScenarios();
      }  
    }
    catch (error){
      console.error("Error leaving scenario:", error);
    }
  };

  const shareScenario = async (scenarioId, email, permission) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/share/${scenarioId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, permission }), // 👈 send the payload
      });
  
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to share scenario: ${errorText}`);
      }
  
      console.log("Scenario shared successfully!");
      return {success: true, message: "Success!"};
    } catch (err) {
      console.error("Error sharing scenario:", err.message);
      return { success: false, message: err.message };
    }
  };  

  const removeScenarioAccess = async (scenarioId, userIdToRemove) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/unshare/${scenarioId}/${userIdToRemove}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to remove access: ${text}`);
      }
  
      fetchAccessList(scenarioId);
      return true;
    } catch (error) {
      console.error("Error removing scenario access:", error);
      return false;
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
        await fetchScenarios();
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
  
        await fetchScenarios();
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
  
        await fetchScenarios();
  
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
  
        await fetchScenarios();
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
        await fetchScenarios(); // Refresh state from server
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
        await fetchScenarios();
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
        await fetchScenarios();
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
        await fetchScenarios();
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
      if (user?.email) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${scenarioId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newEventSeries),
        });
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) throw new Error("Failed to create event series");
  
        const { eventSeries: created } = await res.json();
        await fetchScenarios();
        return created;
      } else {
        const guestEventSeries = { ...newEventSeries, id: `${Date.now()}` };
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === scenarioId
              ? { ...s, Events: [...(s.Events || []), guestEventSeries] }
              : s
          )
        );
        return guestEventSeries;
      }
    } catch (error) {
      console.error("Error creating event series:", error);
      return null;
    }
  };
  
  const editEventSeries = async (scenarioId, updatedEventSeries) => {
    try {
      if (user?.email) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/events/edit/${scenarioId}/${updatedEventSeries.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedEventSeries),
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) throw new Error("Failed to update event series");
  
        const { eventSeries: updated } = await res.json();
        await fetchScenarios();
        return updated;
      } else {
        setScenarios((prev) =>
          prev.map((s) => {
            if (s.id !== scenarioId) return s;
            const updatedEvents = s.Events.map((ev) =>
              ev.id === updatedEventSeries.id ? updatedEventSeries : ev
            );
            return { ...s, Events: updatedEvents };
          })
        );
        return updatedEventSeries;
      }
    } catch (err) {
      console.error("Error editing event series:", err);
      return null;
    }
  };
  
  const duplicateEventSeries = async (scenarioId, eventSeriesId) => {
    try {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return null;
  
      const original = scenario.EventSeries?.find((ev) => `${ev.id}` === `${eventSeriesId}`);
      if (!original) return null;
  
      if (user?.email) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/events/duplicate/${scenarioId}/${eventSeriesId}`,
          {
            method: "POST",
            credentials: "include",
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) throw new Error("Failed to duplicate event series");
  
        const { eventSeries: duplicated } = await res.json();
        await fetchScenarios();
        return duplicated;
      } else {
        const duplicated = {
          ...original,
          id: `${Date.now()}`,
          name: `${original.name} (Copy)`,
        };
  
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === scenarioId
              ? { ...s, EventSeries: [...(s.EventSeries || []), duplicated] }
              : s
          )
        );
  
        return duplicated;
      }
    } catch (err) {
      console.error("Error duplicating event series:", err);
      return null;
    }
  };  

  const deleteEventSeries = async (scenarioId, eventSeriesId) => {
    try {
      if (user?.email) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/events/delete/${scenarioId}/${eventSeriesId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
  
        if (res.status === 401) {
          logout();
          throw new Error("Unauthorized");
        }
  
        if (!res.ok) throw new Error("Failed to delete event series");
  
        await fetchScenarios();
        return true;
      } else {
        setScenarios((prev) =>
          prev.map((s) => {
            if (s.id !== scenarioId) return s;
            const updatedEvents = s.Events.filter((ev) => ev.id !== eventSeriesId);
            return { ...s, Events: updatedEvents };
          })
        );
        return true;
      }
    } catch (err) {
      console.error("Error deleting event series:", err);
      return false;
    }
  };
  
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
  
  const fetchUserTaxYAML = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/get-yaml`, {
        method: "GET",
        credentials: "include",
      });
  
      if (res.status === 401) {
        console.warn("Unauthorized access while fetching YAML.");
        return null;
      }
  
      if (!res.ok) {
        throw new Error("Failed to fetch YAML file");
      }
  
      const data = await res.json();
      return data.yaml;
    } catch (error) {
      console.error("Error fetching YAML file:", error);
      return null;
    }
  };

  const uploadUserYaml = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // must match the field name expected by multer: 'file'
  
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/upload-yaml`, {
        method: "POST",
        credentials: "include",
        body: formData, // no need to set Content-Type — browser will handle it
      });
  
      if (!res.ok) throw new Error("Failed to upload YAML");
  
      return true;
    } catch (err) {
      console.error("Error uploading YAML:", err);
      return false;
    }
  };

const exportScenario = async (scenarioId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/export-yaml/${scenarioId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to export scenario");

    const yamlText = await res.text();

    // Trigger file download
    const blob = new Blob([yamlText], { type: "application/x-yaml" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "scenario.yaml");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error exporting scenario:", err);
  }
  };

const importScenario = async () => {
    return new Promise((resolve, reject) => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".yaml,.yml";
  
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return reject("No file selected");
  
        const formData = new FormData();
        formData.append("file", file);
  
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/import-yaml`, {
            method: "POST",
            credentials: "include",
            body: formData,
          });
  
          if (!res.ok) throw new Error("Failed to import scenario");
  
          const { scenario: importedScenario } = await res.json();
          fetchScenarios(); // Refresh scenario list
          resolve(importedScenario);
        } catch (error) {
          console.error("Error importing scenario:", error);
          reject(error);
        }
      };
  
      fileInput.click();
    });
  };
  
  
const removeUserYaml = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/remove-yaml`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete YAML");

    return true;
  } catch (err) {
    console.error("Error removing YAML:", err);
    return false;
  }
};
  
  useEffect(() => {
    if (user?.email) {
      fetchScenarios();
    }
  }, [user?.email]);

  return (
    <DataContext.Provider value={{ 
    scenarios, 
    setScenarios,
    sharedScenarios,
    setSharedScenarios,
    allScenarios,
    setAllScenarios,
    accessList,
    setAccessList,
    loading, 
    fetchOwned,
    fetchShared,
    fetchScenarios,
    fetchAccessList,
    createScenario, 
    editScenario, 
    duplicateScenario, 
    deleteScenario,
    leaveScenario,
    shareScenario,
    removeScenarioAccess,
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
    reorderStrategy,
    fetchUserTaxYAML,
    uploadUserYaml,
    removeUserYaml,
    exportScenario,
    importScenario,
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useSelected } from "./SelectedContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
	const { user } = useAuth(); // ✅ Use email from AuthContext
	const [scenarios, setScenarios] = useState([]);
	const [loading, setLoading] = useState(true);
	const { selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment } = useSelected();

	// ✅ Temporary hardcoded list of scenarios
	// const mockScenarios = [
	// 	{
	// 		id: "1",
	// 		name: "Unemployed",
	// 		isMarried: false,
	// 		birthYear: 1990,
	// 		birthYearSpouse: null,
	// 		lifeExpectancy: 85,
	// 		lifeExpectancySpouse: null,
	// 		inflationAssumption: 2.5,
	// 		preTaxContributionLimit: 19000,
	// 		afterTaxContributionLimit: 6000,
	// 		sharingSettings: "Private",
	// 		financialGoal: 1000000,
	// 		stateOfResidence: "NY",
	// 		rothConversionOptimizerEnabled: true,
	// 		rothConversionOptimizerStartYear: 2025,
	// 		rothConversionOptimizerEndYear: 2030,
	// 		investments: new Set([
	// 			{ id: "1", type: { name: "Stocks" }, account: "PTR", value: 15000 },
	// 			{ id: "2", type: { name: "Bonds" }, account: "PTR", value: 10000 },
	// 			{ id: "3", type: { name: "Real Estate" }, account: "PTR", value: 25000 },
	// 			{ id: "4", type: { name: "Mutual Funds" }, account: "PTR", value: 20000 },
	// 			{ id: "5", type: { name: "Cryptocurrency" }, account: "PTR", value: 5000 },
	// 		]), // Empty set for no investments
	// 		events: new Set(),
	// 		spendingStrategy: [],
	// 		rmdStrategy: [],
	// 		rothConversionStrategy: [],
	// 		expenseWithdrawalStrategy: [],
	// 	},
	// 	{
	// 		id: "2",
	// 		name: "Gaming",
	// 		isMarried: true,
	// 		birthYear: 1995,
	// 		birthYearSpouse: 1997,
	// 		lifeExpectancy: 80,
	// 		lifeExpectancySpouse: 78,
	// 		inflationAssumption: 3.0,
	// 		preTaxContributionLimit: 18000,
	// 		afterTaxContributionLimit: 5000,
	// 		sharingSettings: "Public",
	// 		financialGoal: 2000000,
	// 		stateOfResidence: "CA",
	// 		rothConversionOptimizerEnabled: false,
	// 		rothConversionOptimizerStartYear: null,
	// 		rothConversionOptimizerEndYear: null,
	// 		investments: new Set(),
	// 		events: new Set(),
	// 		spendingStrategy: [],
	// 		rmdStrategy: [],
	// 		rothConversionStrategy: [],
	// 		expenseWithdrawalStrategy: [],
	// 	},
	// ];

	// ✅ Function to fetch scenarios for logged in user
	const fetchScenarios = async () => {
		try {
			setLoading(true);

			// TODO: Uncomment when backend is set up
			const response = await fetch("http://localhost:8000/scenarios", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (response.status !== 200) {
				throw new Error("Failed to fetch scenarios");
			}
			const data = await response.json();
			setScenarios(data);
			// ✅ Use temporary hardcoded scenarios for now
			//setScenarios(mockScenarios);
		} catch (error) {
			console.error("Error fetching scenarios:", error);
		} finally {
			setLoading(false);
		}
	};

	const createEventSeries = async (scenarioId, newEventSeries) => {
		try {
			const newEventWithId = { ...newEventSeries, id: `${Date.now()}` };

			let updatedScenarioToSelect = null;

			setScenarios((prevScenarios) =>
				prevScenarios.map((scenario) => {
					if (scenario.id === scenarioId) {
						const updatedEvents = new Set(scenario.events);
						updatedEvents.add(newEventWithId);

						const updatedScenario = {
							...scenario,
							events: updatedEvents,
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
			console.error("Error creating event series:", error);
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

						const updatedScenario = {
							...scenario,
							events: updatedEvents,
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
			console.error("Error editing event series:", error);
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

				if (response.status !== 201) {
					throw new Error("Failed to create scenario");
				}

				const data = await response.json();

				// ✅ Add to the list without waiting for a re-fetch
				setScenarios((prev) => [...prev, data.scenario]);
			} else {
				// ✅ If no user email → Directly add to context
				setScenarios((prev) => [...prev, { ...newScenario, id: `${Date.now()}` }]);
			}
		} catch (error) {
			console.error("Error creating scenario:", error);
		}
	};

	// ✅ Function to edit an existing scenario
	const editScenario = async (editedScenario) => {
		try {
			if (user?.email) {
				// TODO: Uncomment when backend is set up
				const response = await fetch(`http://localhost:8000/scenarios/edit/${editedScenario.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ editedScenario }),
					credentials: "include",
				});

				if (response.status !== 200) {
					throw new Error("Failed to edit scenario");
				}

				const data = await response.json();
				const updatedScenario = data.scenario;
				// ✅ Update the scenario in the list without waiting for a re-fetch
				setScenarios((prev) =>
					prev.map((scenario) => (scenario.id === updatedScenario.id ? updatedScenario : scenario))
				);
			} else {
				// ✅ If no user email → Directly update in context
				setScenarios((prev) =>
					prev.map((scenario) => (scenario.id === editedScenario.id ? editedScenario : scenario))
				);
			}
		} catch (error) {
			console.error("Error editing scenario:", error);
		}
	};

	// ✅ Function to duplicate an existing scenario
	const duplicateScenario = async (scenarioId) => {
		try {
			const scenarioToDuplicate = scenarios.find((scenario) => scenario.id === scenarioId);
			if (!scenarioToDuplicate) {
				console.error("Scenario not found for duplication");
				return;
			}

			const duplicatedScenario = {
				...scenarioToDuplicate,
				id: `${Date.now()}`, // Assign a new unique ID
				name: `${scenarioToDuplicate.name} (Copy)`, // Append "Copy" to the name
			};

			if (user?.email) {
				// TODO: Uncomment when backend is set up
				const response = await fetch(`http://localhost:8000/scenarios/duplicate/${scenarioId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ duplicatedScenario }),
					credentials: "include",
				});

				if (response.status !== 201) {
					throw new Error("Failed to duplicate scenario");
				}

				const data = await response.json();
				const newScenario = data.scenario;
				setScenarios((prev) => [...prev, newScenario]);
				// ✅ Temporarily add to context until backend is ready
				//setScenarios((prev) => [...prev, duplicatedScenario]);
			} else {
				// ✅ If no user email → Directly add to context
				setScenarios((prev) => [...prev, duplicatedScenario]);
			}
		} catch (error) {
			console.error("Error duplicating scenario:", error);
		}
	};

	// ✅ Function to delete a scenario
	const deleteScenario = async (scenarioId) => {
		try {
			if (user?.email) {
				// TODO: Uncomment when backend is set up
				const response = await fetch(`http://localhost:8000/scenarios/delete/${scenarioId}`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});

				if (response.status !== 200) {
					throw new Error("Failed to duplicate scenario");
				}

				// ✅ Remove the scenario from the list without waiting for a re-fetch
				setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
			} else {
				// ✅ If no user email → Directly remove from context
				setScenarios((prev) => prev.filter((scenario) => scenario.id !== scenarioId));
			}
		} catch (error) {
			console.error("Error deleting scenario:", error);
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
			console.error("Error creating investment:", error);
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
			console.error("Error editing investment:", error);
		}
	};

	const deleteEventSeries = async (scenarioId, eventSeriesId) => {
		try {
			let updatedScenarioToSelect = null;

			setScenarios((prevScenarios) =>
				prevScenarios.map((scenario) => {
					if (scenario.id === scenarioId) {
						const updatedEvents = new Set(
							Array.from(scenario.events).filter((event) => event.id !== eventSeriesId)
						);

						const updatedScenario = {
							...scenario,
							events: updatedEvents,
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
			console.error("Error deleting event series:", error);
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
						const investmentToDuplicate = investmentsArray.find((inv) => inv.id === investmentId);
						if (!investmentToDuplicate) return scenario;

						const duplicatedInvestment = {
							...investmentToDuplicate,
							id: `${Date.now()}`,
							type: {
								...investmentToDuplicate.type,
								name: `${investmentToDuplicate.type.name} (Copy)`,
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
			console.error("Error duplicating investment:", error);
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
							Array.from(scenario.investments).filter((inv) => inv.id !== investmentId)
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
			console.error("Error deleting investment:", error);
		}
	};

	const duplicateEventSeries = async (scenarioId, eventSeriesId) => {
		try {
			let duplicatedEvent = null;
			let updatedScenarioToSelect = null;

			setScenarios((prevScenarios) =>
				prevScenarios.map((scenario) => {
					if (scenario.id === scenarioId) {
						const eventToDuplicate = Array.from(scenario.events).find(
							(event) => event.id === eventSeriesId
						);
						if (!eventToDuplicate) return scenario;

						duplicatedEvent = {
							...eventToDuplicate,
							id: `${Date.now()}`,
							name: `${eventToDuplicate.name} (Copy)`,
						};

						const updatedEvents = new Set(scenario.events);
						updatedEvents.add(duplicatedEvent);

						const updatedScenario = {
							...scenario,
							events: updatedEvents,
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
			console.error("Error duplicating event series:", error);
		}
	};
	// ✅ Automatically fetch scenarios when user logs in or email changes
	useEffect(() => {
		if (user?.email) {
			fetchScenarios(); // ✅ Load hardcoded list for now
		}
	}, [user?.email]);

	return (
		<DataContext.Provider
			value={{
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
			}}>
			{children}
		</DataContext.Provider>
	);
};

// ✅ Custom hook to access scenario context
export const useData = () => {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error("useScenarios must be used within a DataProvider");
	}
	return context;
};

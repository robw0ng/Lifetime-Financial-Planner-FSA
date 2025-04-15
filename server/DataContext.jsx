import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
	const { user } = useAuth(); // ✅ Use email from AuthContext
	const [scenarios, setScenarios] = useState([]);
	const [loading, setLoading] = useState(true);

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
			const response = await fetch(`${import.meta.env.VITE_API_URL}/scenarios`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (response.status === 401) {
				logout();
				throw new Error("Unauthorized");
			}
			if (response.status !== 200) {
				throw new Error("Failed to fetch scenarios");
			}
			const data = await response.json();
			setScenarios(data);
		} catch (error) {
			console.error("Error fetching scenarios:", error);
		} finally {
			setLoading(false);
		}
	};

	// ✅ Function to create a new scenario
	const createScenario = async (newScenario) => {
		try {
			if (user?.email) {
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

				if (res.status !== 201) {
					const errorText = await res.text();
					throw new Error(`Failed to create scenario: ${errorText}`);
				}

				const { scenario: createdScenario } = await res.json();

				// setScenarios((prev) => [...prev, createdScenario]);
				fetchScenarios();
				return createdScenario;
			} else {
				const createdScenario = { ...newScenario, id: `${Date.now()}` };
				setScenarios((prev) => [...prev, createdScenario]);
				return createdScenario;
			}
		} catch (error) {
			console.error("Error creating scenario:", error);
		}
		return null;
	};

	// ✅ Function to edit an existing scenario
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

	// ✅ Function to duplicate an existing scenario
	const duplicateScenario = async (scenarioId) => {
		try {
			const scenarioToDuplicate = scenarios.find((scenario) => scenario.id === scenarioId);
			if (!scenarioToDuplicate) {
				console.error("Scenario not found for duplication");
				return null;
			}

			if (user?.email) {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/scenarios/duplicate/${scenarioId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});

				if (res.status === 401) {
					logout();
					throw new Error("Unauthorized");
				}

				if (res.status !== 201) {
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

	// ✅ Function to delete a scenario
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

				if (res.status !== 200) {
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

	// ✅ Function to create an event series
	const createEventSeries = async (scenarioId, newEventSeries) => {
		try {
			if (user?.email) {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/eventseries/${scenarioId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newEventSeries),
					credentials: "include",
				});

				if (response.status === 401) {
					throw new Error("Unauthorized");
				}
				if (response.status !== 201) {
					throw new Error("Failed to create event series");
				}
				const { eventSeries: createdEventSeries } = await response.json();
				fetchScenarios();
				return createdEventSeries;
			} else {
				// If no user, update context only
				const newEventWithId = { ...newEventSeries, id: `${Date.now()}` };
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(Array.from(scenario.events || []));
							updatedEvents.add(newEventWithId);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
				return newEventWithId;
			}
		} catch (error) {
			console.error("Error creating event series:", error);
		}
		return null;
	};

	const editEventSeries = async (scenarioId, editedEventSeries) => {
		try {
			if (user?.email) {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/eventseries/edit/${scenarioId}/${editedEventSeries.id}`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(editedEventSeries),
						credentials: "include",
					}
				);
				if (response.status === 401) {
					logout();
					throw new Error("Unauthorized");
				}
				if (response.status !== 200) {
					throw new Error("Failed to edit event series");
				}
				const data = await response.json();
				const updatedEventSeries = data.eventSeries;
				fetchScenarios();
				return updatedEventSeries;
			} else {
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(
								Array.from(scenario.events || []).map((event) =>
									event.id === editedEventSeries.id ? editedEventSeries : event
								)
							);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
				return editedEventSeries;
			}
		} catch (error) {
			console.error("Error editing event series:", error);
		}
		return null;
	};

	const duplicateEventSeries = async (scenarioId, eventSeriesId) => {
		try {
			const scenario = scenarios.find((scenario) => scenario.id === scenarioId);
			if (!scenario) {
				console.error("Scenario of event series not found for duplication");
				return null;
			}
			const eventToDuplicate = Array.from(scenario.events || []).find((event) => event.id === eventSeriesId);
			if (!eventToDuplicate) {
				console.error("Event series not found for duplication");
				return null;
			}

			if (user?.email) {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL}/eventseries/duplicate/${scenarioId}/${eventSeriesId}`,
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

				if (res.status !== 201) {
					const errorText = await res.text();
					throw new Error(`Failed to duplicate event series: ${errorText}`);
				}

				const { eventSeries: duplicatedEventSeries } = await res.json();

				// setScenarios((prev) => [...prev, duplicatedScenario]);
				fetchScenarios();
				return duplicatedEventSeries;
			} else {
				// Guest user fallback
				const duplicatedEventSeries = {
					...eventToDuplicate,
					id: `${Date.now()}`,
					name: `${eventToDuplicate.name} (Copy)`,
				};

				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) =>
						scenario.id === scenarioId
							? { ...scenario, events: new Set([...scenario.events, duplicatedEventSeries]) }
							: scenario
					)
				);
				return duplicatedEventSeries;
			}
		} catch (error) {
			console.error("Error duplicating scenario:", error);
			return null;
		}
	};

	const deleteEventSeries = async (scenarioId, eventSeriesId) => {
		try {
			if (user?.email) {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/eventseries/delete/${scenarioId}/${eventSeriesId}`,
					{
						method: "DELETE",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}
				);
				if (response.status === 401) {
					logout();
					throw new Error("Unauthorized");
				}
				if (response.status !== 200) {
					throw new Error("Failed to delete event series");
				}
				console.log("Event series deleted from backend");
				fetchScenarios();
			} else {
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(
								Array.from(scenario.events || []).filter((event) => event.id !== eventSeriesId)
							);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
			}
		} catch (error) {
			console.error("Error deleting event series:", error);
		}
		return null;
	};

	const createInvestmentType = async (scenarioId, investmentTypeId) => {};

	const editInvestmentType = async (scenarioId, investmentTypeId) => {};

	const duplicateInvestmentType = async (scenarioId, investmentTypeId) => {};

	const deleteInvestmentType = async (scenarioId, investmentTypeId) => {};

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
				createInvestmentType,
				editInvestmentType,
				duplicateInvestmentType,
				deleteInvestmentType,
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

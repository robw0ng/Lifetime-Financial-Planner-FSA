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

	// ✅ Function to create a new scenario
	const createScenario = async (newScenario) => {
		try {
			if (user?.email) {
				// TODO: Uncomment when backend is set up
				const response = await fetch("http://localhost:8000/scenarios", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newScenario),
					credentials: "include",
				});

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
					body: JSON.stringify(editedScenario),
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

	// Function to fetch event series for a scenario
	const fetchEventSeries = async (scenarioId) => {
		try {
			if (user?.email) {
				const response = await fetch(`http://localhost:8000/eventseries/${scenarioId}`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});
				if (response.status !== 200) {
					throw new Error("Failed to fetch event series");
				}
				const data = await response.json(); // data is expected to be an array
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) =>
						scenario.id === scenarioId ? { ...scenario, events: new Set(data) } : scenario
					)
				);
			}
		} catch (error) {
			console.error("Error fetching event series:", error);
		}
	};

	const createEventSeries = async (scenarioId, newEventSeries) => {
		try {
			if (user?.email) {
				const response = await fetch(`http://localhost:8000/eventseries/${scenarioId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newEventSeries),
					credentials: "include",
				});
				if (response.status !== 201) {
					throw new Error("Failed to create event series");
				}
				const data = await response.json();
				const createdEventSeries = data.eventSeries;
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(Array.from(scenario.events || []));
							updatedEvents.add(createdEventSeries);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
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
			}
		} catch (error) {
			console.error("Error creating event series:", error);
		}
	};

	const editEventSeries = async (scenarioId, editedEventSeries) => {
		try {
			if (user?.email) {
				const response = await fetch(
					`http://localhost:8000/eventseries/edit/${scenarioId}/${editedEventSeries.id}`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(editedEventSeries),
						credentials: "include",
					}
				);
				if (response.status !== 200) {
					throw new Error("Failed to edit event series");
				}
				const data = await response.json();
				const updatedEventSeries = data.eventSeries;
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(
								Array.from(scenario.events || []).map((event) =>
									event.id === updatedEventSeries.id ? updatedEventSeries : event
								)
							);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
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
			}
		} catch (error) {
			console.error("Error editing event series:", error);
		}
	};

	const duplicateEventSeries = async (scenarioId, eventSeriesId) => {
		try {
			if (user?.email) {
				const response = await fetch(
					`http://localhost:8000/eventseries/duplicate/${scenarioId}/${eventSeriesId}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}
				);
				if (response.status !== 201) {
					throw new Error("Failed to duplicate event series");
				}
				const data = await response.json();
				const duplicatedEvent = data.eventSeries;
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(Array.from(scenario.events || []));
							updatedEvents.add(duplicatedEvent);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
				return duplicatedEvent;
			} else {
				const eventToDuplicate = Array.from(scenarios.find((s) => s.id === scenarioId)?.events || []).find(
					(event) => event.id === eventSeriesId
				);
				if (!eventToDuplicate) return;
				const duplicatedEvent = {
					...eventToDuplicate,
					id: `${Date.now()}`,
					name: `${eventToDuplicate.name} (Copy)`,
				};
				setScenarios((prevScenarios) =>
					prevScenarios.map((scenario) => {
						if (scenario.id === scenarioId) {
							const updatedEvents = new Set(Array.from(scenario.events || []));
							updatedEvents.add(duplicatedEvent);
							return { ...scenario, events: updatedEvents };
						}
						return scenario;
					})
				);
				return duplicatedEvent;
			}
		} catch (error) {
			console.error("Error duplicating event series:", error);
		}
	};

	const deleteEventSeries = async (scenarioId, eventSeriesId) => {
		try {
			if (user?.email) {
				const response = await fetch(
					`http://localhost:8000/eventseries/delete/${scenarioId}/${eventSeriesId}`,
					{
						method: "DELETE",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}
				);
				if (response.status !== 200) {
					throw new Error("Failed to delete event series");
				}
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
				loading,
				fetchScenarios,
				createScenario,
				editScenario,
				duplicateScenario,
				deleteScenario,
				fetchEventSeries,
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

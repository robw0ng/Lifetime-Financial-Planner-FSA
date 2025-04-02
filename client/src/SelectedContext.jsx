import React, { createContext, useState, useContext } from 'react';

// Create the context
const SelectedContext = createContext();

// Create a provider component
export const SelectedProvider = ({ children }) => {

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [selectedEventSeries, setSelectedEventSeries] = useState(null);
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [selectedStrategyItem, setSelectedStrategyItem] = useState(null);

    const deselectScenario = () => {
        setSelectedScenario(null);
        setSelectedInvestment(null);
        setSelectedEventSeries(null);
        setSelectedStrategy(null);
        setSelectedStrategyItem(null)
    };

    const deselectInvestment = () => {
        setSelectedInvestment(null);
    }

    const deselectEventSeries = () =>{
        setSelectedEventSeries(null);
    }

    const deselectStrategy = () => {
        setSelectedStrategy(null);
        setSelectedStrategyItem(null)
    }

    const deselectStrategyItem = () => {
        setSelectedStrategyItem(null)
    }
    // deselects:
    // deselectScenario
    // deselectInvestment
    return (
        <SelectedContext.Provider value={{ selectedScenario, 
        setSelectedScenario, 
        selectedInvestment, 
        setSelectedInvestment, 
        selectedEventSeries,
        setSelectedEventSeries,
        selectedStrategy,
        setSelectedStrategy,
        selectedStrategyItem,
        setSelectedStrategyItem,
        deselectScenario,
        deselectInvestment, 
        deselectEventSeries,
        deselectStrategy,
        deselectStrategyItem
        }}>
            {children}
        </SelectedContext.Provider>
    );
};

// Custom hook to use the SelectedContext
export const useSelected = () => {
    const context = useContext(SelectedContext);
    if (!context) {
        throw new Error('useSelected must be used within a SelectedScenarioProvider');
    }
    return context;
};
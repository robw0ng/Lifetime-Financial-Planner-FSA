import React, { createContext, useState, useContext } from 'react';

// Create the context
const SelectedContext = createContext();

// Create a provider component
export const SelectedProvider = ({ children }) => {
    const [selectedScenario, setSelectedScenario] = useState({
        id: "0",
        name: "Not Selected",
        description: "None",
        isMarried: false,
        birthYear: -1, // -1 to represent unset state
        birthYearSpouse: -1, // Optional, so left as -1 when not set
        lifeExpectancy: -1,
        lifeExpectancySpouse: -1, // Optional
        inflationAssumption: 0.0,
        afterTaxContributionLimit: 0.0,
        sharingSettings: "",
        financialGoal: 0.0,
        stateOfResidence: "None",
        investments: new Set(), // Empty set for no investments
        events: new Set(), // Empty set for no events
        spendingStrategy: [], // Empty list for no strategy
        rmdStrategy: [], // Empty list for no RMD strategy
        rothConversionStrategy: [], // Empty list for no conversion strategy
        expenseWithdrawalStrategy: [], // Empty list for no withdrawal strategy
        rothConversionOptimizerEnabled: false,
        rothConversionOptimizerStartYear: -1,
        rothConversionOptimizerEndYear: -1,
    });

    return (
        <SelectedContext.Provider value={{ selectedScenario, setSelectedScenario }}>
            {children}
        </SelectedContext.Provider>
    );
};

// Custom hook to use the SelectedContext
export const useSelectedScenario = () => {
    const context = useContext(SelectedContext);
    if (!context) {
        throw new Error('useSelectedScenario must be used within a SelectedScenarioProvider');
    }
    return context;
};
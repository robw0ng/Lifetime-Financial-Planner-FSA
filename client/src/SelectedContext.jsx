import React, { createContext, useState, useContext } from 'react';

// Create the context
const SelectedContext = createContext();

// Create a provider component
export const SelectedProvider = ({ children }) => {

    // const nullScenario = {
    //     id: "0",
    //     name: "NA",
    //     isMarried: false,
    //     birthYear: -1, // -1 to represent unset state
    //     birthYearSpouse: -1, // Optional, so left as -1 when not set
    //     lifeExpectancy: -1,
    //     lifeExpectancySpouse: -1, // Optional
    //     inflationAssumption: -1.0,
    //     preTaxContributionLimit: -1.0,
    //     afterTaxContributionLimit: -1.0,
    //     sharingSettings: "NA",
    //     financialGoal: -1.0,
    //     stateOfResidence: "NA",
    //     investments: new Set(), // Empty set for no investments
    //     events: new Set(), // Empty set for no events
    //     spendingStrategy: [], // Empty list for no strategy
    //     rmdStrategy: [], // Empty list for no RMD strategy
    //     rothConversionStrategy: [], // Empty list for no conversion strategy
    //     expenseWithdrawalStrategy: [], // Empty list for no withdrawal strategy
    //     rothConversionOptimizerEnabled: false,
    //     rothConversionOptimizerStartYear: -1,
    //     rothConversionOptimizerEndYear: -1,
    // };

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [selectedInvestment, setSelectedInvestment] = useState(null);

    const deselectScenario = () => {
        setSelectedScenario(null);
        setSelectedInvestment(null);
    };

    const deselectInvestment = () => {
        setSelectedInvestment(null);
    }

    return (
        <SelectedContext.Provider value={{ selectedScenario, setSelectedScenario, selectedInvestment, setSelectedInvestment, deselectInvestment, deselectScenario }}>
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
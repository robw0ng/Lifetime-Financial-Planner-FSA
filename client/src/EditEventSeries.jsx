import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";
// import "./CreateEventSeries.css";

export default function EditEventSeries() {
  const navigate = useNavigate();
  const { selectedScenario, selectedEventSeries, setSelectedEventSeries } = useSelected();
  const { editEventSeries } = useData();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "income",

    // Start Year Fields
    startYearType: "fixed", // fixed, uniform, normal, sameAsEvent, yearAfterEvent
    startYearValue: "",
    startYearMin: "",
    startYearMax: "",
    startYearMean: "",
    startYearStd: "",
    startYearEventId: "",

    // Duration Fields
    durationType: "fixed", // fixed, uniform, normal
    durationValue: "",
    durationMin: "",
    durationMax: "",
    durationMean: "",
    durationStd: "",

    // Income/Expense Specific
    initialAmount: "",
    expectedChangeType: "fixed", // fixed, uniform, normal
    expectedChangeValue: "",
    expectedChangeMin: "",
    expectedChangeMax: "",
    expectedChangeMean: "",
    expectedChangeStd: "",
    inflationAdjusted: false,
    userPercentage: "",
    isSocialSecurity: false,
    isDiscretionary: false,

    // Invest/Rebalance Specific
    allocationType: "fixed", // "fixed" or "glide"
    allocationFixed: {},
    allocationGlideInitial: {},
    allocationGlideFinal: {},
    maxCash: "",
  });

  // When an event series is selected for editing, pre-populate the form data.
  useEffect(() => {
    if (selectedEventSeries) {
      // Handle allocation: check if "initial" and "final" exist to decide the mode.
      let allocationType = "fixed";
      let allocationFixed = {};
      let allocationGlideInitial = {};
      let allocationGlideFinal = {};

      if (selectedEventSeries.is_glide_path) {
        allocationType = "glide";
        allocationGlideInitial = selectedEventSeries.asset_allocation || {};
        allocationGlideFinal = selectedEventSeries.asset_allocation2 || {};
      } else {
        allocationFixed = selectedEventSeries.asset_allocation || {};
      }

      setFormData({
        name: selectedEventSeries.name || "",
        description: selectedEventSeries.description || "",
        type: selectedEventSeries.type || "income",

        // Start Year fields
        startYearType: selectedEventSeries.start_year_type,
        startYearValue:
          selectedEventSeries.start_year_type === "fixed"
            ? selectedEventSeries.start_year_value
            : "",
        startYearMin:
          selectedEventSeries.start_year_type === "uniform"
            ? selectedEventSeries.start_year_lower
            : "",
        startYearMax:
          selectedEventSeries.start_year_type === "uniform"
            ? selectedEventSeries.start_year_upper
            : "",
        startYearMean:
          selectedEventSeries.start_year_type === "normal"
            ? selectedEventSeries.start_year_mean
            : "",
        startYearStd:
          selectedEventSeries.start_year_type === "normal"
            ? selectedEventSeries.start_year_std_dev
            : "",
        startYearEventId:
          selectedEventSeries.startYear &&
          (selectedEventSeries.start_year_type === "sameAsEvent" ||
            selectedEventSeries.start_year_type === "yearAfterEvent")
            ? selectedEventSeries.start_year_other_event
            : "",

        // Duration fields
        durationType: selectedEventSeries.duration_type || "fixed",
        durationValue:
          selectedEventSeries.duration_type === "fixed"
            ? selectedEventSeries.duration_value
            : "",
        durationMin:
          selectedEventSeries.duration_type === "uniform"
            ? selectedEventSeries.duration_lower
            : "",
        durationMax:
          selectedEventSeries.duration_type === "uniform"
            ? selectedEventSeries.duration_upper
            : "",
        durationMean:
          selectedEventSeries.duration_type === "normal"
            ? selectedEventSeries.duration_mean
            : "",
        durationStd:
          selectedEventSeries.duration_type === "normal"
            ? selectedEventSeries.duration_std_dev
            : "",

        // Income/Expense fields
        initialAmount: selectedEventSeries.initial_amount || "",
        expectedChangeType: selectedEventSeries.expected_change_type || "fixed",
        expectedChangeValue:
          selectedEventSeries.expected_change_type === "fixed"
            ? selectedEventSeries.expected_change_value
            : "",
        expectedChangeMin:
          selectedEventSeries.expected_change_type === "uniform"
            ? selectedEventSeries.expected_change_lower
            : "",
        expectedChangeMax:
          selectedEventSeries.expected_change_type === "uniform"
            ? selectedEventSeries.expected_change_upper
            : "",
        expectedChangeMean:
          selectedEventSeries.expected_change_type === "normal"
            ? selectedEventSeries.expected_change_mean
            : "",
        expectedChangeStd:
          selectedEventSeries.expected_change_type === "normal"
            ? selectedEventSeries.expected_change_std_dev
            : "",
        inflationAdjusted: selectedEventSeries.inflation_adjusted || false,
        userPercentage: selectedEventSeries.user_percentage || "",
        isSocialSecurity: selectedEventSeries.is_social || false,
        isDiscretionary: selectedEventSeries.is_discretionary || false,

        // Invest/Rebalance fields
        allocationType,
        allocationFixed,
        allocationGlideInitial,
        allocationGlideFinal,
        maxCash: selectedEventSeries.max_cash || "",
      });
    }
  }, [selectedEventSeries]);

  // Generic change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Allocation change handlers for fixed allocation
  const handleAllocationFixedChange = (investmentId, value) => {
    setFormData((prev) => ({
      ...prev,
      allocationFixed: {
        ...prev.allocationFixed,
        [investmentId]: value,
      },
    }));
  };

  // Allocation change handlers for glide path (initial)
  const handleAllocationGlideInitialChange = (investmentId, value) => {
    setFormData((prev) => ({
      ...prev,
      allocationGlideInitial: {
        ...prev.allocationGlideInitial,
        [investmentId]: value,
      },
    }));
  };

  // Allocation change handlers for glide path (final)
  const handleAllocationGlideFinalChange = (investmentId, value) => {
    setFormData((prev) => ({
      ...prev,
      allocationGlideFinal: {
        ...prev.allocationGlideFinal,
        [investmentId]: value,
      },
    }));
  };

  // Build arrays from selectedScenario (investments and events)
  const scenarioInvestments =
    selectedScenario && selectedScenario.Investments
      ? Array.isArray(selectedScenario.Investments)
        ? selectedScenario.Investments
        : Array.from(selectedScenario.Investments)
      : [];

  const scenarioEvents =
    selectedScenario && selectedScenario.EventSeries
      ? Array.isArray(selectedScenario.EventSeries)
        ? selectedScenario.EventSeries
        : Array.from(selectedScenario.EventSeries)
      : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScenario || !selectedEventSeries) {
      alert("Scenario or event series not selected.");
      return;
    }

    // Validate allocation totals for invest/rebalance
    if (formData.type === "invest" || formData.type === "rebalance") {
      if (formData.allocationType === "fixed") {
        const totalFixed = Object.values(formData.allocationFixed).reduce(
          (sum, val) => sum + Number(val || 0),
          0
        );
        if (totalFixed !== 100) {
          alert("The fixed allocation percentages must add up to 100. Currently they add up to " + totalFixed);
          return;
        }
      } else if (formData.allocationType === "glide") {
        const totalInitial = Object.values(formData.allocationGlideInitial).reduce(
          (sum, val) => sum + Number(val || 0),
          0
        );
        const totalFinal = Object.values(formData.allocationGlideFinal).reduce(
          (sum, val) => sum + Number(val || 0),
          0
        );
        if (totalInitial !== 100) {
          alert("The initial glide allocation percentages must add up to 100. Currently they add up to " + totalInitial);
          return;
        }
        if (totalFinal !== 100) {
          alert("The final glide allocation percentages must add up to 100. Currently they add up to " + totalFinal);
          return;
        }
      }
    }

    // Build startYear object
    let startYear = null;
    if (formData.startYearType === "fixed") {
      startYear = { value: Number(formData.startYearValue), type: "fixed" };
    } else if (formData.startYearType === "uniform") {
      startYear = {
        min: Number(formData.startYearMin),
        max: Number(formData.startYearMax),
        type: "uniform",
      };
    } else if (formData.startYearType === "normal") {
      startYear = {
        mean: Number(formData.startYearMean),
        std: Number(formData.startYearStd),
        type: "normal",
      };
    } else if (
      formData.startYearType === "sameAsEvent" ||
      formData.startYearType === "yearAfterEvent"
    ) {
      startYear = { eventId: formData.startYearEventId, type: formData.startYearType };
    }

    // Build duration object
    let duration = null;
    if (formData.durationType === "fixed") {
      duration = { value: Number(formData.durationValue), type: "fixed" };
    } else if (formData.durationType === "uniform") {
      duration = {
        min: Number(formData.durationMin),
        max: Number(formData.durationMax),
        type: "uniform",
      };
    } else if (formData.durationType === "normal") {
      duration = {
        mean: Number(formData.durationMean),
        std: Number(formData.durationStd),
        type: "normal",
      };
    }

    // Build expectedChange object for income/expense
    let expectedChange = null;
    if (formData.type === "income" || formData.type === "expense") {
      if (formData.expectedChangeType === "fixed") {
        expectedChange = { value: Number(formData.expectedChangeValue), type: "fixed" };
      } else if (formData.expectedChangeType === "uniform") {
        expectedChange = {
          min: Number(formData.expectedChangeMin),
          max: Number(formData.expectedChangeMax),
          type: "uniform",
        };
      } else if (formData.expectedChangeType === "normal") {
        expectedChange = {
          mean: Number(formData.expectedChangeMean),
          std: Number(formData.expectedChangeStd),
          type: "normal",
        };
      }
    }

    // Prepare allocation data based on allocationType
    let allocationData = null;
    if (formData.type === "invest" || formData.type === "rebalance") {
      if (formData.allocationType === "fixed") {
        allocationData = formData.allocationFixed;
      } else if (formData.allocationType === "glide") {
        allocationData = {
          initial: formData.allocationGlideInitial,
          final: formData.allocationGlideFinal,
        };
      }
    }

    // Construct updated event series object
    const updatedEventSeries = {
      id: selectedEventSeries.id,
      name: formData.name,
      description: formData.description,
      type: formData.type,

      // Start Year
      start_year_type: formData.startYearType,
      start_year_value: formData.startYearType === "fixed" ? Number(formData.startYearValue) : null,
      start_year_mean: formData.startYearType === "normal" ? Number(formData.startYearMean) : null,
      start_year_std_dev: formData.startYearType === "normal" ? Number(formData.startYearStd) : null,
      start_year_lower: formData.startYearType === "uniform" ? Number(formData.startYearMin) : null,
      start_year_upper: formData.startYearType === "uniform" ? Number(formData.startYearMax) : null,
      start_year_other_event:
        formData.startYearType === "sameAsEvent" || formData.startYearType === "yearAfterEvent"
          ? formData.startYearEventId
          : null,

      // Duration
      duration_type: formData.durationType,
      duration_value: formData.durationType === "fixed" ? Number(formData.durationValue) : null,
      duration_mean: formData.durationType === "normal" ? Number(formData.durationMean) : null,
      duration_std_dev: formData.durationType === "normal" ? Number(formData.durationStd) : null,
      duration_lower: formData.durationType === "uniform" ? Number(formData.durationMin) : null,
      duration_upper: formData.durationType === "uniform" ? Number(formData.durationMax) : null,
    }

    //   initialAmount:
    //     (formData.type === "income" || formData.type === "expense")
    //       ? Number(formData.initialAmount)
    //       : null,
    //   expectedChange:
    //     (formData.type === "income" || formData.type === "expense")
    //       ? expectedChange
    //       : null,
    //   inflationAdjusted: formData.inflationAdjusted,
    //   userPercentage:
    //     selectedScenario && selectedScenario.isMarried && formData.userPercentage
    //       ? Number(formData.userPercentage)
    //       : null,
    //   isSocialSecurity: formData.type === "income" ? formData.isSocialSecurity : null,
    //   isDiscretionary: formData.type === "expense" ? formData.isDiscretionary : null,
    //   allocation:
    //     (formData.type === "invest" || formData.type === "rebalance")
    //       ? allocationData
    //       : null,
    //   maxCash: formData.type === "invest" ? Number(formData.maxCash) : null,
    // };
      // Income or Expense
      if (formData.type === "income" || formData.type === "expense") {
        updatedEventSeries.initial_amount = Number(formData.initialAmount);
        updatedEventSeries.expected_change_type = formData.expectedChangeType;
  
        if (formData.expectedChangeType === "fixed") {
          updatedEventSeries.expected_change_value = Number(formData.expectedChangeValue);
        } else if (formData.expectedChangeType === "uniform") {
          updatedEventSeries.expected_change_lower = Number(formData.expectedChangeMin);
          updatedEventSeries.expected_change_upper = Number(formData.expectedChangeMax);
        } else if (formData.expectedChangeType === "normal") {
          updatedEventSeries.expected_change_mean = Number(formData.expectedChangeMean);
          updatedEventSeries.expected_change_std_dev = Number(formData.expectedChangeStd);
        }
  
        updatedEventSeries.inflation_adjusted = formData.inflationAdjusted;
        updatedEventSeries.user_percentage =
          selectedScenario && selectedScenario.is_married && formData.userPercentage
            ? Number(formData.userPercentage)
            : 100; // default to 100 if not provided
        if (formData.type === "income") {
          updatedEventSeries.is_social = formData.isSocialSecurity;
        }
        if (formData.type === "expense") {
          updatedEventSeries.is_discretionary = formData.isDiscretionary;
        }
      }
  
      // Invest or Rebalance
      if (formData.type === "invest" || formData.type === "rebalance") {
        const isGlide = formData.allocationType === "glide";
        updatedEventSeries.is_glide_path = isGlide;
        updatedEventSeries.asset_allocation = isGlide ? formData.allocationGlideInitial : formData.allocationFixed;
        if (isGlide) {
          updatedEventSeries.asset_allocation2 = formData.allocationGlideFinal;
        }
        if (formData.type === "invest") {
          updatedEventSeries.max_cash = Number(formData.maxCash);
        }
      }

    const edited_event_series = await editEventSeries(selectedScenario.id, updatedEventSeries);
    console.log("edited event series", edited_event_series);
    setSelectedEventSeries(edited_event_series);
    navigate("/eventseries");
  };

  return (
    <div className="create-event-series-container">
      <h2>Edit Event Series</h2>
      <form onSubmit={handleSubmit}>
        {/* Name, Description, and Type */}
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Type:
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="invest">Invest</option>
            <option value="rebalance">Rebalance</option>
          </select>
        </label>

        {/* Start Year Section */}
        <fieldset>
          <legend>Start Year</legend>
          <label>
            Start Year Type:
            <select name="startYearType" value={formData.startYearType} onChange={handleChange}>
              <option value="fixed">Fixed</option>
              <option value="uniform">Uniform Distribution</option>
              <option value="normal">Normal Distribution</option>
              <option value="sameAsEvent">Same as Event Start</option>
              <option value="yearAfterEvent">Year After Event Ends</option>
            </select>
          </label>
          {formData.startYearType === "fixed" && (
            <label>
              Year:
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="startYearValue"
                value={formData.startYearValue}
                onChange={handleChange}
                required
              />
            </label>
          )}
          {formData.startYearType === "uniform" && (
            <>
              <label>
                Min Year:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="startYearMin"
                  value={formData.startYearMin}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Max Year:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="startYearMax"
                  value={formData.startYearMax}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}
          {formData.startYearType === "normal" && (
            <>
              <label>
                Mean Year:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="startYearMean"
                  value={formData.startYearMean}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Std Dev:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="startYearStd"
                  value={formData.startYearStd}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}
          {(formData.startYearType === "sameAsEvent" ||
            formData.startYearType === "yearAfterEvent") && (
            <label>
              Reference Event Series:
              <select
                name="startYearEventId"
                value={formData.startYearEventId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select an Event Series --</option>
                {scenarioEvents.map((event) => {
                  let displayYear = "";
                  if (formData.startYearType === "sameAsEvent") {
                    displayYear =
                      event.start_year_type === "fixed"
                        ? event.start_year_value
                        : "";
                  } else if (formData.startYearType === "yearAfterEvent") {
                    if (
                      event.start_year_type === "fixed" &&
                      event.duration_type === "fixed"
                    ) {
                      displayYear =
                        Number(event.start_year_value) + Number(event.duration_value);
                    }
                  }
                  return (
                    <option key={event.id} value={event.id}>
                      {event.name} {displayYear ? `(${displayYear})` : ""}
                    </option>
                  );
                })}
              </select>
            </label>
          )}
        </fieldset>

        {/* Duration Section */}
        <fieldset>
          <legend>Duration (years)</legend>
          <label>
            Duration Type:
            <select name="durationType" value={formData.durationType} onChange={handleChange}>
              <option value="fixed">Fixed</option>
              <option value="uniform">Uniform Distribution</option>
              <option value="normal">Normal Distribution</option>
            </select>
          </label>
          {formData.durationType === "fixed" && (
            <label>
              Duration:
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="durationValue"
                value={formData.durationValue}
                onChange={handleChange}
                required
              />
            </label>
          )}
          {formData.durationType === "uniform" && (
            <>
              <label>
                Min Duration:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="durationMin"
                  value={formData.durationMin}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Max Duration:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="durationMax"
                  value={formData.durationMax}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}
          {formData.durationType === "normal" && (
            <>
              <label>
                Mean Duration:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="durationMean"
                  value={formData.durationMean}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Std Dev:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="durationStd"
                  value={formData.durationStd}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}
        </fieldset>

        {/* Income/Expense Specific Section */}
        {(formData.type === "income" || formData.type === "expense") && (
          <fieldset>
            <legend>{formData.type === "income" ? "Income" : "Expense"} Details</legend>
            <label>
              Initial Amount:
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="initialAmount"
                value={formData.initialAmount}
                onChange={handleChange}
              />
            </label>
            <label>
              Expected Change Type:
              <select name="expectedChangeType" value={formData.expectedChangeType} onChange={handleChange}>
                <option value="fixed">Fixed</option>
                <option value="uniform">Uniform Distribution</option>
                <option value="normal">Normal Distribution</option>
              </select>
            </label>
            {formData.expectedChangeType === "fixed" && (
              <label>
                Expected Change:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="expectedChangeValue"
                  value={formData.expectedChangeValue}
                  onChange={handleChange}
                />
              </label>
            )}
            {formData.expectedChangeType === "uniform" && (
              <>
                <label>
                  Min Change:
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="expectedChangeMin"
                    value={formData.expectedChangeMin}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Max Change:
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="expectedChangeMax"
                    value={formData.expectedChangeMax}
                    onChange={handleChange}
                    required
                  />
                </label>
              </>
            )}
            {formData.expectedChangeType === "normal" && (
              <>
                <label>
                  Mean Change:
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="expectedChangeMean"
                    value={formData.expectedChangeMean}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Std Dev:
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="expectedChangeStd"
                    value={formData.expectedChangeStd}
                    onChange={handleChange}
                    required
                  />
                </label>
              </>
            )}
            <label>
              Inflation Adjusted:
              <input
                type="checkbox"
                name="inflationAdjusted"
                checked={formData.inflationAdjusted}
                onChange={handleChange}
              />
            </label>
            {selectedScenario && selectedScenario.isMarried && (
              <label>
                User Percentage:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="userPercentage"
                  value={formData.userPercentage}
                  onChange={handleChange}
                />
              </label>
            )}
            {formData.type === "income" && (
              <label>
                Is Social Security:
                <input
                  type="checkbox"
                  name="isSocialSecurity"
                  checked={formData.isSocialSecurity}
                  onChange={handleChange}
                />
              </label>
            )}
            {formData.type === "expense" && (
              <label>
                Is Discretionary:
                <input
                  type="checkbox"
                  name="isDiscretionary"
                  checked={formData.isDiscretionary}
                  onChange={handleChange}
                />
              </label>
            )}
          </fieldset>
        )}

        {/* Invest/Rebalance Specific Section */}
        {(formData.type === "invest" || formData.type === "rebalance") && (
          <fieldset>
            <legend>{formData.type === "invest" ? "Invest" : "Rebalance"} Details</legend>
            <p>Choose allocation mode:</p>
            <label>
              <input
                type="radio"
                name="allocationType"
                value="fixed"
                checked={formData.allocationType === "fixed"}
                onChange={handleChange}
              />
              Fixed
            </label>
            <label style={{ marginLeft: "1rem" }}>
              <input
                type="radio"
                name="allocationType"
                value="glide"
                checked={formData.allocationType === "glide"}
                onChange={handleChange}
              />
              Glide Path
            </label>
            {scenarioInvestments.length > 0 ? (
              <>
                {formData.allocationType === "fixed" && (
                  <div>
                    <p>Enter a percentage allocation for each investment:</p>
                    {scenarioInvestments.map((inv) => (
                      <div key={inv.id} style={{ marginBottom: "0.5rem" }}>
                        <label>
                          {get_type_from_id(inv.investment_type_id, selectedScenario).name} (%):
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.allocationFixed[inv.id] || ""}
                            onChange={(e) => handleAllocationFixedChange(inv.id, e.target.value)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {formData.allocationType === "glide" && (
                  <>
                    <div>
                      <h4>Initial Allocation (%)</h4>
                      {scenarioInvestments.map((inv) => (
                        <div key={inv.id} style={{ marginBottom: "0.5rem" }}>
                          <label>
                            {get_type_from_id(inv.investment_type_id, selectedScenario).name}:
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={formData.allocationGlideInitial[inv.id] || ""}
                              onChange={(e) => handleAllocationGlideInitialChange(inv.id, e.target.value)}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <h4>Final Allocation (%)</h4>
                      {scenarioInvestments.map((inv) => (
                        <div key={inv.id} style={{ marginBottom: "0.5rem" }}>
                          <label>
                            {get_type_from_id(inv.investment_type_id, selectedScenario).name}:
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={formData.allocationGlideFinal[inv.id] || ""}
                              onChange={(e) => handleAllocationGlideFinalChange(inv.id, e.target.value)}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p>No investments found in this scenario.</p>
            )}
            {formData.type === "invest" && (
              <label>
                Maximum Cash:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="maxCash"
                  value={formData.maxCash}
                  onChange={handleChange}
                />
              </label>
            )}
          </fieldset>
        )}

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}


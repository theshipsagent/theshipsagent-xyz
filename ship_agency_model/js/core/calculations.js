/**
 * Financial Calculation Engine for Ship Agency Model
 * All revenue, cost, and KPI formulas
 */

class FinancialCalculator {
  /**
   * Calculate all financials for a location
   * @param {Location} location - Location object
   * @param {Object} globalAssumptions - Global benefit assumptions
   * @returns {Object} Location financial results
   */
  static calculateLocation(location, globalAssumptions) {
    if (!location.active) {
      return this.createEmptyLocationResult(location);
    }

    // Revenue calculations
    const revenue = this.calculateRevenue(location);

    // Cost calculations
    const costs = this.calculateCosts(location, globalAssumptions);

    // Total calls
    const totalCalls = location.getTotalCalls();

    // KPIs (passing directCosts for Direct Delta/Call calculation)
    const kpis = this.calculateKPIs(revenue.total, costs.total, costs.directCosts, totalCalls);

    return {
      locationId: location.id,
      locationName: location.name,
      locationType: location.type,
      revenue,
      costs,
      totalCalls,
      ...kpis
    };
  }

  /**
   * Calculate revenue for a location
   */
  static calculateRevenue(location) {
    // Base agency fees
    const baseAgencyFees = location.revenue.shipTypes.reduce((sum, st) => {
      return sum + ((st.calls || 0) * (st.feePerCall || 0));
    }, 0);

    // Husbandry revenue
    const husbandryRevenue = location.revenue.husbandry.enabled
      ? baseAgencyFees * (location.revenue.husbandry.marginPercent / 100)
      : 0;

    // Commission revenue
    const commissionRevenue = location.revenue.commission.enabled
      ? (baseAgencyFees + husbandryRevenue) * (location.revenue.commission.marginPercent / 100)
      : 0;

    // Documentation revenue
    const documentationRevenue = location.revenue.documentation.manualAmount || 0;

    // Total revenue
    const totalRevenue = baseAgencyFees + husbandryRevenue + commissionRevenue + documentationRevenue;

    // Funds flow (pass-through funds, not earnings)
    const fundsFlow = location.revenue.shipTypes.reduce((sum, st) => {
      return sum + ((st.calls || 0) * (st.fundsPerCall || 0));
    }, 0);

    return {
      baseAgencyFees,
      husbandryRevenue,
      commissionRevenue,
      documentationRevenue,
      total: totalRevenue,
      fundsFlow
    };
  }

  /**
   * Calculate costs for a location
   */
  static calculateCosts(location, globalAssumptions) {
    // Helper function to calculate total compensation for a staff member
    const calculateStaffCost = (staff) => {
      let basePay = 0;

      if (staff.isHourly) {
        // Hourly: (hourly rate × annual hours) + (hourly rate × 1.5 × overtime hours)
        const regularPay = (staff.salary || 0) * (staff.annualHours || 2080);
        const overtimePay = (staff.salary || 0) * 1.5 * (staff.overtimeHours || 0);
        basePay = regularPay + overtimePay;
      } else {
        // Salaried
        basePay = staff.salary || 0;
      }

      // Add bonus (default 10%)
      const bonus = basePay * ((staff.bonusPercent || 10) / 100);
      const totalComp = basePay + bonus;

      return totalComp * (staff.count || 0);
    };

    // Payroll
    const corporatePayroll = location.corporateStaff.reduce((sum, staff) => {
      return sum + calculateStaffCost(staff);
    }, 0);

    const portPayroll = location.portStaff.reduce((sum, staff) => {
      return sum + calculateStaffCost(staff);
    }, 0);

    const totalPayroll = corporatePayroll + portPayroll;

    // Employee count
    const corporateEmployeeCount = location.corporateStaff.reduce((sum, s) => sum + (s.count || 0), 0);
    const portEmployeeCount = location.portStaff.reduce((sum, s) => sum + (s.count || 0), 0);
    const employeeCount = corporateEmployeeCount + portEmployeeCount;

    // Benefits
    const retirement401k = totalPayroll * (globalAssumptions.retirement401kPercent / 100);
    const healthInsurance = employeeCount * globalAssumptions.healthInsurancePerEmployee;
    const totalBenefits = retirement401k + healthInsurance;

    // Overhead
    const officeSpaceCost = (location.overhead.officeSpace.sqft || 0) *
                            (location.overhead.officeSpace.costPerSqft || 0);

    // Helper function to sum all values in an overhead category
    const sumCategory = (category) => {
      if (!category) return 0;
      return Object.values(category).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    };

    const insuranceCost = sumCategory(location.overhead.insurance);
    const technologyCost = sumCategory(location.overhead.technology);
    const regulatoryCost = sumCategory(location.overhead.regulatory);
    const professionalServicesCost = sumCategory(location.overhead.professionalServices);
    const officeOperationsCost = sumCategory(location.overhead.officeOperations);
    const communicationsCost = sumCategory(location.overhead.communications);
    const employeeRelatedCost = sumCategory(location.overhead.employeeRelated);
    const vehicleTransportCost = sumCategory(location.overhead.vehicleTransport);
    const otherCost = sumCategory(location.overhead.other);

    const totalOverhead = officeSpaceCost + insuranceCost + technologyCost + regulatoryCost +
                          professionalServicesCost + officeOperationsCost + communicationsCost +
                          employeeRelatedCost + vehicleTransportCost + otherCost;

    // Variable costs per call
    const totalCalls = location.revenue.shipTypes.reduce((sum, st) => sum + (st.calls || 0), 0);
    const variableCostPerCall = location.overhead.variableCosts?.costPerCall || 0;
    const totalVariableCosts = totalCalls * variableCostPerCall;

    // Separate direct costs (port-level) from corporate overhead
    const portBenefits = (portPayroll * (globalAssumptions.retirement401kPercent / 100)) +
                         (portEmployeeCount * globalAssumptions.healthInsurancePerEmployee);
    const corporateBenefits = (corporatePayroll * (globalAssumptions.retirement401kPercent / 100)) +
                              (corporateEmployeeCount * globalAssumptions.healthInsurancePerEmployee);

    const directCosts = portPayroll + portBenefits + totalVariableCosts;
    const corporateOverhead = corporatePayroll + corporateBenefits + totalOverhead;

    // Total costs
    const totalCosts = totalPayroll + totalBenefits + totalOverhead + totalVariableCosts;

    return {
      corporatePayroll,
      portPayroll,
      totalPayroll,
      employeeCount,
      corporateEmployeeCount,
      portEmployeeCount,
      retirement401k,
      healthInsurance,
      totalBenefits,
      corporateBenefits,
      portBenefits,
      officeSpaceCost,
      insuranceCost,
      technologyCost,
      regulatoryCost,
      professionalServicesCost,
      officeOperationsCost,
      communicationsCost,
      employeeRelatedCost,
      vehicleTransportCost,
      otherCost,
      totalOverhead,
      variableCostPerCall,
      totalVariableCosts,
      directCosts,
      corporateOverhead,
      total: totalCosts
    };
  }

  /**
   * Calculate KPIs
   * @param {number} totalRevenue - Total revenue
   * @param {number} totalCosts - Total costs (all expenses)
   * @param {number} directCosts - Direct port-level costs only
   * @param {number} totalCalls - Total port calls
   */
  static calculateKPIs(totalRevenue, totalCosts, directCosts, totalCalls) {
    const revenuePerCall = totalCalls > 0 ? totalRevenue / totalCalls : 0;

    // Total Delta/Call (all expenses including corporate overhead) - cross-reference metric
    const totalCostPerCall = totalCalls > 0 ? totalCosts / totalCalls : 0;
    const totalDeltaPerCall = revenuePerCall - totalCostPerCall;

    // Direct Delta/Call (KEY KPI - port direct costs only vs gross revenue)
    const directCostPerCall = totalCalls > 0 ? directCosts / totalCalls : 0;
    const directDeltaPerCall = revenuePerCall - directCostPerCall;

    const ebitda = totalRevenue - totalCosts;
    const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
    const breakEvenCalls = revenuePerCall > 0 ? totalCosts / revenuePerCall : 0;

    return {
      revenuePerCall,
      totalCostPerCall,        // Renamed from costPerCall
      totalDeltaPerCall,       // Renamed from deltaPerCall - cross-reference
      directCostPerCall,       // NEW
      directDeltaPerCall,      // NEW - KEY KPI
      ebitda,
      ebitdaMargin,
      breakEvenCalls
    };
  }

  /**
   * Calculate consolidated financials for entire scenario
   * @param {Scenario} scenario - Scenario object
   * @returns {Object} Consolidated financial results
   */
  static calculateScenario(scenario) {
    const activeLocations = scenario.getActiveLocations();
    const locationResults = activeLocations.map(loc =>
      this.calculateLocation(loc, scenario.globalAssumptions)
    );

    // Aggregate all locations
    const totalRevenue = locationResults.reduce((sum, lr) => sum + lr.revenue.total, 0);
    const totalCosts = locationResults.reduce((sum, lr) => sum + lr.costs.total, 0);
    const totalDirectCosts = locationResults.reduce((sum, lr) => sum + lr.costs.directCosts, 0);
    const totalCalls = locationResults.reduce((sum, lr) => sum + lr.totalCalls, 0);
    const totalEmployees = locationResults.reduce((sum, lr) => sum + lr.costs.employeeCount, 0);
    const totalFundsFlow = locationResults.reduce((sum, lr) => sum + lr.revenue.fundsFlow, 0);

    // Revenue breakdown aggregation
    const husbandryRevenue = locationResults.reduce((sum, lr) => sum + (lr.revenue.husbandry || 0), 0);
    const commissionRevenue = locationResults.reduce((sum, lr) => sum + (lr.revenue.commission || 0), 0);
    const documentationRevenue = locationResults.reduce((sum, lr) => sum + (lr.revenue.documentation || 0), 0);

    // Cost breakdown aggregation
    const corporatePayroll = locationResults.reduce((sum, lr) => sum + (lr.costs.corporatePayroll || 0), 0);
    const portPayroll = locationResults.reduce((sum, lr) => sum + (lr.costs.portPayroll || 0), 0);
    const totalBenefits = locationResults.reduce((sum, lr) => sum + (lr.costs.totalBenefits || 0), 0);
    const totalOverhead = locationResults.reduce((sum, lr) => sum + (lr.costs.totalOverhead || 0), 0);
    const totalVariableCosts = locationResults.reduce((sum, lr) => sum + (lr.costs.totalVariableCosts || 0), 0);

    // Corporate Indirect Overhead (Scenario-level, NOT allocated to locations)
    const corporateIndirectOverhead = scenario.corporateIndirectOverhead;
    const totalCorporateIndirect =
      (corporateIndirectOverhead.executiveCompensation || 0) +
      (corporateIndirectOverhead.corporateLegal || 0) +
      (corporateIndirectOverhead.corporateAccounting || 0) +
      (corporateIndirectOverhead.corporateInsurance || 0) +
      (corporateIndirectOverhead.corporateTechnology || 0) +
      (corporateIndirectOverhead.customTEItems || []).reduce((sum, item) => sum + (item.amount || 0), 0);

    // Add corporate indirect overhead to total costs
    const totalCostsWithIndirect = totalCosts + totalCorporateIndirect;

    // Consolidated KPIs (passing total direct costs, using totalCostsWithIndirect)
    const kpis = this.calculateKPIs(totalRevenue, totalCostsWithIndirect, totalDirectCosts, totalCalls);

    return {
      locationResults,
      consolidated: {
        totalRevenue,
        husbandryRevenue,
        commissionRevenue,
        documentationRevenue,
        totalCosts: totalCostsWithIndirect,  // Total costs including corporate indirect
        locationCosts: totalCosts,  // Just location-level costs
        corporateIndirectTotal: totalCorporateIndirect,  // Corporate indirect overhead total
        corporateIndirectBreakdown: {  // Detailed breakdown
          executiveCompensation: corporateIndirectOverhead.executiveCompensation || 0,
          corporateLegal: corporateIndirectOverhead.corporateLegal || 0,
          corporateAccounting: corporateIndirectOverhead.corporateAccounting || 0,
          corporateInsurance: corporateIndirectOverhead.corporateInsurance || 0,
          corporateTechnology: corporateIndirectOverhead.corporateTechnology || 0,
          customTETotal: (corporateIndirectOverhead.customTEItems || []).reduce((sum, item) => sum + (item.amount || 0), 0),
          customTEItems: corporateIndirectOverhead.customTEItems || []
        },
        corporatePayroll,
        portPayroll,
        totalBenefits,
        totalOverhead,
        totalVariableCosts,
        totalDirectCosts,
        totalCalls,
        totalEmployees,
        totalFundsFlow,
        ...kpis
      }
    };
  }

  /**
   * Apply AI reductions to a scenario
   * Creates a new scenario with AI-adjusted staffing
   * @param {Scenario} traditionalScenario - Base traditional scenario
   * @returns {Scenario} New AI-enabled scenario
   */
  static applyAIReductions(traditionalScenario) {
    const aiScenario = traditionalScenario.clone(traditionalScenario.name + ' - AI Enabled');
    aiScenario.modelType = 'ai-enabled';

    const reductionFactors = aiScenario.globalAssumptions.aiReductionFactors;

    aiScenario.locations.forEach(location => {
      // Reduce documentation staff
      location.corporateStaff.forEach(staff => {
        if (staff.position.toLowerCase().includes('document')) {
          staff.count = Math.ceil(staff.count * (1 - reductionFactors.documentationStaff));
        }
      });

      // Reduce accounting clerks
      location.corporateStaff.forEach(staff => {
        if (staff.position.toLowerCase().includes('accounting clerk')) {
          staff.count = Math.ceil(staff.count * (1 - reductionFactors.accountingClerks));
        }
      });

      // Reduce ops admin clerks
      location.portStaff.forEach(staff => {
        if (staff.position.toLowerCase().includes('ops admin clerk')) {
          staff.count = Math.ceil(staff.count * (1 - reductionFactors.opsAdminClerks));
        }
      });

      // Increase technology overhead for AI systems (only for HQ)
      if (location.type === 'hq') {
        location.overhead.technology.specializedSaaS += reductionFactors.technologyIncrease;
      }
    });

    return aiScenario;
  }

  /**
   * Compare two scenarios and calculate deltas
   * @param {Scenario} scenario1 - First scenario (typically Traditional)
   * @param {Scenario} scenario2 - Second scenario (typically AI-Enabled)
   * @returns {Object} Comparison results with deltas
   */
  static compareScenarios(scenario1, scenario2) {
    const results1 = this.calculateScenario(scenario1);
    const results2 = this.calculateScenario(scenario2);

    const consolidated1 = results1.consolidated;
    const consolidated2 = results2.consolidated;

    // Calculate deltas (scenario2 - scenario1)
    const deltas = {
      totalRevenue: consolidated2.totalRevenue - consolidated1.totalRevenue,
      totalCosts: consolidated2.totalCosts - consolidated1.totalCosts,
      totalCalls: consolidated2.totalCalls - consolidated1.totalCalls,
      totalEmployees: consolidated2.totalEmployees - consolidated1.totalEmployees,
      revenuePerCall: consolidated2.revenuePerCall - consolidated1.revenuePerCall,
      totalCostPerCall: consolidated2.totalCostPerCall - consolidated1.totalCostPerCall,
      totalDeltaPerCall: consolidated2.totalDeltaPerCall - consolidated1.totalDeltaPerCall,
      directCostPerCall: consolidated2.directCostPerCall - consolidated1.directCostPerCall,
      directDeltaPerCall: consolidated2.directDeltaPerCall - consolidated1.directDeltaPerCall,
      ebitda: consolidated2.ebitda - consolidated1.ebitda,
      ebitdaMargin: consolidated2.ebitdaMargin - consolidated1.ebitdaMargin
    };

    // Calculate percentage changes
    const percentChanges = {
      totalRevenue: this.calculatePercentChange(consolidated1.totalRevenue, consolidated2.totalRevenue),
      totalCosts: this.calculatePercentChange(consolidated1.totalCosts, consolidated2.totalCosts),
      totalEmployees: this.calculatePercentChange(consolidated1.totalEmployees, consolidated2.totalEmployees),
      revenuePerCall: this.calculatePercentChange(consolidated1.revenuePerCall, consolidated2.revenuePerCall),
      totalCostPerCall: this.calculatePercentChange(consolidated1.totalCostPerCall, consolidated2.totalCostPerCall),
      totalDeltaPerCall: this.calculatePercentChange(consolidated1.totalDeltaPerCall, consolidated2.totalDeltaPerCall),
      directCostPerCall: this.calculatePercentChange(consolidated1.directCostPerCall, consolidated2.directCostPerCall),
      directDeltaPerCall: this.calculatePercentChange(consolidated1.directDeltaPerCall, consolidated2.directDeltaPerCall),
      ebitda: this.calculatePercentChange(consolidated1.ebitda, consolidated2.ebitda)
    };

    return {
      scenario1: {
        name: scenario1.name,
        modelType: scenario1.modelType,
        results: results1
      },
      scenario2: {
        name: scenario2.name,
        modelType: scenario2.modelType,
        results: results2
      },
      deltas,
      percentChanges
    };
  }

  /**
   * Calculate percent change
   */
  static calculatePercentChange(oldValue, newValue) {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  }

  /**
   * Calculate cycle time sensitivity - Float Income Analysis
   * Shows impact of different cash cycle times on float income
   * @param {number} totalFundsFlow - Annual cash flow (total disbursements)
   * @param {number} interestRate - Annual interest rate (default 2%)
   * @returns {Object} Cycle time scenarios with float amounts and income
   */
  static calculateCycleTimeSensitivity(totalFundsFlow, interestRate = 0.02) {
    const scenarios = {
      instant_1_day: 1,
      aggressive_30_days: 30,
      optimized_45_days: 45,
      current_71_days: 71,
      slow_90_days: 90,
      very_slow_120_days: 120
    };

    const results = {};

    for (const [name, days] of Object.entries(scenarios)) {
      // Time-weighted float calculation: Annual Flow × (Days Held / 365)
      const avgFloat = totalFundsFlow * (days / 365);
      const annualIncome = avgFloat * interestRate;
      const monthlyIncome = annualIncome / 12;

      results[name] = {
        cycleDays: days,
        averageFloat: avgFloat,
        annualIncome: annualIncome,
        monthlyIncome: monthlyIncome,
        interestRate: interestRate
      };
    }

    // Calculate losses relative to baseline (71 days)
    const baseline = results.current_71_days;

    for (const [name, data] of Object.entries(results)) {
      data.incomeVsBaseline = data.annualIncome - baseline.annualIncome;
      data.percentVsBaseline = baseline.annualIncome > 0
        ? ((data.annualIncome - baseline.annualIncome) / baseline.annualIncome) * 100
        : 0;
    }

    return {
      scenarios: results,
      baseline: baseline,
      interestRate: interestRate,
      totalFundsFlow: totalFundsFlow
    };
  }

  /**
   * Calculate float income for a scenario based on cycle time
   * @param {Scenario} scenario - Scenario object
   * @param {number} cycleDays - Average cycle time in days
   * @param {number} interestRate - Annual interest rate (default 2%)
   * @returns {Object} Float income calculations
   */
  static calculateFloatIncome(scenario, cycleDays = 71, interestRate = 0.02) {
    const results = this.calculateScenario(scenario);
    const totalFundsFlow = results.consolidated.totalFundsFlow;

    // Time-weighted average float
    const averageFloat = totalFundsFlow * (cycleDays / 365);

    // Annual interest income
    const annualIncome = averageFloat * interestRate;
    const monthlyIncome = annualIncome / 12;

    // Per call metrics
    const totalCalls = results.consolidated.totalCalls;
    const incomePerCall = totalCalls > 0 ? annualIncome / totalCalls : 0;

    return {
      totalFundsFlow,
      cycleDays,
      averageFloat,
      interestRate,
      annualIncome,
      monthlyIncome,
      incomePerCall,
      totalCalls,
      // Include full scenario results for reference
      scenarioResults: results
    };
  }

  /**
   * Create empty location result for inactive locations
   */
  static createEmptyLocationResult(location) {
    return {
      locationId: location.id,
      locationName: location.name,
      locationType: location.type,
      revenue: {
        baseAgencyFees: 0,
        husbandryRevenue: 0,
        commissionRevenue: 0,
        documentationRevenue: 0,
        total: 0,
        fundsFlow: 0
      },
      costs: {
        corporatePayroll: 0,
        portPayroll: 0,
        totalPayroll: 0,
        employeeCount: 0,
        corporateEmployeeCount: 0,
        portEmployeeCount: 0,
        retirement401k: 0,
        healthInsurance: 0,
        totalBenefits: 0,
        corporateBenefits: 0,
        portBenefits: 0,
        officeSpaceCost: 0,
        insuranceCost: 0,
        technologyCost: 0,
        regulatoryCost: 0,
        professionalServicesCost: 0,
        officeOperationsCost: 0,
        communicationsCost: 0,
        employeeRelatedCost: 0,
        vehicleTransportCost: 0,
        otherCost: 0,
        totalOverhead: 0,
        variableCostPerCall: 0,
        totalVariableCosts: 0,
        directCosts: 0,
        corporateOverhead: 0,
        total: 0
      },
      totalCalls: 0,
      revenuePerCall: 0,
      totalCostPerCall: 0,
      totalDeltaPerCall: 0,
      directCostPerCall: 0,
      directDeltaPerCall: 0,
      ebitda: 0,
      ebitdaMargin: 0,
      breakEvenCalls: 0
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FinancialCalculator };
}

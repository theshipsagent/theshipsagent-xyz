/**
 * Data Model Classes for Ship Agency Financial Model
 * Location and Scenario objects
 */

/**
 * Location class - represents a single office location (HQ or satellite)
 */
class Location {
  constructor(config = {}) {
    this.id = config.id || this.generateId();
    this.name = config.name || 'New Location';
    this.type = config.type || 'port-office'; // 'hq', 'port-office', or 'virtual-satellite-office'
    this.state = config.state || '';
    this.active = config.active !== undefined ? config.active : true;

    // Staffing - normalize staff objects to include new fields
    this.corporateStaff = (config.corporateStaff || []).map(staff => this.normalizeStaff(staff));
    this.portStaff = (config.portStaff || []).map(staff => this.normalizeStaff(staff));

    // Revenue
    this.revenue = {
      shipTypes: config.revenue?.shipTypes ? JSON.parse(JSON.stringify(config.revenue.shipTypes)) : [],
      husbandry: {
        enabled: config.revenue?.husbandry?.enabled !== undefined ? config.revenue.husbandry.enabled : true,
        marginPercent: config.revenue?.husbandry?.marginPercent || 9
      },
      commission: {
        enabled: config.revenue?.commission?.enabled !== undefined ? config.revenue.commission.enabled : true,
        marginPercent: config.revenue?.commission?.marginPercent || 1.5
      },
      documentation: {
        manualAmount: config.revenue?.documentation?.manualAmount || 0
      }
    };

    // Overhead
    this.overhead = {
      officeSpace: {
        sqft: config.overhead?.officeSpace?.sqft || 2500,
        rentClass: config.overhead?.officeSpace?.rentClass || 'class-b', // 'class-a' or 'class-b'
        costPerSqft: config.overhead?.officeSpace?.costPerSqft || 20
      },
      insurance: {
        longshoremen: config.overhead?.insurance?.longshoremen || 25000,
        errorsOmissions: config.overhead?.insurance?.errorsOmissions || 50000,
        generalLiability: config.overhead?.insurance?.generalLiability || 15000
      },
      technology: {
        office365: config.overhead?.technology?.office365 || 3600,
        erpNetSuite: config.overhead?.technology?.erpNetSuite || 0, // Only for HQ
        crmDynamics: config.overhead?.technology?.crmDynamics || 12000,
        specializedSaaS: config.overhead?.technology?.specializedSaaS || 30000
      },
      regulatory: {
        customsBond: config.overhead?.regulatory?.customsBond || 15000,
        fmcLicensing: config.overhead?.regulatory?.fmcLicensing || 5000
      },
      professionalServices: {
        legal: config.overhead?.professionalServices?.legal || 15000,
        accounting: config.overhead?.professionalServices?.accounting || 25000,
        consulting: config.overhead?.professionalServices?.consulting || 10000
      },
      officeOperations: {
        utilities: config.overhead?.officeOperations?.utilities || 12000,
        officeSupplies: config.overhead?.officeOperations?.officeSupplies || 8000,
        maintenanceRepairs: config.overhead?.officeOperations?.maintenanceRepairs || 6000,
        janitorial: config.overhead?.officeOperations?.janitorial || 8000
      },
      communications: {
        phoneSystems: config.overhead?.communications?.phoneSystems || 6000,
        mobileDevices: config.overhead?.communications?.mobileDevices || 4000
      },
      employeeRelated: {
        trainingDevelopment: config.overhead?.employeeRelated?.trainingDevelopment || 10000,
        recruiting: config.overhead?.employeeRelated?.recruiting || 8000,
        travelEntertainment: config.overhead?.employeeRelated?.travelEntertainment || 12000
      },
      vehicleTransport: {
        vehicleMaintenance: config.overhead?.vehicleTransport?.vehicleMaintenance || 12000,
        parking: config.overhead?.vehicleTransport?.parking || 3000
      },
      other: {
        miscellaneous: config.overhead?.other?.miscellaneous || 0
      },
      variableCosts: {
        milesPerCall: config.overhead?.variableCosts?.milesPerCall || 25,
        vehicleType: config.overhead?.variableCosts?.vehicleType || 'company-sedan', // 'company-sedan', 'company-suv', 'mileage-reimbursement'
        costPerCall: config.overhead?.variableCosts?.costPerCall || 0 // Calculated based on vehicleType and milesPerCall
      }
    };

    // Calculate initial variable cost per call if not provided
    if (!config.overhead?.variableCosts?.costPerCall) {
      this.updateVariableCostPerCall();
    }
  }

  /**
   * Update variable cost per call based on vehicle type and miles
   */
  updateVariableCostPerCall() {
    const milesPerCall = this.overhead.variableCosts.milesPerCall || 0;
    const vehicleType = this.overhead.variableCosts.vehicleType;

    // Cost per mile based on vehicle type
    // Company car: Total cost of ownership (lease + insurance + maintenance + fuel) / annual miles
    // Mileage reimbursement: IRS standard mileage rate 2024 = $0.67/mile
    let costPerMile = 0;

    switch (vehicleType) {
      case 'company-sedan':
        // Sedan: ~$0.55/mile (lower total cost of ownership)
        costPerMile = 0.55;
        break;
      case 'company-suv':
        // SUV: ~$0.75/mile (higher total cost of ownership)
        costPerMile = 0.75;
        break;
      case 'mileage-reimbursement':
        // IRS standard mileage rate
        costPerMile = 0.67;
        break;
      default:
        costPerMile = 0.67;
    }

    this.overhead.variableCosts.costPerCall = milesPerCall * costPerMile;
  }

  /**
   * Calculate recommended office sqft based on team size
   * Industry standards:
   * - Executive (C-level, VP): 150 sqft per person
   * - Manager: 100 sqft per person
   * - Staff: 75 sqft per person
   * - Common areas (conference rooms, break rooms, reception): +40% of workspace
   */
  calculateRecommendedSqft() {
    let workspaceSqft = 0;

    // Categorize corporate staff
    this.corporateStaff.forEach(staff => {
      const position = staff.position.toLowerCase();
      const count = staff.count || 0;

      if (position.includes('ceo') || position.includes('president') ||
          position.includes('cfo') || position.includes('vp')) {
        // Executive: 150 sqft per person
        workspaceSqft += count * 150;
      } else if (position.includes('manager') || position.includes('controller') ||
                 position.includes('supervisor')) {
        // Manager: 100 sqft per person
        workspaceSqft += count * 100;
      } else {
        // Staff: 75 sqft per person
        workspaceSqft += count * 75;
      }
    });

    // Categorize port staff
    this.portStaff.forEach(staff => {
      const position = staff.position.toLowerCase();
      const count = staff.count || 0;

      if (position.includes('manager')) {
        // Manager: 100 sqft per person
        workspaceSqft += count * 100;
      } else {
        // Staff: 75 sqft per person
        workspaceSqft += count * 75;
      }
    });

    // Add 40% for common areas (conference rooms, break rooms, reception, hallways)
    const totalSqft = Math.ceil(workspaceSqft * 1.4);

    return {
      workspaceSqft: Math.ceil(workspaceSqft),
      commonAreaSqft: Math.ceil(workspaceSqft * 0.4),
      totalSqft: totalSqft,
      employeeCount: this.corporateStaff.reduce((sum, s) => sum + (s.count || 0), 0) +
                     this.portStaff.reduce((sum, s) => sum + (s.count || 0), 0)
    };
  }

  /**
   * Auto-scale office sqft based on team size
   */
  autoScaleOfficeSqft() {
    const recommended = this.calculateRecommendedSqft();
    this.overhead.officeSpace.sqft = recommended.totalSqft;
  }

  /**
   * Get typical rent per sqft based on rent class and location
   * Ranges based on typical US port city commercial real estate
   */
  getTypicalRentPerSqft(rentClass = null) {
    const classToUse = rentClass || this.overhead.officeSpace.rentClass;

    // Typical ranges for major port cities
    const rentRanges = {
      'class-a': {
        min: 30,
        typical: 40,
        max: 50,
        description: 'Class A - Premium downtown, new construction, high-end finishes'
      },
      'class-b': {
        min: 15,
        typical: 20,
        max: 25,
        description: 'Class B - Mid-range, suburban/secondary, standard finishes'
      }
    };

    return rentRanges[classToUse] || rentRanges['class-b'];
  }

  /**
   * Update rent per sqft based on rent class selection
   */
  updateRentPerSqft() {
    const rentInfo = this.getTypicalRentPerSqft();
    this.overhead.officeSpace.costPerSqft = rentInfo.typical;
  }

  generateId() {
    return 'loc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Normalize staff object to ensure all required fields are present
   */
  normalizeStaff(staff) {
    // Determine if position is hourly by default
    const hourlyPositions = ['boarding agent', 'runner', 'ops admin clerk', 'accounting clerk', 'document clerk', 'hr clerk'];
    const defaultHourly = hourlyPositions.some(hp => (staff.position || '').toLowerCase().includes(hp));

    return {
      position: staff.position || 'Unknown Position',
      salary: staff.salary || 0,
      count: staff.count || 1,
      isHourly: staff.isHourly !== undefined ? staff.isHourly : defaultHourly,
      annualHours: staff.annualHours || 2080,
      overtimeHours: staff.overtimeHours || 0,
      bonusPercent: staff.bonusPercent !== undefined ? staff.bonusPercent : 10
    };
  }

  addStaff(staffType, position, salary, count = 1, isHourly = false, annualHours = 2080, overtimeHours = 0) {
    const staff = this.normalizeStaff({
      position,
      salary,
      count,
      isHourly,
      annualHours,
      overtimeHours
    });

    if (staffType === 'corporate') {
      this.corporateStaff.push(staff);
    } else if (staffType === 'port') {
      this.portStaff.push(staff);
    }
  }

  removeStaff(staffType, index) {
    if (staffType === 'corporate') {
      this.corporateStaff.splice(index, 1);
    } else if (staffType === 'port') {
      this.portStaff.splice(index, 1);
    }
  }

  /**
   * Get total employee count (corporate + port staff)
   */
  getTotalEmployeeCount() {
    const corporateCount = this.corporateStaff.reduce((sum, staff) => sum + staff.count, 0);
    const portCount = this.portStaff.reduce((sum, staff) => sum + staff.count, 0);
    return corporateCount + portCount;
  }

  /**
   * Add overhead category
   */
  addOverheadCategory(categoryKey, categoryName) {
    // Protected categories that cannot be added manually
    const protectedCategories = ['officeSpace', 'variableCosts'];

    if (protectedCategories.includes(categoryKey)) {
      console.error(`Cannot add protected category: ${categoryKey}`);
      return false;
    }

    if (this.overhead[categoryKey]) {
      console.error(`Category ${categoryKey} already exists`);
      return false;
    }

    this.overhead[categoryKey] = {};
    return true;
  }

  /**
   * Remove overhead category
   */
  removeOverheadCategory(categoryKey) {
    // Protected categories that cannot be removed
    const protectedCategories = ['officeSpace', 'variableCosts'];

    if (protectedCategories.includes(categoryKey)) {
      console.error(`Cannot remove protected category: ${categoryKey}`);
      return false;
    }

    if (!this.overhead[categoryKey]) {
      console.error(`Category ${categoryKey} does not exist`);
      return false;
    }

    delete this.overhead[categoryKey];
    return true;
  }

  /**
   * Add overhead line item to a category
   */
  addOverheadItem(category, itemName, amount = 0) {
    if (!this.overhead[category]) {
      console.error(`Category ${category} does not exist`);
      return;
    }
    this.overhead[category][itemName] = amount;
  }

  /**
   * Remove overhead line item from a category
   */
  removeOverheadItem(category, itemName) {
    if (!this.overhead[category]) {
      console.error(`Category ${category} does not exist`);
      return;
    }
    delete this.overhead[category][itemName];
  }

  /**
   * Update overhead line item amount
   */
  updateOverheadItem(category, itemName, amount) {
    if (!this.overhead[category]) {
      console.error(`Category ${category} does not exist`);
      return;
    }
    this.overhead[category][itemName] = amount;
  }

  addShipType(type, calls, feePerCall, fundsPerCall = 0) {
    this.revenue.shipTypes.push({ type, calls, feePerCall, fundsPerCall });
  }

  removeShipType(index) {
    this.revenue.shipTypes.splice(index, 1);
  }

  getTotalCalls() {
    return this.revenue.shipTypes.reduce((sum, st) => sum + (st.calls || 0), 0);
  }

  /**
   * Calculate workload metrics for port staff
   * @returns {Object} Workload analysis including calls per agent, capacity utilization
   */
  calculateWorkload() {
    const totalCalls = this.getTotalCalls();
    const monthlyCallsPerYear = totalCalls; // Annual calls
    const monthlyCallsAvg = totalCalls / 12;

    // Count agents and calculate their effective capacity
    let totalAgentCapacity = 0;
    let agentCount = 0;
    let boardingAgentCount = 0;
    let opsManagerCount = 0;

    this.portStaff.forEach(staff => {
      const position = staff.position.toLowerCase();
      const count = staff.count || 0;

      if (position.includes('ship agent')) {
        // Full-time ship agents: 100% capacity
        agentCount += count;
        totalAgentCapacity += count * 1.0;
      } else if (position.includes('port ops manager') || position.includes('asst ops manager')) {
        // Ops managers: 35-65% capacity (reduced by management duties)
        opsManagerCount += count;
        // Use 50% as default capacity contribution
        totalAgentCapacity += count * 0.50;
      } else if (position.includes('boarding agent') || position.includes('runner')) {
        // Boarding agents/runners
        boardingAgentCount += count;
      }
    });

    // Calculate calls per agent per month
    const callsPerAgentMonth = totalAgentCapacity > 0 ? monthlyCallsAvg / totalAgentCapacity : 0;

    // Industry benchmark: 20-30 calls/agent/month is sustainable
    // 30-40 is high workload, 40+ is overworked
    let workloadStatus = 'Unknown';
    if (callsPerAgentMonth === 0) {
      workloadStatus = 'No workload';
    } else if (callsPerAgentMonth < 20) {
      workloadStatus = 'Underutilized';
    } else if (callsPerAgentMonth <= 30) {
      workloadStatus = 'Optimal';
    } else if (callsPerAgentMonth <= 40) {
      workloadStatus = 'High';
    } else {
      workloadStatus = 'Overworked';
    }

    return {
      totalCalls,
      monthlyCallsAvg: Math.round(monthlyCallsAvg),
      agentCount,
      opsManagerCount,
      boardingAgentCount,
      totalAgentCapacity: Math.round(totalAgentCapacity * 100) / 100,
      callsPerAgentMonth: Math.round(callsPerAgentMonth * 10) / 10,
      workloadStatus,
      benchmarkRange: '20-30 calls/agent/month'
    };
  }

  /**
   * Get benchmark overhead defaults based on company size
   * @param {number} totalEmployees - Total employee count
   * @returns {Object} Recommended overhead amounts by category
   */
  static getBenchmarkOverhead(totalEmployees) {
    // Small (1-10 employees)
    if (totalEmployees <= 10) {
      return {
        size: 'Small (1-10 employees)',
        professionalServices: {
          legal: 10000,
          accounting: 15000,
          consulting: 5000
        },
        officeOperations: {
          utilities: 6000,
          officeSupplies: 3000,
          maintenanceRepairs: 3000,
          janitorial: 4000
        },
        communications: {
          phoneSystems: 3000,
          mobileDevices: 2000
        },
        employeeRelated: {
          trainingDevelopment: 5000,
          recruiting: 3000,
          travelEntertainment: 6000
        },
        vehicleTransport: {
          vehicleMaintenance: 6000,
          parking: 1500
        },
        insurance: {
          longshoremen: 15000,
          errorsOmissions: 25000,
          generalLiability: 8000,
          healthInsurancePerEmployee: 15000
        },
        technology: {
          office365: 1200,
          erpNetSuite: 0, // Too expensive for small
          crmDynamics: 0,
          specializedSaaS: 10000
        }
      };
    }
    // Medium (11-50 employees)
    else if (totalEmployees <= 50) {
      return {
        size: 'Medium (11-50 employees)',
        professionalServices: {
          legal: 15000,
          accounting: 25000,
          consulting: 10000
        },
        officeOperations: {
          utilities: 12000,
          officeSupplies: 8000,
          maintenanceRepairs: 6000,
          janitorial: 8000
        },
        communications: {
          phoneSystems: 6000,
          mobileDevices: 4000
        },
        employeeRelated: {
          trainingDevelopment: 10000,
          recruiting: 8000,
          travelEntertainment: 12000
        },
        vehicleTransport: {
          vehicleMaintenance: 12000,
          parking: 3000
        },
        insurance: {
          longshoremen: 25000,
          errorsOmissions: 50000,
          generalLiability: 15000,
          healthInsurancePerEmployee: 15000
        },
        technology: {
          office365: 3600,
          erpNetSuite: 50000,
          crmDynamics: 12000,
          specializedSaaS: 30000
        }
      };
    }
    // Large (51-125 employees)
    else {
      return {
        size: 'Large (51-125 employees)',
        professionalServices: {
          legal: 25000,
          accounting: 40000,
          consulting: 20000
        },
        officeOperations: {
          utilities: 24000,
          officeSupplies: 15000,
          maintenanceRepairs: 12000,
          janitorial: 16000
        },
        communications: {
          phoneSystems: 12000,
          mobileDevices: 8000
        },
        employeeRelated: {
          trainingDevelopment: 20000,
          recruiting: 15000,
          travelEntertainment: 24000
        },
        vehicleTransport: {
          vehicleMaintenance: 24000,
          parking: 6000
        },
        insurance: {
          longshoremen: 40000,
          errorsOmissions: 75000,
          generalLiability: 25000,
          healthInsurancePerEmployee: 14000  // Lower per-employee due to group rates
        },
        technology: {
          office365: 7200,
          erpNetSuite: 100000,
          crmDynamics: 24000,
          specializedSaaS: 60000
        }
      };
    }
  }

  /**
   * Apply benchmark overhead defaults to this location
   */
  applyBenchmarkOverhead() {
    const totalEmployees = this.corporateStaff.reduce((sum, s) => sum + (s.count || 0), 0) +
                          this.portStaff.reduce((sum, s) => sum + (s.count || 0), 0);

    const benchmark = Location.getBenchmarkOverhead(totalEmployees);

    // Apply professional services
    this.overhead.professionalServices = { ...benchmark.professionalServices };

    // Apply office operations
    this.overhead.officeOperations = { ...benchmark.officeOperations };

    // Apply communications
    this.overhead.communications = { ...benchmark.communications };

    // Apply employee related
    this.overhead.employeeRelated = { ...benchmark.employeeRelated };

    // Apply vehicle transport
    this.overhead.vehicleTransport = { ...benchmark.vehicleTransport };

    // Apply insurance
    this.overhead.insurance.longshoremen = benchmark.insurance.longshoremen;
    this.overhead.insurance.errorsOmissions = benchmark.insurance.errorsOmissions;
    this.overhead.insurance.generalLiability = benchmark.insurance.generalLiability;

    // Apply technology
    this.overhead.technology.office365 = benchmark.technology.office365;
    this.overhead.technology.erpNetSuite = benchmark.technology.erpNetSuite;
    this.overhead.technology.crmDynamics = benchmark.technology.crmDynamics;
    this.overhead.technology.specializedSaaS = benchmark.technology.specializedSaaS;
  }

  /**
   * Build organizational chart data structure
   * Returns hierarchical data for visualization
   */
  buildOrgChart() {
    // Categorize staff by function and level
    const categorizeStaff = (position) => {
      const posLower = position.toLowerCase();

      // Functional categories with hierarchy levels
      if (posLower.includes('ceo') || posLower.includes('president')) return { level: 0, function: 'Executive' };
      if (posLower.includes('cfo')) return { level: 1, function: 'Finance' };
      if (posLower.includes('vp ops') || posLower.includes('vp operations')) return { level: 1, function: 'Operations' };
      if (posLower.includes('vp commercial') || posLower.includes('vp sales')) return { level: 1, function: 'Commercial' };
      if (posLower.includes('controller')) return { level: 2, function: 'Finance' };
      if (posLower.includes('regional manager')) return { level: 2, function: 'Operations' };
      if (posLower.includes('commercial manager') || posLower.includes('marketing manager')) return { level: 2, function: 'Commercial' };
      if (posLower.includes('hr manager')) return { level: 2, function: 'HR' };
      if (posLower.includes('it manager')) return { level: 2, function: 'IT' };
      if (posLower.includes('accounting manager')) return { level: 2, function: 'Finance' };
      if (posLower.includes('documentation manager')) return { level: 2, function: 'Operations' };
      if (posLower.includes('port ops manager')) return { level: 3, function: 'Operations' };
      if (posLower.includes('asst ops manager')) return { level: 4, function: 'Operations' };
      if (posLower.includes('accounting supervisor')) return { level: 3, function: 'Finance' };
      if (posLower.includes('ship agent')) return { level: 5, function: 'Operations' };
      if (posLower.includes('boarding agent') || posLower.includes('runner')) return { level: 6, function: 'Operations' };
      if (posLower.includes('accounting clerk')) return { level: 4, function: 'Finance' };
      if (posLower.includes('document clerk')) return { level: 4, function: 'Operations' };
      if (posLower.includes('ops admin clerk')) return { level: 6, function: 'Operations' };
      if (posLower.includes('hr clerk') || posLower.includes('payroll')) return { level: 3, function: 'HR' };
      if (posLower.includes('desktop support')) return { level: 3, function: 'IT' };
      if (posLower.includes('executive admin')) return { level: 2, function: 'Executive' };

      // Default
      return { level: 5, function: 'Operations' };
    };

    // Build nodes for each staff member
    const nodes = [];

    // Process corporate staff
    this.corporateStaff.forEach(staff => {
      const category = categorizeStaff(staff.position);
      nodes.push({
        position: staff.position,
        count: staff.count || 1,
        salary: staff.salary,
        level: category.level,
        function: category.function,
        type: 'corporate'
      });
    });

    // Process port staff
    this.portStaff.forEach(staff => {
      const category = categorizeStaff(staff.position);
      nodes.push({
        position: staff.position,
        count: staff.count || 1,
        salary: staff.salary,
        level: category.level,
        function: category.function,
        type: 'port'
      });
    });

    // Sort by level hierarchy
    nodes.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return b.salary - a.salary; // Within same level, sort by salary
    });

    // Group by function for functional org chart
    const functionalGroups = {};
    nodes.forEach(node => {
      if (!functionalGroups[node.function]) {
        functionalGroups[node.function] = [];
      }
      functionalGroups[node.function].push(node);
    });

    return {
      hierarchical: nodes,
      functional: functionalGroups,
      summary: {
        totalPositions: nodes.length,
        totalHeadcount: nodes.reduce((sum, n) => sum + n.count, 0),
        byFunction: Object.keys(functionalGroups).map(func => ({
          function: func,
          headcount: functionalGroups[func].reduce((sum, n) => sum + n.count, 0)
        }))
      }
    };
  }

  clone() {
    return new Location({
      id: this.generateId(),
      name: this.name + ' (Copy)',
      type: this.type,
      state: this.state,
      active: this.active,
      corporateStaff: JSON.parse(JSON.stringify(this.corporateStaff)),
      portStaff: JSON.parse(JSON.stringify(this.portStaff)),
      revenue: JSON.parse(JSON.stringify(this.revenue)),
      overhead: JSON.parse(JSON.stringify(this.overhead))
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      state: this.state,
      active: this.active,
      corporateStaff: this.corporateStaff,
      portStaff: this.portStaff,
      revenue: this.revenue,
      overhead: this.overhead
    };
  }

  static fromJSON(json) {
    return new Location(json);
  }
}

/**
 * Scenario class - represents a complete financial scenario
 */
class Scenario {
  constructor(config = {}) {
    this.id = config.id || this.generateId();
    this.name = config.name || 'New Scenario';
    this.modelType = config.modelType || 'traditional'; // 'traditional' or 'ai-enabled'
    this.created = config.created || new Date().toISOString();
    this.lastModified = config.lastModified || new Date().toISOString();

    // Locations
    this.locations = config.locations ? config.locations.map(l => Location.fromJSON(l)) : [];

    // Global assumptions
    this.globalAssumptions = {
      healthInsurancePerEmployee: config.globalAssumptions?.healthInsurancePerEmployee || 15000,
      retirement401kPercent: config.globalAssumptions?.retirement401kPercent || 4,
      aiReductionFactors: {
        documentationStaff: config.globalAssumptions?.aiReductionFactors?.documentationStaff || 0.60,
        accountingClerks: config.globalAssumptions?.aiReductionFactors?.accountingClerks || 0.50,
        opsAdminClerks: config.globalAssumptions?.aiReductionFactors?.opsAdminClerks || 0.70,
        technologyIncrease: config.globalAssumptions?.aiReductionFactors?.technologyIncrease || 150000
      }
    };

    // Corporate Indirect Overhead (NOT allocated to locations)
    this.corporateIndirectOverhead = {
      executiveCompensation: config.corporateIndirectOverhead?.executiveCompensation || 0,
      corporateLegal: config.corporateIndirectOverhead?.corporateLegal || 50000,
      corporateAccounting: config.corporateIndirectOverhead?.corporateAccounting || 75000,
      corporateInsurance: config.corporateIndirectOverhead?.corporateInsurance || 100000,
      corporateTechnology: config.corporateIndirectOverhead?.corporateTechnology || 150000,
      customTEItems: config.corporateIndirectOverhead?.customTEItems || []
    };

    // Consolidated results (calculated)
    this.consolidated = {
      totalRevenue: 0,
      totalCosts: 0,
      totalCalls: 0,
      revenuePerCall: 0,
      costPerCall: 0,
      deltaPerCall: 0,
      ebitda: 0,
      ebitdaMargin: 0,
      breakEvenCalls: 0
    };
  }

  generateId() {
    return 'scenario-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  addLocation(location) {
    this.locations.push(location);
    this.updateLastModified();
  }

  removeLocation(locationId) {
    this.locations = this.locations.filter(l => l.id !== locationId);
    this.updateLastModified();
  }

  getLocation(locationId) {
    return this.locations.find(l => l.id === locationId);
  }

  getActiveLocations() {
    return this.locations.filter(l => l.active);
  }

  getHQLocation() {
    return this.locations.find(l => l.type === 'hq');
  }

  getPortOfficeLocations() {
    return this.locations.filter(l => l.type === 'port-office');
  }

  getVirtualSatelliteLocations() {
    return this.locations.filter(l => l.type === 'virtual-satellite-office');
  }

  // Deprecated: Use getPortOfficeLocations() instead
  getSatelliteLocations() {
    return this.locations.filter(l => l.type === 'satellite' || l.type === 'port-office');
  }

  updateLastModified() {
    this.lastModified = new Date().toISOString();
  }

  updateConsolidated(consolidated) {
    this.consolidated = { ...this.consolidated, ...consolidated };
    this.updateLastModified();
  }

  clone(newName) {
    const clonedScenario = new Scenario({
      id: this.generateId(),
      name: newName || this.name + ' (Copy)',
      modelType: this.modelType,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      locations: JSON.parse(JSON.stringify(this.locations.map(l => l.toJSON()))),
      globalAssumptions: JSON.parse(JSON.stringify(this.globalAssumptions))
    });
    return clonedScenario;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      modelType: this.modelType,
      created: this.created,
      lastModified: this.lastModified,
      locations: this.locations.map(l => l.toJSON()),
      globalAssumptions: this.globalAssumptions,
      corporateIndirectOverhead: this.corporateIndirectOverhead,
      consolidated: this.consolidated
    };
  }

  static fromJSON(json) {
    return new Scenario(json);
  }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS
  module.exports = { Location, Scenario };
}

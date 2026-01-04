/**
 * Main Application Controller
 * Ship Agency Financial Model
 */

const App = {
  currentScenario: null,
  aiScenario: null,
  currentLocationId: null,

  /**
   * Initialize application
   */
  init() {
    console.log('Ship Agency Financial Model - Initializing...');

    // Check localStorage availability
    if (!Storage.isAvailable()) {
      alert('LocalStorage is not available. Scenarios will not be saved.');
    }

    // Initialize event listeners
    this.initEventListeners();

    // Initialize tabs
    this.initTabs();

    // Initialize sensitivity analysis
    SensitivityAnalysis.init();

    // Initialize scenario comparison
    ScenarioComparison.init();

    // Load scenarios dropdown
    this.loadScenarioDropdowns();

    // Try to load last scenario
    const lastScenario = Storage.loadCurrentScenario();
    if (lastScenario) {
      this.loadScenario(lastScenario);
    } else {
      console.log('No saved scenario. User should create new scenario or load example.');
    }

    console.log('Initialization complete.');
  },

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Scenario controls
    document.getElementById('btnNewScenario')?.addEventListener('click', () => this.createNewScenario());
    document.getElementById('btnSaveScenario')?.addEventListener('click', () => this.saveCurrentScenario());
    document.getElementById('btnLoadExample')?.addEventListener('click', () => this.loadExampleScenario());
    document.getElementById('btnExport')?.addEventListener('click', () => this.exportScenario());
    document.getElementById('scenarioSelector')?.addEventListener('change', (e) => this.onScenarioSelected(e.target.value));

    // Location controls
    document.getElementById('btnAddHQ')?.addEventListener('click', () => this.addLocation('hq'));
    document.getElementById('btnAddPortOffice')?.addEventListener('click', () => this.addLocation('port-office'));
    document.getElementById('btnAddVirtualSatellite')?.addEventListener('click', () => this.addLocation('virtual-satellite-office'));
  },

  /**
   * Initialize tabs
   */
  initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });
  },

  /**
   * Switch to a different tab
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`)?.classList.add('active');

    // Load sensitivity analysis when switching to sensitivity tab
    if (tabName === 'sensitivity' && this.currentScenario) {
      SensitivityAnalysis.setBaselineScenario(this.currentScenario);
    }

    // Load cycle time analysis when switching to cycle-time tab
    if (tabName === 'cycle-time' && this.currentScenario) {
      CycleTimeUI.render(this.currentScenario);
    }

    // Load corporate overhead when switching to corporate-overhead tab
    if (tabName === 'corporate-overhead' && this.currentScenario) {
      CorporateOverheadUI.render(this.currentScenario);
    }
  },

  /**
   * Create new scenario
   */
  createNewScenario() {
    const name = prompt('Enter scenario name:', 'New Scenario');
    if (!name) return;

    const modelType = confirm('Create AI-Enabled model?\n\nClick OK for AI-Enabled, Cancel for Traditional')
      ? 'ai-enabled'
      : 'traditional';

    const scenario = new Scenario({
      name,
      modelType,
      locations: [],
      globalAssumptions: {
        healthInsurancePerEmployee: 15000,
        retirement401kPercent: 4
      }
    });

    this.loadScenario(scenario);
    alert(`Created new ${modelType} scenario: ${name}\n\nClick "Add HQ" in the Locations tab to begin.`);
  },

  /**
   * Load scenario into app
   */
  loadScenario(scenario) {
    this.currentScenario = scenario;
    Storage.setCurrentScenario(scenario.id);

    // Refresh all views
    this.refreshDashboard();
    this.refreshLocations();

    console.log('Loaded scenario:', scenario.name);
  },

  /**
   * Save current scenario
   */
  saveCurrentScenario() {
    if (!this.currentScenario) {
      alert('No scenario to save.');
      return;
    }

    const success = Storage.saveScenario(this.currentScenario);
    if (success) {
      alert('Scenario saved successfully!');
      this.loadScenarioDropdowns();
    } else {
      alert('Failed to save scenario.');
    }
  },

  /**
   * Load example scenario
   */
  loadExampleScenario() {
    try {
      // Embedded default data (avoids fetch issues with file:// protocol)
      const defaults = {
        defaultHQLocation: {
          id: "houston-hq",
          name: "Houston",
          type: "hq",
          state: "TX",
          active: true,
          corporateStaff: [
            { position: "CEO/President", salary: 350000, count: 1 },
            { position: "CFO", salary: 275000, count: 1 },
            { position: "Controller", salary: 165000, count: 1 },
            { position: "VP Ops", salary: 225000, count: 1 },
            { position: "VP Commercial", salary: 225000, count: 1 },
            { position: "Commercial Manager", salary: 150000, count: 1 },
            { position: "Executive Admin", salary: 90000, count: 1 },
            { position: "HR Manager", salary: 200000, count: 1 },
            { position: "HR Clerk/Payroll", salary: 40.87, count: 1 },
            { position: "IT Manager", salary: 175000, count: 1 },
            { position: "Desktop Support", salary: 95000, count: 1 },
            { position: "Accounting Manager", salary: 125000, count: 1 },
            { position: "Accounting Supervisor", salary: 80000, count: 1 },
            { position: "Accounting Clerk", salary: 31.25, count: 2 },
            { position: "Documentation Manager", salary: 95000, count: 1 },
            { position: "Document Clerk", salary: 31.25, count: 2 }
          ],
          portStaff: [
            { position: "Port Ops Manager", salary: 142500, count: 1 },
            { position: "Asst Ops Manager", salary: 107500, count: 1 },
            { position: "Ship Agent", salary: 107500, count: 3 },
            { position: "Boarding Agent/Runner", salary: 38.46, count: 2, isHourly: true, annualHours: 2080 },
            { position: "Ops Admin Clerk", salary: 31.25, count: 2 }
          ],
          revenue: {
            shipTypes: [
              { type: "Grain", calls: 80, feePerCall: 12000, fundsPerCall: 135000 },
              { type: "Coal", calls: 60, feePerCall: 9800, fundsPerCall: 100000 },
              { type: "Container", calls: 120, feePerCall: 500, fundsPerCall: 5000 },
              { type: "Crude Tankers", calls: 40, feePerCall: 4000, fundsPerCall: 35000 },
              { type: "Break-bulk", calls: 30, feePerCall: 4500, fundsPerCall: 15000 }
            ],
            husbandry: { enabled: true, marginPercent: 9 },
            commission: { enabled: true, marginPercent: 1.5 },
            documentation: { manualAmount: 50000 }
          },
          overhead: {
            officeSpace: { sqft: 5000, costPerSqft: 22, rentClass: 'class-b' },
            insurance: { longshoremen: 25000, errorsOmissions: 50000, generalLiability: 15000 },
            technology: { office365: 3600, erpNetSuite: 50000, crmDynamics: 12000, specializedSaaS: 30000 },
            regulatory: { customsBond: 15000, fmcLicensing: 5000 },
            professionalServices: { legal: 15000, accounting: 25000, consulting: 10000 },
            officeOperations: { utilities: 12000, officeSupplies: 8000, maintenanceRepairs: 6000, janitorial: 8000 },
            communications: { phoneSystems: 6000, mobileDevices: 4000 },
            employeeRelated: { trainingDevelopment: 10000, recruiting: 8000, travelEntertainment: 12000 },
            vehicleTransport: { vehicleMaintenance: 12000, parking: 3000 },
            other: { miscellaneous: 0 },
            variableCosts: { milesPerCall: 25, vehicleType: 'company-sedan', costPerCall: 13.75 }
          }
        },
        globalAssumptions: {
          healthInsurancePerEmployee: 15000,
          retirement401kPercent: 4,
          aiReductionFactors: {
            documentationStaff: 0.60,
            accountingClerks: 0.50,
            opsAdminClerks: 0.70,
            technologyIncrease: 150000
          }
        }
      };

      const scenario = new Scenario({
        name: 'Example - Traditional Model',
        modelType: 'traditional',
        locations: [new Location(defaults.defaultHQLocation)],
        globalAssumptions: defaults.globalAssumptions
      });

      this.loadScenario(scenario);
      alert('Example scenario loaded! Review the Dashboard and Locations tabs.');
    } catch (error) {
      console.error('Error loading example:', error);
      alert('Failed to load example scenario.');
    }
  },

  /**
   * Export current scenario
   */
  exportScenario() {
    if (!this.currentScenario) {
      alert('No scenario to export.');
      return;
    }

    // Get current calculations
    const calculations = FinancialCalculator.calculateScenario(
      this.currentScenario,
      this.currentScenario.globalAssumptions
    );

    // Prompt for export format
    const format = prompt(
      'Export format:\n' +
      '1 = JSON (scenario data for import)\n' +
      '2 = CSV (simple spreadsheet export)\n' +
      '3 = Excel (multi-sheet workbook with all details)',
      '3'
    );

    if (format === '2') {
      // CSV Export
      ExportManager.exportToCSV(this.currentScenario, calculations);
    } else if (format === '3') {
      // Excel Export
      ExportManager.exportToExcel(this.currentScenario, calculations);
    } else if (format === '1') {
      // JSON Export (original functionality)
      const jsonString = Storage.exportScenario(this.currentScenario);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentScenario.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      a.click();

      URL.revokeObjectURL(url);
    } else {
      // Cancelled or invalid input
      return;
    }
  },

  /**
   * Refresh dashboard
   */
  refreshDashboard() {
    if (!this.currentScenario) {
      Dashboard.clear('dashboardTraditional');
      Dashboard.clear('dashboardAI');
      return;
    }

    if (this.currentScenario.modelType === 'traditional') {
      Dashboard.render(this.currentScenario, 'dashboardTraditional');

      // Try to generate AI version
      if (this.currentScenario.locations.length > 0) {
        this.aiScenario = FinancialCalculator.applyAIReductions(this.currentScenario);
        Dashboard.render(this.aiScenario, 'dashboardAI');
        Dashboard.renderDeltaAnalysis(this.currentScenario, this.aiScenario);
      }
    } else {
      Dashboard.render(this.currentScenario, 'dashboardAI');
    }

    // Update sensitivity analysis if that tab is currently active
    const sensitivityTab = document.getElementById('tab-sensitivity');
    if (sensitivityTab && sensitivityTab.classList.contains('active')) {
      SensitivityAnalysis.setBaselineScenario(this.currentScenario);
    }
  },

  /**
   * Refresh locations view
   */
  refreshLocations() {
    if (!this.currentScenario) return;

    LocationEditor.renderLocationList(this.currentScenario);

    // Re-render current location if one is selected
    if (this.currentLocationId) {
      const location = this.currentScenario.getLocation(this.currentLocationId);
      LocationEditor.renderEditor(location);
    }
  },

  /**
   * Add new location
   */
  addLocation(type) {
    if (!this.currentScenario) {
      alert('Create or load a scenario first.');
      return;
    }

    // Determine default name based on type
    let defaultName = 'New Location';
    if (type === 'hq') defaultName = 'Houston HQ';
    else if (type === 'port-office') defaultName = 'New Port Office';
    else if (type === 'virtual-satellite-office') defaultName = 'New Virtual/Satellite Office';

    const name = prompt(`Enter location name:`, defaultName);
    if (!name) return;

    const location = new Location({
      name,
      type,
      active: true
    });

    this.currentScenario.addLocation(location);
    this.refreshLocations();
    this.selectLocation(location.id);
  },

  /**
   * Remove location
   */
  removeLocation(locationId) {
    if (!confirm('Remove this location?')) return;

    this.currentScenario.removeLocation(locationId);
    this.currentLocationId = null;
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Select location for editing
   */
  selectLocation(locationId) {
    const location = this.currentScenario.getLocation(locationId);
    this.currentLocationId = locationId;
    LocationEditor.renderEditor(location);
    LocationEditor.renderLocationList(this.currentScenario);
  },

  /**
   * Update location field
   */
  updateLocationField(field, value) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    location[field] = value;
    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Add staff to current location
   */
  addStaff(locationId, staffType) {
    const location = this.currentScenario.getLocation(locationId);
    if (!location) return;

    const positions = staffType === 'corporate' ? CORPORATE_POSITIONS : PORT_POSITIONS;
    const positionName = prompt('Position:', positions[0].position);
    if (!positionName) return;

    const positionDef = positions.find(p => p.position === positionName) || positions[0];
    const salary = parseFloat(prompt('Salary:', positionDef.salaryDefault)) || positionDef.salaryDefault;
    const count = parseInt(prompt('Count:', 1)) || 1;

    location.addStaff(staffType, positionName, salary, count);
    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Update staff field (salary or count)
   */
  updateStaffField(staffType, index, field, value) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    const staffArray = staffType === 'corporate' ? location.corporateStaff : location.portStaff;
    if (staffArray[index]) {
      staffArray[index][field] = value;
      this.currentScenario.updateLastModified();
      this.refreshLocations();
      this.refreshDashboard();
    }
  },

  /**
   * Remove staff from current location
   */
  removeStaff(staffType, index) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    location.removeStaff(staffType, index);
    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Add ship type to current location
   */
  addShipType(locationId) {
    const location = this.currentScenario.getLocation(locationId);
    if (!location) return;

    const shipType = prompt('Ship Type:', SHIP_TYPES[0].type);
    if (!shipType) return;

    const shipTypeDef = SHIP_TYPES.find(st => st.type === shipType) || SHIP_TYPES[0];
    const calls = parseInt(prompt('Number of calls:', 10)) || 10;
    const fee = parseFloat(prompt('Fee per call:', shipTypeDef.feePerCall)) || shipTypeDef.feePerCall;

    location.addShipType(shipType, calls, fee, shipTypeDef.fundsPerCall);
    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Update ship type field (calls or feePerCall)
   */
  updateShipTypeField(index, field, value) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    if (location.revenue.shipTypes[index]) {
      location.revenue.shipTypes[index][field] = value;
      this.currentScenario.updateLastModified();
      this.refreshLocations();
      this.refreshDashboard();
    }
  },

  /**
   * Remove ship type from current location
   */
  removeShipType(index) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    location.removeShipType(index);
    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Update revenue field
   */
  updateRevenueField(field, value) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    const parts = field.split('.');
    let obj = location.revenue;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;

    this.currentScenario.updateLastModified();
    this.refreshDashboard();
  },

  /**
   * Update overhead field
   */
  updateOverheadField(field, value) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    const parts = field.split('.');
    let obj = location.overhead;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;

    this.currentScenario.updateLastModified();
    this.refreshDashboard();
  },

  /**
   * Update variable cost field
   */
  updateVariableCostField(field, value) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    location.overhead.variableCosts[field] = value;

    // Recalculate cost per call when miles or vehicle type changes
    location.updateVariableCostPerCall();

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Auto-scale office sqft based on team size
   */
  autoScaleOfficeSqft(locationId) {
    const location = this.currentScenario.getLocation(locationId);
    if (!location) return;

    location.autoScaleOfficeSqft();

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Update rent class (Class A vs Class B)
   */
  updateRentClass(locationId, rentClass) {
    const location = this.currentScenario.getLocation(locationId);
    if (!location) return;

    location.overhead.officeSpace.rentClass = rentClass;
    location.updateRentPerSqft();

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Apply benchmark overhead defaults based on company size
   */
  applyBenchmarkDefaults(locationId) {
    const location = this.currentScenario.getLocation(locationId);
    if (!location) return;

    const totalEmployees = location.getTotalEmployeeCount();
    const tier = totalEmployees <= 10 ? 'Small (1-10 employees)' :
                totalEmployees <= 50 ? 'Medium (11-50 employees)' :
                'Large (51-125 employees)';

    const confirmed = confirm(
      `Apply benchmark overhead defaults for ${tier}?\n\n` +
      `This will replace current overhead values with industry benchmarks based on ${totalEmployees} employees.`
    );

    if (!confirmed) return;

    location.applyBenchmarkOverhead();

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();

    alert(`Benchmark defaults applied successfully for ${tier}.`);
  },

  /**
   * Add overhead category
   */
  addOverheadCategory(locationId) {
    const location = this.currentScenario.getLocation(locationId);
    if (!location) return;

    const categoryName = prompt('Enter category name (e.g., "Marketing", "Legal Services"):');
    if (!categoryName) return;

    // Convert to camelCase for storage
    const camelCaseKey = categoryName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^(.)/, (match, chr) => chr.toLowerCase());

    const success = location.addOverheadCategory(camelCaseKey, categoryName);

    if (!success) {
      alert('Could not add category. It may already exist or be a protected category.');
      return;
    }

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Remove overhead category
   */
  removeOverheadCategory(category) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    const confirmed = confirm(`Delete the entire "${this.formatCategoryName(category)}" category and all its line items?`);
    if (!confirmed) return;

    const success = location.removeOverheadCategory(category);

    if (!success) {
      alert('Could not remove category. It may be a protected category.');
      return;
    }

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Format category key to readable name
   */
  formatCategoryName(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  },

  /**
   * Add overhead line item to a category
   */
  addOverheadItem(category) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    const itemName = prompt('Enter line item name (e.g., "Software Subscriptions"):');
    if (!itemName) return;

    // Convert to camelCase for storage
    const camelCaseKey = itemName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^(.)/, (match, chr) => chr.toLowerCase());

    const amount = parseFloat(prompt('Enter annual amount:', '0')) || 0;

    location.addOverheadItem(category, camelCaseKey, amount);

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Update overhead line item amount
   */
  updateOverheadItem(category, itemKey, amount) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    location.updateOverheadItem(category, itemKey, amount);

    this.currentScenario.updateLastModified();
    this.refreshDashboard();
  },

  /**
   * Remove overhead line item
   */
  removeOverheadItem(category, itemKey) {
    const location = this.currentScenario.getLocation(this.currentLocationId);
    if (!location) return;

    const confirmed = confirm(`Remove this overhead item?`);
    if (!confirmed) return;

    location.removeOverheadItem(category, itemKey);

    this.currentScenario.updateLastModified();
    this.refreshLocations();
    this.refreshDashboard();
  },

  /**
   * Load scenario dropdowns
   */
  loadScenarioDropdowns() {
    const scenarios = Storage.getScenarioList();

    const dropdowns = [
      document.getElementById('scenarioSelector'),
      document.getElementById('compareScenario1'),
      document.getElementById('compareScenario2'),
      document.getElementById('compareScenario3')
    ];

    dropdowns.forEach(dropdown => {
      if (!dropdown) return;

      const currentValue = dropdown.value;
      dropdown.innerHTML = '<option value="">-- Select Scenario --</option>';

      scenarios.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = Formatter.scenarioName(s.name, s.modelType);
        dropdown.appendChild(option);
      });

      dropdown.value = currentValue;
    });
  },

  /**
   * Handle scenario selection
   */
  onScenarioSelected(scenarioId) {
    if (!scenarioId) return;

    const scenario = Storage.loadScenario(scenarioId);
    if (scenario) {
      this.loadScenario(scenario);
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

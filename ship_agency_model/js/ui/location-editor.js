/**
 * Location Editor UI Component
 * Edit location details, staffing, revenue, and overhead
 */

const LocationEditor = {
  currentLocationId: null,

  /**
   * Overhead category definitions for tooltips
   */
  overheadDefinitions: {
    technology: {
      title: 'Technology & Software',
      description: 'Annual software licenses, SaaS subscriptions, and IT infrastructure costs. Includes: Office productivity suites (Office 365), ERP systems (NetSuite, SAP), CRM platforms (Salesforce, Dynamics), specialized maritime software (Sedna, Marcura, DA-Desk), cloud hosting, cybersecurity tools, and backup systems.',
      examples: 'Office365: $3,600, ERP NetSuite: $50,000, CRM: $12,000, Maritime SaaS: $30,000'
    },
    insurance: {
      title: 'Insurance & Risk Management',
      description: 'Annual insurance premiums protecting ship agency operations. Includes: Longshoremen & Harbor Workers insurance (LHWCA coverage for port-side workers), Errors & Omissions (E&O) insurance for professional liability, General Liability coverage, Cargo insurance, Cyber liability, and Workers Compensation.',
      examples: 'Longshoremen: $25,000, E&O: $50,000, General Liability: $15,000'
    },
    professionalServices: {
      title: 'Professional Services',
      description: 'External professional advisory fees and specialized consulting. Includes: Legal counsel (maritime law, contracts, compliance), Accounting and audit services, Tax preparation, Business consulting, Industry association memberships, Licensing and regulatory filings.',
      examples: 'Legal: $15,000, Accounting: $25,000, Consulting: $10,000'
    },
    officeOperations: {
      title: 'Office Operations',
      description: 'Day-to-day office running costs and facilities management. Includes: Utilities (electricity, water, gas, internet), Office supplies and stationery, Equipment leases (copiers, printers), Maintenance and repairs, Janitorial and cleaning services, Security systems, Waste management.',
      examples: 'Utilities: $12,000, Office Supplies: $8,000, Maintenance: $6,000, Janitorial: $8,000'
    },
    communications: {
      title: 'Communications',
      description: 'Voice, data, and communication systems for port operations requiring 24/7 connectivity. Includes: VoIP phone systems, Mobile device plans and hardware, Satellite phones, Marine radios, Video conferencing tools, Emergency communication systems.',
      examples: 'Phone Systems: $6,000, Mobile Devices: $4,000'
    },
    employeeRelated: {
      title: 'Employee Development & Relations',
      description: 'Staff development, recruitment, and employee engagement costs. Includes: Training and professional development, Industry certifications (IATA, FMC), Recruiting and onboarding, Employee events and morale, Travel and entertainment for business development, Relocation assistance.',
      examples: 'Training: $10,000, Recruiting: $8,000, Travel & Entertainment: $12,000'
    },
    vehicleTransport: {
      title: 'Vehicle & Transportation',
      description: 'Fixed costs for company vehicles and transportation infrastructure used for ship boarding, port runs, and local logistics. Includes: Vehicle leases or depreciation, Fuel (fixed allocations), Insurance, Registration and licensing, Maintenance and repairs, Parking permits and fees.',
      examples: 'Vehicle Maintenance: $12,000, Parking: $3,000'
    },
    regulatory: {
      title: 'Regulatory & Compliance',
      description: 'Mandatory licenses, bonds, and regulatory compliance costs for maritime operations. Includes: FMC (Federal Maritime Commission) licensing and OTI bonds, US Customs carrier bonds (Type 3), Port facility security clearances, TSA and MTSA compliance, OSHA certifications, State and local business licenses.',
      examples: 'Customs Bond: $15,000, FMC Licensing: $5,000'
    },
    other: {
      title: 'Other Overhead',
      description: 'Miscellaneous indirect costs not categorized elsewhere. Use this for: Contingency reserves, Bank fees and merchant services, Postage and shipping, Subscriptions and publications, Marketing materials, Community relations, Charitable contributions.',
      examples: 'Miscellaneous: $0 (adjust as needed)'
    }
  },

  /**
   * Render location list
   */
  renderLocationList(scenario) {
    const container = document.getElementById('locationList');
    if (!container) return;

    if (!scenario || scenario.locations.length === 0) {
      container.innerHTML = '<p class="text-muted">No locations. Click "Add HQ", "Add Port Office", or "Add Virtual/Satellite Office" to begin.</p>';
      return;
    }

    const html = `
      <div style="max-height: 600px; overflow-y: auto;">
        ${scenario.locations.map(loc => `
          <div class="card mb-1" style="cursor: pointer; ${loc.id === this.currentLocationId ? 'border: 2px solid var(--secondary-blue);' : ''}"
               onclick="App.selectLocation('${loc.id}')">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px;">
              <div>
                <strong>${loc.name}</strong>
                ${loc.type === 'hq' ? '<span class="badge badge-traditional">HQ</span>' : ''}
                ${loc.type === 'port-office' || loc.type === 'satellite' ? '<span class="badge badge-ai">Port Office</span>' : ''}
                ${loc.type === 'virtual-satellite-office' ? '<span class="badge" style="background: #9c27b0;">Virtual/Remote</span>' : ''}
                ${!loc.active ? '<span class="badge" style="background: #999;">Inactive</span>' : ''}
              </div>
              <div>
                <span class="text-muted">${loc.getTotalCalls()} calls</span>
                <button class="btn btn-danger btn-small" style="margin-left: 8px;"
                        onclick="event.stopPropagation(); App.removeLocation('${loc.id}')">Remove</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render location editor for selected location
   */
  renderEditor(location) {
    const container = document.getElementById('locationEditor');
    const titleElement = document.getElementById('locationEditorTitle');

    if (!location) {
      container.innerHTML = '<p class="text-muted">Select a location to edit.</p>';
      titleElement.textContent = 'Location Editor';
      this.currentLocationId = null;
      return;
    }

    this.currentLocationId = location.id;
    titleElement.textContent = `Editing: ${location.name}`;

    const html = `
      <!-- General Info -->
      <div class="form-group">
        <label class="form-label">Location Name:</label>
        <input type="text" class="form-input" id="locName" value="${location.name}"
               onchange="App.updateLocationField('name', this.value)">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">State:</label>
          <input type="text" class="form-input" id="locState" value="${location.state}"
                 onchange="App.updateLocationField('state', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Type:</label>
          <select class="form-select" id="locType" onchange="App.updateLocationField('type', this.value)">
            <option value="hq" ${location.type === 'hq' ? 'selected' : ''}>HQ</option>
            <option value="port-office" ${location.type === 'port-office' || location.type === 'satellite' ? 'selected' : ''}>Port Office</option>
            <option value="virtual-satellite-office" ${location.type === 'virtual-satellite-office' ? 'selected' : ''}>Virtual/Satellite Office</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Active:</label>
          <input type="checkbox" id="locActive" ${location.active ? 'checked' : ''}
                 onchange="App.updateLocationField('active', this.checked)">
        </div>
      </div>

      <!-- Quick Summary -->
      <div class="card mt-2" style="background: var(--lighter-blue); padding: 12px;">
        <div class="text-bold">Quick Summary:</div>
        <div>Total Calls: ${location.getTotalCalls()} annually</div>
        <div>Corporate Staff: ${location.corporateStaff.reduce((s, st) => s + st.count, 0)}</div>
        <div>Port Staff: ${location.portStaff.reduce((s, st) => s + st.count, 0)}</div>
      </div>

      <!-- Workload Analysis -->
      ${(() => {
        const workload = location.calculateWorkload();
        const statusColors = {
          'Underutilized': '#f0ad4e',
          'Optimal': '#28a745',
          'High': '#f0ad4e',
          'Overworked': '#dc3545',
          'No workload': '#6c757d'
        };
        const statusColor = statusColors[workload.workloadStatus] || '#6c757d';

        return `
        <div class="card mt-2" style="background: var(--bg-white); padding: 12px; border-left: 4px solid ${statusColor};">
          <div class="text-bold">Workload Analysis:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Monthly Calls (avg):</div>
              <div style="font-weight: bold;">${workload.monthlyCallsAvg} calls/month</div>
            </div>
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Agent Capacity:</div>
              <div style="font-weight: bold;">${workload.totalAgentCapacity} FTE</div>
            </div>
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Calls per Agent/Month:</div>
              <div style="font-weight: bold; color: ${statusColor};">${workload.callsPerAgentMonth}</div>
            </div>
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Status:</div>
              <div style="font-weight: bold; color: ${statusColor};">${workload.workloadStatus}</div>
            </div>
          </div>
          <div class="text-muted" style="font-size: 0.85rem; margin-top: 8px;">
            ${workload.agentCount} ship agents + ${workload.opsManagerCount} ops mgrs (50% capacity) + ${workload.boardingAgentCount} boarding agents
          </div>
          <div class="text-muted" style="font-size: 0.85rem;">
            Benchmark: ${workload.benchmarkRange}
          </div>
        </div>
        `;
      })()}

      <!-- Staffing Section -->
      <div class="card-header mt-2">Staffing</div>
      <p class="text-muted">Corporate Staff (${location.corporateStaff.length} positions):</p>
      ${this.renderStaffTable(location.corporateStaff, 'corporate')}
      <button class="btn btn-primary btn-small mt-1" onclick="App.addStaff('${location.id}', 'corporate')">Add Corporate Staff</button>

      <p class="text-muted mt-2">Port Operations Staff (${location.portStaff.length} positions):</p>
      ${this.renderStaffTable(location.portStaff, 'port')}
      <button class="btn btn-primary btn-small mt-1" onclick="App.addStaff('${location.id}', 'port')">Add Port Staff</button>

      <!-- Org Chart Section -->
      <div class="card-header mt-2">Organization Chart</div>
      ${this.renderOrgChart(location)}

      <!-- Revenue Section -->
      <div class="card-header mt-2">Revenue - Port Calls</div>
      ${this.renderShipTypesTable(location.revenue.shipTypes)}
      <button class="btn btn-primary btn-small mt-1" onclick="App.addShipType('${location.id}')">Add Ship Type</button>

      <div class="form-row mt-2">
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" ${location.revenue.husbandry.enabled ? 'checked' : ''}
                   onchange="App.updateRevenueField('husbandry.enabled', this.checked)">
            Husbandry Revenue (${location.revenue.husbandry.marginPercent}%)
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" ${location.revenue.commission.enabled ? 'checked' : ''}
                   onchange="App.updateRevenueField('commission.enabled', this.checked)">
            Commission Revenue (${location.revenue.commission.marginPercent}%)
          </label>
        </div>
      </div>

      <!-- Overhead Section -->
      <div class="card-header mt-2">Overhead - Office Space</div>

      <!-- Sqft Calculation Helper -->
      <div class="metric-card mb-1" style="background: var(--lighter-blue); padding: 12px;">
        <div class="text-bold">Recommended Office Size:</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
          <div>
            <div class="text-muted" style="font-size: 0.85rem;">Team Size:</div>
            <div style="font-weight: bold;">${location.calculateRecommendedSqft().employeeCount} employees</div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 0.85rem;">Recommended Total:</div>
            <div style="font-weight: bold;">${Formatter.number(location.calculateRecommendedSqft().totalSqft)} sqft</div>
          </div>
        </div>
        <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">
          ${Formatter.number(location.calculateRecommendedSqft().workspaceSqft)} sqft workspace +
          ${Formatter.number(location.calculateRecommendedSqft().commonAreaSqft)} sqft common areas
        </div>
        <button class="btn btn-primary btn-small mt-1" onclick="App.autoScaleOfficeSqft('${location.id}')">
          Auto-Scale to Recommended
        </button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Office Space (sqft):</label>
          <input type="number" class="form-input" value="${location.overhead.officeSpace.sqft}"
                 onchange="App.updateOverheadField('officeSpace.sqft', parseFloat(this.value))">
        </div>
        <div class="form-group">
          <label class="form-label">Rent Class:</label>
          <select class="form-select" onchange="App.updateRentClass('${location.id}', this.value)">
            <option value="class-b" ${location.overhead.officeSpace.rentClass === 'class-b' ? 'selected' : ''}>
              Class B ($15-25/sqft)
            </option>
            <option value="class-a" ${location.overhead.officeSpace.rentClass === 'class-a' ? 'selected' : ''}>
              Class A ($30-50/sqft)
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Cost per sqft ($/year):</label>
        <input type="number" class="form-input" value="${location.overhead.officeSpace.costPerSqft}"
               onchange="App.updateOverheadField('officeSpace.costPerSqft', parseFloat(this.value))">
        <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">
          ${location.getTypicalRentPerSqft().description}
        </div>
      </div>

      <div class="metric-card" style="background: var(--bg-white); padding: 12px; border: 1px solid var(--border-color);">
        <div class="text-bold">Annual Rent Cost:</div>
        <div class="metric-value" style="font-size: 1.2rem;">
          ${Formatter.currency(location.overhead.officeSpace.sqft * location.overhead.officeSpace.costPerSqft)}
        </div>
        <div class="text-muted" style="font-size: 0.85rem;">
          ${Formatter.number(location.overhead.officeSpace.sqft)} sqft × ${Formatter.currency(location.overhead.officeSpace.costPerSqft)}/sqft
        </div>
      </div>

      <div class="card-header mt-2">G&A Overhead Categories</div>

      <div class="card mt-2" style="background: var(--lighter-blue); padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div class="text-bold">Apply Benchmark Defaults</div>
            <div class="text-muted" style="font-size: 0.85rem;">
              Automatically populate overhead values based on company size
            </div>
          </div>
          <button class="btn btn-primary" onclick="App.applyBenchmarkDefaults('${location.id}')">
            Apply Defaults
          </button>
        </div>
        <div class="text-muted" style="font-size: 0.85rem; margin-top: 8px;">
          ${(() => {
            const totalEmployees = location.getTotalEmployeeCount();
            const tier = totalEmployees <= 10 ? 'Small (1-10 employees)' :
                        totalEmployees <= 50 ? 'Medium (11-50 employees)' :
                        'Large (51-125 employees)';
            return `Current: ${totalEmployees} employees → ${tier}`;
          })()}
        </div>
      </div>

      <div class="card mt-2" style="background: var(--bg-white); padding: 12px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="text-bold">Manage Overhead Categories</div>
          <button class="btn btn-primary btn-small" onclick="App.addOverheadCategory('${location.id}')">
            + Add Category
          </button>
        </div>
        <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">
          Add, remove, or customize overhead category groups
        </div>
      </div>

      ${this.renderAllOverheadCategories(location)}

      <div class="card-header mt-2">Variable Costs per Call</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Miles per Call:</label>
          <input type="number" class="form-input" value="${location.overhead.variableCosts.milesPerCall}"
                 onchange="App.updateVariableCostField('milesPerCall', parseFloat(this.value))">
        </div>
        <div class="form-group">
          <label class="form-label">Vehicle Type:</label>
          <select class="form-select" onchange="App.updateVariableCostField('vehicleType', this.value)">
            <option value="company-sedan" ${location.overhead.variableCosts.vehicleType === 'company-sedan' ? 'selected' : ''}>Company Sedan ($0.55/mi)</option>
            <option value="company-suv" ${location.overhead.variableCosts.vehicleType === 'company-suv' ? 'selected' : ''}>Company SUV ($0.75/mi)</option>
            <option value="mileage-reimbursement" ${location.overhead.variableCosts.vehicleType === 'mileage-reimbursement' ? 'selected' : ''}>Mileage Reimbursement ($0.67/mi)</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <div class="metric-card" style="background: var(--lighter-blue); padding: 12px;">
          <div class="text-bold">Calculated Cost per Call:</div>
          <div class="metric-value" style="font-size: 1.2rem;">${Formatter.currency(location.overhead.variableCosts.costPerCall, 2)}</div>
          <div class="text-muted" style="font-size: 0.85rem;">
            ${location.overhead.variableCosts.milesPerCall} miles × ${
              location.overhead.variableCosts.vehicleType === 'company-sedan' ? '$0.55' :
              location.overhead.variableCosts.vehicleType === 'company-suv' ? '$0.75' : '$0.67'
            }/mile
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render staff table
   */
  renderStaffTable(staff, staffType) {
    if (staff.length === 0) {
      return '<p class="text-muted">No staff added.</p>';
    }

    return `
      <table class="table-compact" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>Position</th>
            <th class="text-right">Type</th>
            <th class="text-right">Base Rate</th>
            <th class="text-right">OT Hrs</th>
            <th class="text-right">Bonus %</th>
            <th class="text-right">Count</th>
            <th class="text-right">Total Comp</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${staff.map((s, index) => {
            // Calculate total compensation
            let basePay = 0;
            if (s.isHourly) {
              const regularPay = (s.salary || 0) * (s.annualHours || 2080);
              const overtimePay = (s.salary || 0) * 1.5 * (s.overtimeHours || 0);
              basePay = regularPay + overtimePay;
            } else {
              basePay = s.salary || 0;
            }
            const bonus = basePay * ((s.bonusPercent || 10) / 100);
            const totalComp = (basePay + bonus) * (s.count || 0);

            return `
            <tr>
              <td>${s.position}</td>
              <td class="text-right">
                <span class="badge" style="background: ${s.isHourly ? '#17a2b8' : '#6c757d'}; font-size: 0.75rem;">
                  ${s.isHourly ? 'Hourly' : 'Salary'}
                </span>
              </td>
              <td class="text-right">
                <input type="number" class="form-input" style="width: 90px; text-align: right; font-size: 0.85rem;"
                       value="${s.isHourly ? s.salary.toFixed(2) : s.salary}"
                       step="${s.isHourly ? '0.01' : '1'}"
                       onchange="App.updateStaffField('${staffType}', ${index}, 'salary', parseFloat(this.value))"
                       title="${s.isHourly ? 'Hourly rate' : 'Annual salary'}">
              </td>
              <td class="text-right">
                ${s.isHourly ? `
                  <input type="number" class="form-input" style="width: 70px; text-align: right; font-size: 0.85rem;"
                         value="${s.overtimeHours || 0}"
                         onchange="App.updateStaffField('${staffType}', ${index}, 'overtimeHours', parseFloat(this.value))"
                         title="Annual OT hours at 1.5x">
                ` : '<span class="text-muted">-</span>'}
              </td>
              <td class="text-right">
                <input type="number" class="form-input" style="width: 60px; text-align: right; font-size: 0.85rem;"
                       value="${s.bonusPercent || 10}"
                       onchange="App.updateStaffField('${staffType}', ${index}, 'bonusPercent', parseFloat(this.value))"
                       title="Annual bonus %">
              </td>
              <td class="text-right">
                <input type="number" class="form-input" style="width: 60px; text-align: right; font-size: 0.85rem;"
                       value="${s.count}"
                       onchange="App.updateStaffField('${staffType}', ${index}, 'count', parseInt(this.value))">
              </td>
              <td class="text-right" style="font-weight: bold;">${Formatter.currency(totalComp, 0)}</td>
              <td class="text-right">
                <button class="btn btn-danger btn-small"
                        onclick="App.removeStaff('${staffType}', ${index})" style="font-size: 0.75rem;">×</button>
              </td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">
        💡 Total Comp = (Base Pay + OT) × (1 + Bonus%) × Count. Benefits (20%) calculated separately.
      </div>
    `;
  },

  /**
   * Render overhead category with editable line items
   */
  renderOverheadCategory(location, categoryKey, categoryTitle) {
    const category = location.overhead[categoryKey];
    if (!category) return '';

    // Protected categories that cannot be deleted
    const protectedCategories = ['officeSpace', 'variableCosts'];
    const isDeletable = !protectedCategories.includes(categoryKey);

    // Get tooltip definition for this category
    const definition = this.overheadDefinitions[categoryKey];
    const tooltipHtml = definition ? `
      <span class="overhead-tooltip-trigger" style="cursor: help; color: var(--primary-blue); margin-left: 6px; font-size: 1rem;">
        ℹ️
        <span class="overhead-tooltip">
          <strong>${definition.title}</strong><br><br>
          ${definition.description}<br><br>
          <em style="color: #ccc;">Examples: ${definition.examples}</em>
        </span>
      </span>
    ` : '';

    // Convert category object to array of line items
    const items = Object.entries(category).map(([key, value]) => ({
      key,
      label: this.formatLabel(key),
      value
    }));

    return `
      <div class="text-muted mt-2" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">
          ${categoryTitle}:${tooltipHtml}
        </span>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-small btn-primary"
                  onclick="App.addOverheadItem('${categoryKey}')"
                  style="font-size: 0.75rem; padding: 4px 8px;">
            + Add Item
          </button>
          ${isDeletable ? `
            <button class="btn btn-small btn-danger"
                    onclick="App.removeOverheadCategory('${categoryKey}')"
                    style="font-size: 0.75rem; padding: 4px 8px;">
              Delete Category
            </button>
          ` : ''}
        </div>
      </div>
      ${items.length === 0 ? '<p class="text-muted" style="font-size: 0.85rem; margin-left: 12px;">No items. Click "+ Add Item" to add.</p>' : ''}
      ${items.map(item => `
        <div class="form-row" style="align-items: center;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">${item.label}:</label>
            <input type="number" class="form-input" value="${item.value}"
                   onchange="App.updateOverheadItem('${categoryKey}', '${item.key}', parseFloat(this.value))"
                   style="width: 100%;">
          </div>
          <button class="btn btn-danger btn-small"
                  onclick="App.removeOverheadItem('${categoryKey}', '${item.key}')"
                  style="margin-top: 20px; font-size: 0.75rem; height: 32px;">
            ×
          </button>
        </div>
      `).join('')}
    `;
  },

  /**
   * Render all overhead categories dynamically
   */
  renderAllOverheadCategories(location) {
    // Categories to exclude (handled separately)
    const excludeCategories = ['officeSpace', 'variableCosts'];

    // Preferred order for standard categories
    const categoryOrder = [
      'technology',
      'insurance',
      'professionalServices',
      'officeOperations',
      'communications',
      'employeeRelated',
      'vehicleTransport',
      'regulatory',
      'other'
    ];

    // Get all category keys
    const allCategories = Object.keys(location.overhead)
      .filter(key => !excludeCategories.includes(key));

    // Sort: preferred order first, then alphabetically
    const sortedCategories = allCategories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);

      // Both in preferred order
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // Only a in preferred order
      if (aIndex !== -1) return -1;
      // Only b in preferred order
      if (bIndex !== -1) return 1;
      // Neither in preferred order - alphabetical
      return a.localeCompare(b);
    });

    // Render each category
    return sortedCategories
      .map(categoryKey => {
        const title = this.formatLabel(categoryKey);
        return this.renderOverheadCategory(location, categoryKey, title);
      })
      .join('');
  },

  /**
   * Format camelCase key to readable label
   */
  formatLabel(key) {
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/E O$/,'E&O') // Special case for Errors & Omissions
      .replace(/Erp/,'ERP')
      .replace(/Crm/,'CRM')
      .replace(/Fmc/,'FMC');
  },

  /**
   * Render organizational chart
   */
  renderOrgChart(location) {
    const orgData = location.buildOrgChart();

    const levelNames = {
      0: 'Executive',
      1: 'C-Suite',
      2: 'Directors & VPs',
      3: 'Managers',
      4: 'Supervisors & Asst Mgrs',
      5: 'Agents',
      6: 'Clerks & Staff'
    };

    // Function color palette
    const functionColors = {
      'Executive': '#003366',
      'Finance': '#0070C0',
      'Operations': '#0d3b66',
      'Commercial': '#00A86B',
      'IT': '#6A5ACD',
      'HR': '#DC143C'
    };

    return `
      <div style="margin-top: 12px;">
        <!-- View Toggle Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <button class="btn btn-small" id="orgChartHierarchyBtn"
                  onclick="LocationEditor.toggleOrgChartView('hierarchy')"
                  style="background: var(--primary-blue); color: white;">
            Hierarchical View
          </button>
          <button class="btn btn-small" id="orgChartFunctionalBtn"
                  onclick="LocationEditor.toggleOrgChartView('functional')"
                  style="background: var(--bg-light); color: var(--text-dark);">
            Functional View
          </button>
        </div>

        <!-- Summary Stats -->
        <div class="card" style="background: var(--lighter-blue); padding: 12px; margin-bottom: 12px;">
          <div class="text-bold">Organizational Summary:</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px;">
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Total Positions:</div>
              <div style="font-weight: bold; font-size: 1.1rem;">${orgData.summary.totalPositions}</div>
            </div>
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Total Headcount:</div>
              <div style="font-weight: bold; font-size: 1.1rem;">${orgData.summary.totalHeadcount}</div>
            </div>
            <div>
              <div class="text-muted" style="font-size: 0.85rem;">Functions:</div>
              <div style="font-weight: bold; font-size: 1.1rem;">${Object.keys(orgData.functional).length}</div>
            </div>
          </div>
        </div>

        <!-- Hierarchical View -->
        <div id="orgChartHierarchy" style="display: block;">
          <div class="text-muted" style="margin-bottom: 8px;">Organizational hierarchy by reporting levels:</div>
          ${this.renderHierarchicalOrgChart(orgData, levelNames, functionColors)}
        </div>

        <!-- Functional View -->
        <div id="orgChartFunctional" style="display: none;">
          <div class="text-muted" style="margin-bottom: 8px;">Staff grouped by functional department:</div>
          ${this.renderFunctionalOrgChart(orgData, functionColors)}
        </div>
      </div>
    `;
  },

  /**
   * Render hierarchical org chart
   */
  renderHierarchicalOrgChart(orgData, levelNames, functionColors) {
    // Group nodes by level
    const nodesByLevel = {};
    orgData.hierarchical.forEach(node => {
      if (!nodesByLevel[node.level]) {
        nodesByLevel[node.level] = [];
      }
      nodesByLevel[node.level].push(node);
    });

    const levels = Object.keys(nodesByLevel).sort((a, b) => parseInt(a) - parseInt(b));

    return levels.map(level => {
      const levelNum = parseInt(level);
      const nodes = nodesByLevel[level];

      return `
        <div class="card mt-1" style="border-left: 4px solid var(--primary-blue); padding: 12px;">
          <div style="font-weight: bold; color: var(--primary-blue); margin-bottom: 8px;">
            ${levelNames[levelNum] || `Level ${levelNum}`}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${nodes.map(node => `
              <div class="card" style="background: ${functionColors[node.function] || '#6c757d'}15;
                                        border: 1px solid ${functionColors[node.function] || '#6c757d'};
                                        padding: 8px; min-width: 180px;">
                <div style="font-weight: bold; font-size: 0.9rem;">${node.position}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <span class="badge" style="background: ${functionColors[node.function] || '#6c757d'}; font-size: 0.75rem;">
                    ${node.function}
                  </span>
                  <span style="font-size: 0.85rem; color: var(--text-muted);">×${node.count}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                  ${Formatter.currency(node.salary, 0)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render functional org chart
   */
  renderFunctionalOrgChart(orgData, functionColors) {
    const functions = Object.keys(orgData.functional).sort();

    return functions.map(func => {
      const nodes = orgData.functional[func];
      const headcount = nodes.reduce((sum, n) => sum + n.count, 0);
      const totalPayroll = nodes.reduce((sum, n) => sum + (n.salary * n.count), 0);

      return `
        <div class="card mt-1" style="border-left: 4px solid ${functionColors[func] || '#6c757d'}; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: bold; color: ${functionColors[func] || '#6c757d'}; font-size: 1.1rem;">
              ${func}
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                ${headcount} ${headcount === 1 ? 'person' : 'people'}
              </div>
              <div style="font-size: 0.85rem; font-weight: bold;">
                ${Formatter.currency(totalPayroll, 0)}
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
            ${nodes.map(node => `
              <div style="padding: 6px; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 4px;">
                <div style="font-weight: bold; font-size: 0.85rem;">${node.position}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">×${node.count}</span>
                  <span style="color: var(--text-muted);">${Formatter.currency(node.salary, 0)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Toggle org chart view between hierarchical and functional
   */
  toggleOrgChartView(view) {
    const hierarchyView = document.getElementById('orgChartHierarchy');
    const functionalView = document.getElementById('orgChartFunctional');
    const hierarchyBtn = document.getElementById('orgChartHierarchyBtn');
    const functionalBtn = document.getElementById('orgChartFunctionalBtn');

    if (view === 'hierarchy') {
      hierarchyView.style.display = 'block';
      functionalView.style.display = 'none';
      hierarchyBtn.style.background = 'var(--primary-blue)';
      hierarchyBtn.style.color = 'white';
      functionalBtn.style.background = 'var(--bg-light)';
      functionalBtn.style.color = 'var(--text-dark)';
    } else {
      hierarchyView.style.display = 'none';
      functionalView.style.display = 'block';
      hierarchyBtn.style.background = 'var(--bg-light)';
      hierarchyBtn.style.color = 'var(--text-dark)';
      functionalBtn.style.background = 'var(--primary-blue)';
      functionalBtn.style.color = 'white';
    }
  },

  /**
   * Render ship types table
   */
  renderShipTypesTable(shipTypes) {
    if (shipTypes.length === 0) {
      return '<p class="text-muted">No ship types added.</p>';
    }

    return `
      <table class="table-compact">
        <thead>
          <tr>
            <th>Ship Type</th>
            <th class="text-right">Calls</th>
            <th class="text-right">Fee/Call</th>
            <th class="text-right">Total Revenue</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${shipTypes.map((st, index) => `
            <tr>
              <td>${st.type}</td>
              <td class="text-right">
                <input type="number" class="form-input" style="width: 80px; text-align: right;"
                       value="${st.calls}"
                       onchange="App.updateShipTypeField(${index}, 'calls', parseInt(this.value))">
              </td>
              <td class="text-right">
                <input type="number" class="form-input" style="width: 120px; text-align: right;"
                       value="${st.feePerCall}"
                       onchange="App.updateShipTypeField(${index}, 'feePerCall', parseFloat(this.value))">
              </td>
              <td class="text-right">${Formatter.currency(st.calls * st.feePerCall)}</td>
              <td class="text-right">
                <button class="btn btn-danger btn-small"
                        onclick="App.removeShipType(${index})">Remove</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};

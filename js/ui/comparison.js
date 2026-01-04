/**
 * Scenario Comparison Module
 * Ship Agency Financial Model
 */

const ScenarioComparison = {
  selectedScenarios: [],

  /**
   * Initialize comparison module
   */
  init() {
    const compareBtn = document.getElementById('btnCompare');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.compareScenarios());
    }
  },

  /**
   * Compare selected scenarios
   */
  compareScenarios() {
    // Get selected scenario IDs from dropdowns
    const scenario1Id = document.getElementById('compareScenario1').value;
    const scenario2Id = document.getElementById('compareScenario2').value;
    const scenario3Id = document.getElementById('compareScenario3').value;

    // Load scenarios
    this.selectedScenarios = [];

    if (scenario1Id) {
      const s1 = Storage.loadScenario(scenario1Id);
      if (s1) this.selectedScenarios.push(s1);
    }
    if (scenario2Id && scenario2Id !== scenario1Id) {
      const s2 = Storage.loadScenario(scenario2Id);
      if (s2) this.selectedScenarios.push(s2);
    }
    if (scenario3Id && scenario3Id !== scenario1Id && scenario3Id !== scenario2Id) {
      const s3 = Storage.loadScenario(scenario3Id);
      if (s3) this.selectedScenarios.push(s3);
    }

    if (this.selectedScenarios.length < 2) {
      alert('Please select at least 2 different scenarios to compare.');
      return;
    }

    // Calculate financials for each scenario
    const calculatedScenarios = this.selectedScenarios.map(scenario => {
      const results = FinancialCalculator.calculateScenario(scenario);
      return {
        scenario,
        financials: results.consolidated,
        locationResults: results.locationResults
      };
    });

    // Render comparison
    this.renderComparison(calculatedScenarios);
  },

  /**
   * Render scenario comparison
   */
  renderComparison(calculatedScenarios) {
    const container = document.getElementById('comparisonResults');

    if (!container) return;

    const html = `
      ${this.renderComparisonHeader(calculatedScenarios)}
      ${this.renderKeyMetricsComparison(calculatedScenarios)}
      ${this.renderRevenueComparison(calculatedScenarios)}
      ${this.renderCostComparison(calculatedScenarios)}
      ${this.renderKPIComparison(calculatedScenarios)}
      ${this.renderLocationComparison(calculatedScenarios)}
      ${this.renderBestInClass(calculatedScenarios)}
    `;

    container.innerHTML = html;
  },

  /**
   * Render comparison header
   */
  renderComparisonHeader(calculatedScenarios) {
    return `
      <div class="card" style="background: var(--lighter-blue); padding: 16px; margin-bottom: 16px;">
        <div class="text-bold" style="font-size: 1.2rem; margin-bottom: 12px;">
          Comparing ${calculatedScenarios.length} Scenarios
        </div>
        <div style="display: grid; grid-template-columns: repeat(${calculatedScenarios.length}, 1fr); gap: 12px;">
          ${calculatedScenarios.map((cs, i) => `
            <div style="padding: 12px; background: var(--bg-white); border-radius: 4px;">
              <div style="font-weight: bold; color: var(--primary-blue); font-size: 1rem;">
                ${cs.scenario.name}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                ${cs.scenario.modelType === 'traditional' ? 'Traditional Model' : 'AI-Enabled Model'}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                ${cs.scenario.locations.length} location${cs.scenario.locations.length !== 1 ? 's' : ''}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                Modified: ${new Date(cs.scenario.lastModified).toLocaleDateString()}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render key metrics comparison
   */
  renderKeyMetricsComparison(calculatedScenarios) {
    const metrics = [
      { key: 'totalRevenue', label: 'Total Revenue', format: 'currency' },
      { key: 'totalCosts', label: 'Total Costs', format: 'currency' },
      { key: 'ebitda', label: 'EBITDA', format: 'currency', highlight: true },
      { key: 'ebitdaMargin', label: 'EBITDA Margin', format: 'percent' },
      { key: 'totalCalls', label: 'Total Port Calls', format: 'number' },
      { key: 'revenuePerCall', label: 'Revenue per Call', format: 'currency' },
      { key: 'totalCostPerCall', label: 'Total Cost per Call', format: 'currency' },
      { key: 'totalDeltaPerCall', label: 'Total Delta per Call', format: 'currency', highlight: true },
      { key: 'directCostPerCall', label: 'Direct Cost per Call', format: 'currency' },
      { key: 'directDeltaPerCall', label: 'Direct Delta per Call', format: 'currency', highlight: true },
      { key: 'breakEvenCalls', label: 'Break-Even Calls', format: 'number' }
    ];

    return `
      <div class="card-header mt-2">Key Metrics Comparison</div>
      <table class="table-compact" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>Metric</th>
            ${calculatedScenarios.map(cs => `<th class="text-right">${cs.scenario.name}</th>`).join('')}
            <th class="text-right">Best</th>
          </tr>
        </thead>
        <tbody>
          ${metrics.map(metric => {
            const values = calculatedScenarios.map(cs => cs.financials[metric.key]);
            const bestIndex = this.findBestIndex(values, metric.key);

            return `
              <tr ${metric.highlight ? 'style="background: var(--lighter-blue);"' : ''}>
                <td style="font-weight: ${metric.highlight ? 'bold' : 'normal'};">${metric.label}</td>
                ${values.map((value, i) => `
                  <td class="text-right" style="${i === bestIndex ? 'font-weight: bold; color: var(--success-green);' : ''}">
                    ${this.formatValue(value, metric.format)}
                  </td>
                `).join('')}
                <td class="text-right">
                  <span class="badge" style="background: var(--success-green);">
                    ${calculatedScenarios[bestIndex].scenario.name}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  /**
   * Render revenue comparison
   */
  renderRevenueComparison(calculatedScenarios) {
    return `
      <div class="card-header mt-2">Revenue Breakdown</div>
      <table class="table-compact" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>Revenue Source</th>
            ${calculatedScenarios.map(cs => `<th class="text-right">${cs.scenario.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base Agency Fees</td>
            ${calculatedScenarios.map(cs => {
              const baseRevenue = cs.financials.totalRevenue -
                                 (cs.financials.husbandryRevenue || 0) -
                                 (cs.financials.commissionRevenue || 0) -
                                 (cs.financials.documentationRevenue || 0);
              return `<td class="text-right">${Formatter.currency(baseRevenue)}</td>`;
            }).join('')}
          </tr>
          <tr>
            <td>Husbandry Revenue</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.husbandryRevenue || 0)}</td>
            `).join('')}
          </tr>
          <tr>
            <td>Commission Revenue</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.commissionRevenue || 0)}</td>
            `).join('')}
          </tr>
          <tr>
            <td>Documentation Fees</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.documentationRevenue || 0)}</td>
            `).join('')}
          </tr>
          <tr style="background: var(--lighter-blue); font-weight: bold;">
            <td>Total Revenue</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.totalRevenue)}</td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;
  },

  /**
   * Render cost comparison
   */
  renderCostComparison(calculatedScenarios) {
    return `
      <div class="card-header mt-2">Cost Breakdown</div>
      <table class="table-compact" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>Cost Category</th>
            ${calculatedScenarios.map(cs => `<th class="text-right">${cs.scenario.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Corporate Payroll</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.corporatePayroll || 0)}</td>
            `).join('')}
          </tr>
          <tr>
            <td>Port Payroll</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.portPayroll || 0)}</td>
            `).join('')}
          </tr>
          <tr>
            <td>Benefits (401k + Health)</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.totalBenefits || 0)}</td>
            `).join('')}
          </tr>
          <tr>
            <td>Total Overhead</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.totalOverhead || 0)}</td>
            `).join('')}
          </tr>
          <tr>
            <td>Variable Costs</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.totalVariableCosts || 0)}</td>
            `).join('')}
          </tr>
          <tr style="background: var(--lighter-blue); font-weight: bold;">
            <td>Total Costs</td>
            ${calculatedScenarios.map(cs => `
              <td class="text-right">${Formatter.currency(cs.financials.totalCosts)}</td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;
  },

  /**
   * Render KPI comparison with deltas
   */
  renderKPIComparison(calculatedScenarios) {
    const baseline = calculatedScenarios[0];

    return `
      <div class="card-header mt-2">KPI Comparison (vs. ${baseline.scenario.name})</div>
      <table class="table-compact" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>KPI</th>
            ${calculatedScenarios.map((cs, i) => `
              <th class="text-right">${cs.scenario.name}${i === 0 ? ' (Baseline)' : ''}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${this.renderKPIRow('EBITDA', calculatedScenarios, 'ebitda', 'currency', baseline)}
          ${this.renderKPIRow('EBITDA Margin', calculatedScenarios, 'ebitdaMargin', 'percent', baseline)}
          ${this.renderKPIRow('Total Delta/Call', calculatedScenarios, 'totalDeltaPerCall', 'currency', baseline)}
          ${this.renderKPIRow('Direct Delta/Call', calculatedScenarios, 'directDeltaPerCall', 'currency', baseline)}
          ${this.renderKPIRow('Employee Count', calculatedScenarios, 'totalEmployees', 'number', baseline)}
          ${this.renderKPIRow('Break-Even Calls', calculatedScenarios, 'breakEvenCalls', 'number', baseline, true)}
        </tbody>
      </table>
    `;
  },

  /**
   * Render a KPI row with delta calculation
   */
  renderKPIRow(label, calculatedScenarios, key, format, baseline, lowerIsBetter = false) {
    const baselineValue = baseline.financials[key];

    return `
      <tr>
        <td>${label}</td>
        ${calculatedScenarios.map((cs, i) => {
          const value = cs.financials[key];
          const delta = value - baselineValue;
          const deltaPercent = baselineValue !== 0 ? (delta / Math.abs(baselineValue)) * 100 : 0;

          const isPositive = lowerIsBetter ? delta < 0 : delta > 0;
          const deltaColor = i === 0 ? 'var(--text-muted)' :
                            delta === 0 ? 'var(--text-muted)' :
                            isPositive ? 'var(--success-green)' : 'var(--danger-red)';

          return `
            <td class="text-right">
              <div>${this.formatValue(value, format)}</div>
              ${i !== 0 ? `
                <div style="font-size: 0.8rem; color: ${deltaColor};">
                  ${delta > 0 ? '+' : ''}${this.formatValue(delta, format)}
                  (${delta > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%)
                </div>
              ` : '<div style="font-size: 0.8rem; color: var(--text-muted);">Baseline</div>'}
            </td>
          `;
        }).join('')}
      </tr>
    `;
  },

  /**
   * Render location-level comparison
   */
  renderLocationComparison(calculatedScenarios) {
    // Get all unique location names across scenarios
    const allLocationNames = new Set();
    calculatedScenarios.forEach(cs => {
      cs.scenario.locations.forEach(loc => {
        allLocationNames.add(loc.name);
      });
    });

    return `
      <div class="card-header mt-2">Location Comparison</div>
      <table class="table-compact" style="font-size: 0.9rem;">
        <thead>
          <tr>
            <th>Location</th>
            ${calculatedScenarios.map(cs => `<th class="text-right">${cs.scenario.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Array.from(allLocationNames).sort().map(locName => `
            <tr>
              <td style="font-weight: bold;">${locName}</td>
              ${calculatedScenarios.map(cs => {
                const location = cs.scenario.locations.find(l => l.name === locName);
                if (!location) {
                  return '<td class="text-right" style="color: var(--text-muted);">—</td>';
                }

                const totalStaff = location.getTotalEmployeeCount();
                const totalCalls = location.getTotalCalls();

                return `
                  <td class="text-right">
                    <div>${totalStaff} staff</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${totalCalls} calls/yr</div>
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  /**
   * Render best-in-class summary
   */
  renderBestInClass(calculatedScenarios) {
    const bestMetrics = {
      'Highest Revenue': this.findBest(calculatedScenarios, 'totalRevenue', false),
      'Lowest Costs': this.findBest(calculatedScenarios, 'totalCosts', true),
      'Highest EBITDA': this.findBest(calculatedScenarios, 'ebitda', false),
      'Best EBITDA Margin': this.findBest(calculatedScenarios, 'ebitdaMargin', false),
      'Best Delta/Call': this.findBest(calculatedScenarios, 'totalDeltaPerCall', false),
      'Most Efficient (Lowest Break-Even)': this.findBest(calculatedScenarios, 'breakEvenCalls', true)
    };

    return `
      <div class="card mt-2" style="background: var(--lighter-blue); padding: 16px;">
        <div class="text-bold" style="font-size: 1.1rem; margin-bottom: 12px;">
          Best-in-Class Summary
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
          ${Object.entries(bestMetrics).map(([label, { scenario, value, format }]) => `
            <div style="padding: 12px; background: var(--bg-white); border-radius: 4px; border-left: 4px solid var(--success-green);">
              <div style="font-size: 0.85rem; color: var(--text-muted);">${label}</div>
              <div style="font-weight: bold; color: var(--primary-blue); margin-top: 4px;">
                ${scenario.name}
              </div>
              <div style="font-size: 0.9rem; margin-top: 4px;">
                ${this.formatValue(value, format)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Find best scenario for a metric
   */
  findBest(calculatedScenarios, key, lowerIsBetter = false) {
    let bestIndex = 0;
    let bestValue = calculatedScenarios[0].financials[key];

    calculatedScenarios.forEach((cs, i) => {
      const value = cs.financials[key];
      if (lowerIsBetter ? value < bestValue : value > bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    });

    // Determine format
    let format = 'number';
    if (key.includes('Revenue') || key.includes('Cost') || key.includes('ebitda') || key.includes('Delta')) {
      format = 'currency';
    } else if (key.includes('Margin') || key.includes('Percent')) {
      format = 'percent';
    }

    return {
      scenario: calculatedScenarios[bestIndex].scenario,
      value: bestValue,
      format
    };
  },

  /**
   * Find best index for a metric
   */
  findBestIndex(values, metricKey) {
    const lowerIsBetter = ['totalCosts', 'totalCostPerCall', 'directCostPerCall', 'breakEvenCalls'].includes(metricKey);

    let bestIndex = 0;
    let bestValue = values[0];

    values.forEach((value, i) => {
      if (lowerIsBetter ? value < bestValue : value > bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    });

    return bestIndex;
  },

  /**
   * Format value based on type
   */
  formatValue(value, format) {
    switch (format) {
      case 'currency':
        return Formatter.currency(value);
      case 'percent':
        return Formatter.percent(value);
      case 'number':
        return Formatter.number(Math.round(value));
      default:
        return value;
    }
  }
};

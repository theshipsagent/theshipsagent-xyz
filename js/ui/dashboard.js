/**
 * Dashboard UI Component
 * Renders Traditional vs AI-Enabled comparison
 */

const Dashboard = {
  /**
   * Render dashboard for a scenario
   * @param {Scenario} scenario - Scenario to render
   * @param {string} containerId - Container element ID
   */
  render(scenario, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Calculate financials
    const results = FinancialCalculator.calculateScenario(scenario);
    const consolidated = results.consolidated;

    // Calculate float income (71-day cycle, 2% interest)
    const cycleDays = scenario.globalAssumptions?.cycleDays || 71;
    const interestRate = scenario.globalAssumptions?.floatInterestRate || 0.02;
    const floatIncome = FinancialCalculator.calculateFloatIncome(scenario, cycleDays, interestRate);

    // Build metrics HTML
    const html = `
      <!-- Hero Metric: Direct Delta per Call (KEY KPI) -->
      <div class="metric-card mb-2">
        <div class="metric-label">Direct Delta per Call (KEY KPI - Port Operations)</div>
        <div class="metric-value hero ${consolidated.directDeltaPerCall >= 0 ? 'delta-positive' : 'delta-negative'}">${Formatter.currency(consolidated.directDeltaPerCall)}</div>
        <div class="metric-subtext">Revenue per Call: ${Formatter.currency(consolidated.revenuePerCall)}</div>
        <div class="metric-subtext">Direct Cost per Call: ${Formatter.currency(consolidated.directCostPerCall)}</div>
      </div>

      <!-- Cross-Reference Metric: Total Delta per Call (all expenses) -->
      <div class="metric-card mb-2" style="background: var(--bg-white); border-left: 4px solid var(--text-muted);">
        <div class="metric-label">Total Delta per Call (Cross-Reference - All Expenses)</div>
        <div class="metric-value ${consolidated.totalDeltaPerCall >= 0 ? 'delta-positive' : 'delta-negative'}">${Formatter.currency(consolidated.totalDeltaPerCall)}</div>
        <div class="metric-subtext">Revenue per Call: ${Formatter.currency(consolidated.revenuePerCall)}</div>
        <div class="metric-subtext">Total Cost per Call: ${Formatter.currency(consolidated.totalCostPerCall)}</div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-2col mb-2">
        <div class="metric-card">
          <div class="metric-label">Total Revenue</div>
          <div class="metric-value">${Formatter.currency(consolidated.totalRevenue)}</div>
          <div class="metric-subtext">${Formatter.number(consolidated.totalCalls)} port calls</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Total Costs</div>
          <div class="metric-value">${Formatter.currency(consolidated.totalCosts)}</div>
          <div class="metric-subtext">${Formatter.number(consolidated.totalEmployees)} employees</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Float Income (Annual)</div>
          <div class="metric-value delta-positive">${Formatter.currency(floatIncome.annualIncome)}</div>
          <div class="metric-subtext">${cycleDays}-day cycle @ ${Formatter.percent(interestRate * 100, 1)}%</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Total Income (Revenue + Float)</div>
          <div class="metric-value delta-positive">${Formatter.currency(consolidated.totalRevenue + floatIncome.annualIncome)}</div>
          <div class="metric-subtext">Monthly: ${Formatter.currency(floatIncome.monthlyIncome)}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">EBITDA</div>
          <div class="metric-value ${consolidated.ebitda >= 0 ? 'delta-positive' : 'delta-negative'}">
            ${Formatter.currency(consolidated.ebitda)}
          </div>
          <div class="metric-subtext">Margin: ${Formatter.percent(consolidated.ebitdaMargin)}%</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Break-Even Calls</div>
          <div class="metric-value">${Formatter.number(consolidated.breakEvenCalls, 0)}</div>
          <div class="metric-subtext">
            ${consolidated.totalCalls >= consolidated.breakEvenCalls
              ? '<span class="delta-positive">✓ Above break-even</span>'
              : '<span class="delta-negative">✗ Below break-even</span>'}
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div class="card-header mt-2">Financial Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Total Revenue</strong></td>
            <td class="text-right"><strong>${Formatter.currency(consolidated.totalRevenue)}</strong></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Agency Fees</td>
            <td class="text-right">${Formatter.currency(consolidated.totalRevenue)}</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-gray);">
            <td style="padding-left: 24px;">Float Income (${cycleDays} days @ ${Formatter.percent(interestRate * 100, 1)}%)</td>
            <td class="text-right delta-positive">${Formatter.currency(floatIncome.annualIncome)}</td>
          </tr>
          <tr>
            <td><strong>Total Income</strong></td>
            <td class="text-right"><strong>${Formatter.currency(consolidated.totalRevenue + floatIncome.annualIncome)}</strong></td>
          </tr>
          <tr>
            <td><strong>Total Costs</strong></td>
            <td class="text-right"><strong>${Formatter.currency(consolidated.totalCosts)}</strong></td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Payroll</td>
            <td class="text-right">${Formatter.currency(this.sumLocationResults(results.locationResults, 'costs.totalPayroll'))}</td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Benefits</td>
            <td class="text-right">${Formatter.currency(this.sumLocationResults(results.locationResults, 'costs.totalBenefits'))}</td>
          </tr>
          <tr>
            <td style="padding-left: 24px;">Overhead</td>
            <td class="text-right">${Formatter.currency(this.sumLocationResults(results.locationResults, 'costs.totalOverhead'))}</td>
          </tr>
          <tr style="border-top: 2px solid var(--primary-blue);">
            <td><strong>EBITDA (Operating)</strong></td>
            <td class="text-right ${consolidated.ebitda >= 0 ? 'delta-positive' : 'delta-negative'}">
              <strong>${Formatter.currency(consolidated.ebitda)}</strong>
            </td>
          </tr>
          <tr style="border-top: 2px solid var(--success-green);">
            <td><strong>Net Income (w/ Float)</strong></td>
            <td class="text-right ${(consolidated.ebitda + floatIncome.annualIncome) >= 0 ? 'delta-positive' : 'delta-negative'}">
              <strong>${Formatter.currency(consolidated.ebitda + floatIncome.annualIncome)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Location Summary -->
      <div class="card-header mt-2">Location Summary</div>
      <table class="table-compact">
        <thead>
          <tr>
            <th>Location</th>
            <th class="text-right">Calls</th>
            <th class="text-right">Revenue</th>
            <th class="text-right">Costs</th>
            <th class="text-right">EBITDA</th>
          </tr>
        </thead>
        <tbody>
          ${this.renderLocationRows(results.locationResults)}
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  },

  /**
   * Render location rows for location summary table
   */
  renderLocationRows(locationResults) {
    return locationResults.map(lr => `
      <tr>
        <td>${lr.locationName} ${lr.locationType === 'hq' ? '<span class="badge badge-traditional">HQ</span>' : ''}</td>
        <td class="text-right">${Formatter.number(lr.totalCalls)}</td>
        <td class="text-right">${Formatter.currency(lr.revenue.total)}</td>
        <td class="text-right">${Formatter.currency(lr.costs.total)}</td>
        <td class="text-right ${lr.ebitda >= 0 ? 'delta-positive' : 'delta-negative'}">
          ${Formatter.currency(lr.ebitda)}
        </td>
      </tr>
    `).join('');
  },

  /**
   * Sum a specific field across all location results
   */
  sumLocationResults(locationResults, fieldPath) {
    return locationResults.reduce((sum, lr) => {
      const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], lr);
      return sum + (value || 0);
    }, 0);
  },

  /**
   * Render delta analysis comparing Traditional vs AI
   */
  renderDeltaAnalysis(traditionalScenario, aiScenario) {
    const container = document.getElementById('deltaAnalysis');
    if (!container) return;

    if (!traditionalScenario || !aiScenario) {
      container.innerHTML = '<p class="text-muted">Load both Traditional and AI scenarios to see comparison.</p>';
      return;
    }

    const comparison = FinancialCalculator.compareScenarios(traditionalScenario, aiScenario);
    const deltas = comparison.deltas;
    const percentChanges = comparison.percentChanges;

    const html = `
      <!-- Delta Summary Cards -->
      <div class="grid grid-4col mb-2">
        <div class="metric-card">
          <div class="metric-label">Cost Savings</div>
          <div class="metric-value ${deltas.totalCosts <= 0 ? 'delta-positive' : 'delta-negative'}">
            ${Formatter.delta(deltas.totalCosts).text}
          </div>
          <div class="metric-subtext">${Formatter.percentChange(percentChanges.totalCosts).text}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Employee Reduction</div>
          <div class="metric-value ${deltas.totalEmployees <= 0 ? 'delta-positive' : 'delta-negative'}">
            ${deltas.totalEmployees > 0 ? '+' : ''}${Math.round(deltas.totalEmployees)}
          </div>
          <div class="metric-subtext">${Formatter.percentChange(percentChanges.totalEmployees).text}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Delta per Call Improvement</div>
          <div class="metric-value ${deltas.deltaPerCall >= 0 ? 'delta-positive' : 'delta-negative'}">
            ${Formatter.delta(deltas.deltaPerCall, true).text}
          </div>
          <div class="metric-subtext">${Formatter.percentChange(percentChanges.deltaPerCall).text}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">EBITDA Improvement</div>
          <div class="metric-value ${deltas.ebitda >= 0 ? 'delta-positive' : 'delta-negative'}">
            ${Formatter.delta(deltas.ebitda).text}
          </div>
          <div class="metric-subtext">${Formatter.percentChange(percentChanges.ebitda).text}</div>
        </div>
      </div>

      <!-- Detailed Comparison Table -->
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th class="text-right">Traditional</th>
            <th class="text-right">AI-Enabled</th>
            <th class="text-right">Delta</th>
            <th class="text-right">% Change</th>
          </tr>
        </thead>
        <tbody>
          ${this.renderComparisonRow('Total Revenue',
            comparison.scenario1.results.consolidated.totalRevenue,
            comparison.scenario2.results.consolidated.totalRevenue,
            deltas.totalRevenue, percentChanges.totalRevenue, true)}
          ${this.renderComparisonRow('Total Costs',
            comparison.scenario1.results.consolidated.totalCosts,
            comparison.scenario2.results.consolidated.totalCosts,
            deltas.totalCosts, percentChanges.totalCosts, true, true)}
          ${this.renderComparisonRow('Total Employees',
            comparison.scenario1.results.consolidated.totalEmployees,
            comparison.scenario2.results.consolidated.totalEmployees,
            deltas.totalEmployees, percentChanges.totalEmployees, false, true)}
          ${this.renderComparisonRow('Revenue per Call',
            comparison.scenario1.results.consolidated.revenuePerCall,
            comparison.scenario2.results.consolidated.revenuePerCall,
            deltas.revenuePerCall, percentChanges.revenuePerCall, true)}
          ${this.renderComparisonRow('Direct Cost per Call (Port Operations)',
            comparison.scenario1.results.consolidated.directCostPerCall,
            comparison.scenario2.results.consolidated.directCostPerCall,
            deltas.directCostPerCall, percentChanges.directCostPerCall, true, true)}
          ${this.renderComparisonRow('Direct Delta per Call (KEY KPI)',
            comparison.scenario1.results.consolidated.directDeltaPerCall,
            comparison.scenario2.results.consolidated.directDeltaPerCall,
            deltas.directDeltaPerCall, percentChanges.directDeltaPerCall, true)}
          ${this.renderComparisonRow('Total Cost per Call (All Expenses)',
            comparison.scenario1.results.consolidated.totalCostPerCall,
            comparison.scenario2.results.consolidated.totalCostPerCall,
            deltas.totalCostPerCall, percentChanges.totalCostPerCall, true, true)}
          ${this.renderComparisonRow('Total Delta per Call (Cross-Reference)',
            comparison.scenario1.results.consolidated.totalDeltaPerCall,
            comparison.scenario2.results.consolidated.totalDeltaPerCall,
            deltas.totalDeltaPerCall, percentChanges.totalDeltaPerCall, true)}
          ${this.renderComparisonRow('EBITDA',
            comparison.scenario1.results.consolidated.ebitda,
            comparison.scenario2.results.consolidated.ebitda,
            deltas.ebitda, percentChanges.ebitda, true)}
          ${this.renderComparisonRow('EBITDA Margin',
            comparison.scenario1.results.consolidated.ebitdaMargin,
            comparison.scenario2.results.consolidated.ebitdaMargin,
            deltas.ebitdaMargin, percentChanges.ebitdaMargin, false)}
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  },

  /**
   * Render a comparison table row
   */
  renderComparisonRow(label, value1, value2, delta, percentChange, isCurrency = true, lowerIsBetter = false) {
    const deltaFormatted = isCurrency ? Formatter.currency(Math.abs(delta)) : Formatter.number(Math.abs(delta), 1);
    const deltaSign = delta >= 0 ? '+' : '-';

    // For costs, negative delta is good (savings)
    // For revenue/employees, positive delta depends on context
    let deltaClass = 'delta-neutral';
    if (lowerIsBetter) {
      deltaClass = delta < 0 ? 'delta-positive' : delta > 0 ? 'delta-negative' : 'delta-neutral';
    } else {
      deltaClass = delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : 'delta-neutral';
    }

    return `
      <tr>
        <td><strong>${label}</strong></td>
        <td class="text-right">${isCurrency ? Formatter.currency(value1) : Formatter.number(value1, 1)}</td>
        <td class="text-right">${isCurrency ? Formatter.currency(value2) : Formatter.number(value2, 1)}</td>
        <td class="text-right ${deltaClass}">${deltaSign}${deltaFormatted}</td>
        <td class="text-right ${deltaClass}">${Formatter.percentChange(percentChange).text}</td>
      </tr>
    `;
  },

  /**
   * Clear dashboard
   */
  clear(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<p class="text-muted">No scenario loaded.</p>';
    }
  }
};

/**
 * Cycle Time Sensitivity Analysis UI
 * Displays float income analysis based on cash cycle times
 */

class CycleTimeUI {
  /**
   * Render cycle time sensitivity analysis
   * @param {Object} scenario - Current scenario
   */
  static render(scenario) {
    const container = document.getElementById('tab-cycle-time');
    if (!container) return;

    if (!scenario) {
      container.innerHTML = '<p class="text-muted">No scenario loaded. Create or load a scenario to analyze cycle time impact.</p>';
      return;
    }

    // Calculate scenario totals for cash flow
    const results = FinancialCalculator.calculateScenario(scenario);
    const totalCashFlow = results.consolidated.totalCashFlow;

    if (totalCashFlow === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="card-header">Cycle Time & Float Income Analysis</div>
          <div class="card-body">
            <p class="text-muted">No cash flow data available. Add ship types with cash flow values to analyze float income impact.</p>
            <p class="text-muted"><strong>Note:</strong> Cash flow represents the total disbursements managed per port call (not revenue).</p>
          </div>
        </div>
      `;
      return;
    }

    // Get interest rate (allow user to adjust)
    const savedInterestRate = parseFloat(localStorage.getItem('cycleTimeInterestRate')) || 0.02;

    // Calculate sensitivity analysis
    const analysis = FinancialCalculator.calculateCycleTimeSensitivity(totalCashFlow, savedInterestRate);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">Float Income & Cycle Time Sensitivity</div>
        <div class="card-body">
          <p><strong>Why This Matters:</strong> Ship agencies hold client funds (cash float) during the disbursement cycle. Faster cycle times reduce float = less interest income.</p>

          <div class="grid grid-2col" style="margin-top: 20px;">
            <div>
              <label class="form-label">Annual Cash Flow (Disbursements)</label>
              <p class="metric-value">${Formatter.currency(totalCashFlow)}</p>
              <p class="text-muted" style="font-size: 0.9em;">Total managed on behalf of clients</p>
            </div>
            <div>
              <label class="form-label">Interest Rate (Annual)</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input
                  type="number"
                  id="interestRateInput"
                  class="form-control"
                  value="${(savedInterestRate * 100).toFixed(2)}"
                  min="0"
                  max="10"
                  step="0.1"
                  style="max-width: 120px;"
                >
                <span>%</span>
                <button id="updateInterestRate" class="btn btn-secondary btn-small">Update</button>
              </div>
              <p class="text-muted" style="font-size: 0.9em;">Money market / T-bill rate: 1.5-2% typical, 4-5% high</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-header">
          Cycle Time Scenarios
          <span class="badge" style="background: #00A86B; color: white; margin-left: 10px;">Baseline: ${analysis.baseline.cycleDays} days</span>
        </div>
        <div class="card-body">
          <div id="cycleTimeScenarios">${this.renderScenarios(analysis)}</div>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-header">Strategic Insight: Why Faster ≠ Better</div>
        <div class="card-body">
          <div class="insight-box" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 15px;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ The Float Income Trap</h4>
            <p><strong>Conventional wisdom says:</strong> "Faster cycle time is always better."</p>
            <p><strong>Reality:</strong> Reducing cycle time from ${analysis.baseline.cycleDays} to 30 days costs you <strong>${Formatter.currency(Math.abs(analysis.scenarios.aggressive_30_days.incomeVsBaseline))}</strong> in annual float income.</p>
          </div>

          <div class="insight-box" style="background: #d1ecf1; border-left: 4px solid #0070C0; padding: 15px;">
            <h4 style="margin-top: 0; color: #0c5460;">💡 The Smart Strategy</h4>
            <p><strong>Position:</strong> "Same service, lower cost via automation"</p>
            <ul>
              <li><strong>Preserve float income</strong> by maintaining current ${analysis.baseline.cycleDays}-day cycle</li>
              <li><strong>Reduce costs</strong> through labor automation (not cycle time reduction)</li>
              <li><strong>Pass savings</strong> through lower fees to win market share</li>
              <li><strong>Volume growth</strong> increases both float income AND agency fees</li>
            </ul>
            <p><strong>Result:</strong> You keep the ${Formatter.currency(analysis.baseline.annualIncome)} float income while cutting labor costs by $483K.</p>
          </div>
        </div>
      </div>
    `;

    // Add event listener for interest rate update
    const updateBtn = document.getElementById('updateInterestRate');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        const newRate = parseFloat(document.getElementById('interestRateInput').value) / 100;
        localStorage.setItem('cycleTimeInterestRate', newRate);
        this.render(scenario);
      });
    }
  }

  /**
   * Render scenarios table
   */
  static renderScenarios(analysis) {
    const scenarios = analysis.scenarios;
    const baseline = analysis.baseline;

    // Sort scenarios by cycle days
    const sortedScenarios = Object.entries(scenarios).sort((a, b) => a[1].cycleDays - b[1].cycleDays);

    let html = `
      <table class="table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Cycle Days</th>
            <th>Avg Float</th>
            <th>Annual Income</th>
            <th>Monthly Income</th>
            <th>vs Baseline</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const [name, data] of sortedScenarios) {
      const isBaseline = data.cycleDays === baseline.cycleDays;
      const rowClass = isBaseline ? 'row-baseline' : '';
      const scenarioLabel = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      // Color code the impact
      let impactClass = '';
      let impactIcon = '';
      if (data.incomeVsBaseline > 1000) {
        impactClass = 'positive';
        impactIcon = '↑';
      } else if (data.incomeVsBaseline < -1000) {
        impactClass = 'negative';
        impactIcon = '↓';
      } else {
        impactClass = 'neutral';
        impactIcon = '=';
      }

      html += `
        <tr class="${rowClass}">
          <td>
            ${scenarioLabel}
            ${isBaseline ? '<span class="badge" style="background: #00A86B; color: white; margin-left: 8px;">BASELINE</span>' : ''}
          </td>
          <td>${data.cycleDays}</td>
          <td>${Formatter.currency(data.averageFloat)}</td>
          <td><strong>${Formatter.currency(data.annualIncome)}</strong></td>
          <td>${Formatter.currency(data.monthlyIncome)}</td>
          <td class="${impactClass}">
            ${impactIcon} ${Formatter.currency(data.incomeVsBaseline)}
            ${!isBaseline ? `<br><small>(${data.percentVsBaseline > 0 ? '+' : ''}${data.percentVsBaseline.toFixed(1)}%)</small>` : ''}
          </td>
          <td>
            ${this.getImpactDescription(data.incomeVsBaseline, data.cycleDays, baseline.cycleDays)}
          </td>
        </tr>
      `;
    }

    html += `
        </tbody>
      </table>

      <style>
        .row-baseline {
          background-color: #f0f8f0;
          font-weight: 500;
        }
        .positive {
          color: #00A86B;
          font-weight: 600;
        }
        .negative {
          color: #dc3545;
          font-weight: 600;
        }
        .neutral {
          color: #6c757d;
        }
        .insight-box h4 {
          font-size: 1.1em;
        }
        .insight-box ul {
          margin-bottom: 0;
        }
        .insight-box li {
          margin-bottom: 8px;
        }
      </style>
    `;

    return html;
  }

  /**
   * Get impact description
   */
  static getImpactDescription(incomeVsBaseline, cycleDays, baselineDays) {
    if (Math.abs(incomeVsBaseline) < 1000) {
      return '<span class="text-muted">Minimal change</span>';
    }

    if (incomeVsBaseline > 0) {
      return `<span class="positive">Gain ${Formatter.currency(incomeVsBaseline)}</span>`;
    } else {
      const loss = Math.abs(incomeVsBaseline);
      if (cycleDays < baselineDays) {
        return `<span class="negative">⚠️ LOSS: ${Formatter.currency(loss)}<br><small>Faster = less float = less income</small></span>`;
      } else {
        return `<span class="positive">N/A - Slower cycle unlikely</span>`;
      }
    }
  }

  /**
   * Initialize cycle time analysis tab
   */
  static init() {
    // Tab will be rendered when selected in main app
    console.log('Cycle Time UI initialized');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CycleTimeUI };
}

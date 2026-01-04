/**
 * Sensitivity Analysis UI Component
 * Real-time what-if scenario analysis with sliders
 */

const SensitivityAnalysis = {
  baselineScenario: null,
  adjustedScenario: null,
  adjustments: {
    calls: 0,      // % change in port calls
    fees: 0,       // % change in fees per call
    payroll: 0,    // % change in payroll
    overhead: 0    // % change in overhead
  },

  /**
   * Initialize sensitivity analysis
   */
  init() {
    // Slider event listeners
    document.getElementById('sliderCalls')?.addEventListener('input', (e) => {
      this.adjustments.calls = parseInt(e.target.value);
      document.getElementById('sliderCallsValue').textContent = `${this.adjustments.calls > 0 ? '+' : ''}${this.adjustments.calls}%`;
      this.recalculate();
    });

    document.getElementById('sliderFees')?.addEventListener('input', (e) => {
      this.adjustments.fees = parseInt(e.target.value);
      document.getElementById('sliderFeesValue').textContent = `${this.adjustments.fees > 0 ? '+' : ''}${this.adjustments.fees}%`;
      this.recalculate();
    });

    document.getElementById('sliderPayroll')?.addEventListener('input', (e) => {
      this.adjustments.payroll = parseInt(e.target.value);
      document.getElementById('sliderPayrollValue').textContent = `${this.adjustments.payroll > 0 ? '+' : ''}${this.adjustments.payroll}%`;
      this.recalculate();
    });

    document.getElementById('sliderOverhead')?.addEventListener('input', (e) => {
      this.adjustments.overhead = parseInt(e.target.value);
      document.getElementById('sliderOverheadValue').textContent = `${this.adjustments.overhead > 0 ? '+' : ''}${this.adjustments.overhead}%`;
      this.recalculate();
    });

    // Button event listeners
    document.getElementById('btnResetSensitivity')?.addEventListener('click', () => this.reset());
    document.getElementById('btnSaveSensitivity')?.addEventListener('click', () => this.saveAsScenario());
  },

  /**
   * Set baseline scenario for sensitivity analysis
   */
  setBaselineScenario(scenario) {
    if (!scenario) {
      document.getElementById('sensitivityResults').innerHTML = '<p class="text-muted">Load a scenario to perform sensitivity analysis.</p>';
      return;
    }

    this.baselineScenario = scenario.clone(scenario.name + ' - Baseline');
    this.reset();
    this.recalculate();
  },

  /**
   * Reset all sliders to zero
   */
  reset() {
    this.adjustments = { calls: 0, fees: 0, payroll: 0, overhead: 0 };

    document.getElementById('sliderCalls').value = 0;
    document.getElementById('sliderFees').value = 0;
    document.getElementById('sliderPayroll').value = 0;
    document.getElementById('sliderOverhead').value = 0;

    document.getElementById('sliderCallsValue').textContent = '0%';
    document.getElementById('sliderFeesValue').textContent = '0%';
    document.getElementById('sliderPayrollValue').textContent = '0%';
    document.getElementById('sliderOverheadValue').textContent = '0%';

    this.recalculate();
  },

  /**
   * Recalculate scenario with adjustments
   */
  recalculate() {
    if (!this.baselineScenario) return;

    // Clone baseline scenario
    this.adjustedScenario = this.baselineScenario.clone(this.baselineScenario.name + ' - Sensitivity');

    // Debug logging
    console.log('=== SENSITIVITY RECALCULATE DEBUG ===');
    console.log('Baseline scenario name:', this.baselineScenario.name);
    console.log('Baseline locations count:', this.baselineScenario.locations.length);
    console.log('Baseline first location shipTypes:', this.baselineScenario.locations[0].revenue.shipTypes);
    console.log('Adjusted first location shipTypes (before modifications):', this.adjustedScenario.locations[0].revenue.shipTypes);
    console.log('Same object?', this.baselineScenario.locations[0].revenue.shipTypes === this.adjustedScenario.locations[0].revenue.shipTypes);

    // Apply adjustments to each location
    this.adjustedScenario.locations.forEach(location => {
      // Adjust port calls
      if (this.adjustments.calls !== 0) {
        location.revenue.shipTypes.forEach(st => {
          st.calls = Math.round(st.calls * (1 + this.adjustments.calls / 100));
        });
      }

      // Adjust fees per call
      if (this.adjustments.fees !== 0) {
        location.revenue.shipTypes.forEach(st => {
          st.feePerCall = st.feePerCall * (1 + this.adjustments.fees / 100);
        });
      }

      // Adjust payroll
      if (this.adjustments.payroll !== 0) {
        location.corporateStaff.forEach(staff => {
          staff.salary = staff.salary * (1 + this.adjustments.payroll / 100);
        });
        location.portStaff.forEach(staff => {
          staff.salary = staff.salary * (1 + this.adjustments.payroll / 100);
        });
      }

      // Adjust overhead
      if (this.adjustments.overhead !== 0) {
        const factor = 1 + this.adjustments.overhead / 100;

        // Office space
        location.overhead.officeSpace.costPerSqft *= factor;

        // Insurance
        location.overhead.insurance.longshoremen *= factor;
        location.overhead.insurance.errorsOmissions *= factor;
        location.overhead.insurance.generalLiability *= factor;

        // Technology
        location.overhead.technology.office365 *= factor;
        location.overhead.technology.erpNetSuite *= factor;
        location.overhead.technology.crmDynamics *= factor;
        location.overhead.technology.specializedSaaS *= factor;

        // Regulatory
        location.overhead.regulatory.customsBond *= factor;
        location.overhead.regulatory.fmcLicensing *= factor;

        // Professional Services
        if (location.overhead.professionalServices) {
          location.overhead.professionalServices.legal *= factor;
          location.overhead.professionalServices.accounting *= factor;
          location.overhead.professionalServices.consulting *= factor;
        }

        // Office Operations
        if (location.overhead.officeOperations) {
          location.overhead.officeOperations.utilities *= factor;
          location.overhead.officeOperations.officeSupplies *= factor;
          location.overhead.officeOperations.maintenanceRepairs *= factor;
          location.overhead.officeOperations.janitorial *= factor;
        }

        // Communications
        if (location.overhead.communications) {
          location.overhead.communications.phoneSystems *= factor;
          location.overhead.communications.mobileDevices *= factor;
        }

        // Employee Related
        if (location.overhead.employeeRelated) {
          location.overhead.employeeRelated.trainingDevelopment *= factor;
          location.overhead.employeeRelated.recruiting *= factor;
          location.overhead.employeeRelated.travelEntertainment *= factor;
        }

        // Vehicle Transport
        if (location.overhead.vehicleTransport) {
          location.overhead.vehicleTransport.vehicleMaintenance *= factor;
          location.overhead.vehicleTransport.parking *= factor;
        }
      }
    });

    // Render results
    this.renderResults();
    this.renderTornadoChart();
  },

  /**
   * Render sensitivity results
   */
  renderResults() {
    const baselineResults = FinancialCalculator.calculateScenario(this.baselineScenario);
    const adjustedResults = FinancialCalculator.calculateScenario(this.adjustedScenario);

    const baselineConsolidated = baselineResults.consolidated;
    const adjustedConsolidated = adjustedResults.consolidated;

    // Calculate deltas
    const deltaRevenue = adjustedConsolidated.totalRevenue - baselineConsolidated.totalRevenue;
    const deltaCosts = adjustedConsolidated.totalCosts - baselineConsolidated.totalCosts;
    const deltaEbitda = adjustedConsolidated.ebitda - baselineConsolidated.ebitda;
    const deltaDirectDelta = adjustedConsolidated.directDeltaPerCall - baselineConsolidated.directDeltaPerCall;
    const deltaTotalDelta = adjustedConsolidated.totalDeltaPerCall - baselineConsolidated.totalDeltaPerCall;

    const html = `
      <!-- Comparison Table -->
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th class="text-right">Baseline</th>
            <th class="text-right">Adjusted</th>
            <th class="text-right">Delta</th>
            <th class="text-right">% Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Total Revenue</strong></td>
            <td class="text-right">${Formatter.currency(baselineConsolidated.totalRevenue)}</td>
            <td class="text-right">${Formatter.currency(adjustedConsolidated.totalRevenue)}</td>
            <td class="text-right ${deltaRevenue >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.delta(deltaRevenue).text}
            </td>
            <td class="text-right ${deltaRevenue >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.totalRevenue, adjustedConsolidated.totalRevenue)).text}
            </td>
          </tr>
          <tr>
            <td><strong>Total Costs</strong></td>
            <td class="text-right">${Formatter.currency(baselineConsolidated.totalCosts)}</td>
            <td class="text-right">${Formatter.currency(adjustedConsolidated.totalCosts)}</td>
            <td class="text-right ${deltaCosts <= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.delta(deltaCosts).text}
            </td>
            <td class="text-right ${deltaCosts <= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.totalCosts, adjustedConsolidated.totalCosts)).text}
            </td>
          </tr>
          <tr>
            <td><strong>Total Calls</strong></td>
            <td class="text-right">${Formatter.number(baselineConsolidated.totalCalls)}</td>
            <td class="text-right">${Formatter.number(adjustedConsolidated.totalCalls)}</td>
            <td class="text-right">${adjustedConsolidated.totalCalls - baselineConsolidated.totalCalls > 0 ? '+' : ''}${Formatter.number(adjustedConsolidated.totalCalls - baselineConsolidated.totalCalls)}</td>
            <td class="text-right">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.totalCalls, adjustedConsolidated.totalCalls)).text}
            </td>
          </tr>
          <tr style="border-top: 2px solid var(--primary-blue);">
            <td><strong>Direct Delta per Call (KEY KPI)</strong></td>
            <td class="text-right">${Formatter.currency(baselineConsolidated.directDeltaPerCall, 2)}</td>
            <td class="text-right">${Formatter.currency(adjustedConsolidated.directDeltaPerCall, 2)}</td>
            <td class="text-right ${deltaDirectDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.delta(deltaDirectDelta, true, 2).text}
            </td>
            <td class="text-right ${deltaDirectDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.directDeltaPerCall, adjustedConsolidated.directDeltaPerCall)).text}
            </td>
          </tr>
          <tr>
            <td><strong>Total Delta per Call</strong></td>
            <td class="text-right">${Formatter.currency(baselineConsolidated.totalDeltaPerCall, 2)}</td>
            <td class="text-right">${Formatter.currency(adjustedConsolidated.totalDeltaPerCall, 2)}</td>
            <td class="text-right ${deltaTotalDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.delta(deltaTotalDelta, true, 2).text}
            </td>
            <td class="text-right ${deltaTotalDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.totalDeltaPerCall, adjustedConsolidated.totalDeltaPerCall)).text}
            </td>
          </tr>
          <tr style="border-top: 2px solid var(--primary-blue);">
            <td><strong>EBITDA</strong></td>
            <td class="text-right">${Formatter.currency(baselineConsolidated.ebitda)}</td>
            <td class="text-right">${Formatter.currency(adjustedConsolidated.ebitda)}</td>
            <td class="text-right ${deltaEbitda >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.delta(deltaEbitda).text}
            </td>
            <td class="text-right ${deltaEbitda >= 0 ? 'delta-positive' : 'delta-negative'}">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.ebitda, adjustedConsolidated.ebitda)).text}
            </td>
          </tr>
          <tr>
            <td><strong>EBITDA Margin</strong></td>
            <td class="text-right">${Formatter.percent(baselineConsolidated.ebitdaMargin)}%</td>
            <td class="text-right">${Formatter.percent(adjustedConsolidated.ebitdaMargin)}%</td>
            <td class="text-right">${adjustedConsolidated.ebitdaMargin - baselineConsolidated.ebitdaMargin >= 0 ? '+' : ''}${Formatter.percent(adjustedConsolidated.ebitdaMargin - baselineConsolidated.ebitdaMargin)}%</td>
            <td class="text-right">
              ${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.ebitdaMargin, adjustedConsolidated.ebitdaMargin)).text}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Cards -->
      <div class="grid grid-3col mt-2">
        <div class="metric-card">
          <div class="metric-label">Net Impact on EBITDA</div>
          <div class="metric-value ${deltaEbitda >= 0 ? 'delta-positive' : 'delta-negative'}">
            ${Formatter.delta(deltaEbitda).text}
          </div>
          <div class="metric-subtext">${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.ebitda, adjustedConsolidated.ebitda)).text}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Net Impact on Direct Delta/Call</div>
          <div class="metric-value ${deltaDirectDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
            ${Formatter.delta(deltaDirectDelta, true, 2).text}
          </div>
          <div class="metric-subtext">${Formatter.percentChange(FinancialCalculator.calculatePercentChange(baselineConsolidated.directDeltaPerCall, adjustedConsolidated.directDeltaPerCall)).text}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Break-Even Calls</div>
          <div class="metric-value">${Formatter.number(adjustedConsolidated.breakEvenCalls, 0)}</div>
          <div class="metric-subtext">
            ${adjustedConsolidated.breakEvenCalls < baselineConsolidated.breakEvenCalls ?
              `<span class="delta-positive">↓ ${Formatter.number(baselineConsolidated.breakEvenCalls - adjustedConsolidated.breakEvenCalls, 0)} calls lower</span>` :
              `<span class="delta-negative">↑ ${Formatter.number(adjustedConsolidated.breakEvenCalls - baselineConsolidated.breakEvenCalls, 0)} calls higher</span>`
            }
          </div>
        </div>
      </div>
    `;

    document.getElementById('sensitivityResults').innerHTML = html;
  },

  /**
   * Render tornado chart showing impact ranking
   */
  renderTornadoChart() {
    if (!this.baselineScenario) return;

    // Calculate impact of each variable at ±20%
    const impacts = [];

    // Test each variable independently
    ['calls', 'fees', 'payroll', 'overhead'].forEach(variable => {
      // Save current adjustments
      const savedAdjustments = { ...this.adjustments };

      // Reset all
      this.adjustments = { calls: 0, fees: 0, payroll: 0, overhead: 0 };

      // Calculate baseline
      const baselineClone = this.baselineScenario.clone();
      const baselineEbitda = FinancialCalculator.calculateScenario(baselineClone).consolidated.ebitda;

      // Test +20%
      this.adjustments[variable] = 20;
      const positiveClone = this.baselineScenario.clone();
      this.applyAdjustmentsToScenario(positiveClone);
      const positiveEbitda = FinancialCalculator.calculateScenario(positiveClone).consolidated.ebitda;

      // Test -20%
      this.adjustments[variable] = -20;
      const negativeClone = this.baselineScenario.clone();
      this.applyAdjustmentsToScenario(negativeClone);
      const negativeEbitda = FinancialCalculator.calculateScenario(negativeClone).consolidated.ebitda;

      impacts.push({
        variable,
        positiveImpact: positiveEbitda - baselineEbitda,
        negativeImpact: negativeEbitda - baselineEbitda,
        totalRange: Math.abs(positiveEbitda - negativeEbitda)
      });

      // Restore adjustments
      this.adjustments = savedAdjustments;
    });

    // Sort by total range (largest impact first)
    impacts.sort((a, b) => b.totalRange - a.totalRange);

    // Render as horizontal bar chart
    const canvas = document.getElementById('chartTornado');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if any
    if (canvas.chart) {
      canvas.chart.destroy();
    }

    const labels = impacts.map(i => {
      const varNames = {
        calls: 'Port Call Volume',
        fees: 'Average Fee per Call',
        payroll: 'Payroll Costs',
        overhead: 'Overhead Costs'
      };
      return varNames[i.variable];
    });

    canvas.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '-20% Impact',
            data: impacts.map(i => i.negativeImpact),
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          },
          {
            label: '+20% Impact',
            data: impacts.map(i => i.positiveImpact),
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'EBITDA Impact at ±20% Change'
          },
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Formatter.currency(context.parsed.x);
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Impact on EBITDA ($)'
            },
            ticks: {
              callback: function(value) {
                return Formatter.currency(value, 0);
              }
            }
          }
        }
      }
    });
  },

  /**
   * Apply adjustments to a scenario (helper method)
   */
  applyAdjustmentsToScenario(scenario) {
    scenario.locations.forEach(location => {
      // Adjust port calls
      if (this.adjustments.calls !== 0) {
        location.revenue.shipTypes.forEach(st => {
          st.calls = Math.round(st.calls * (1 + this.adjustments.calls / 100));
        });
      }

      // Adjust fees per call
      if (this.adjustments.fees !== 0) {
        location.revenue.shipTypes.forEach(st => {
          st.feePerCall = st.feePerCall * (1 + this.adjustments.fees / 100);
        });
      }

      // Adjust payroll
      if (this.adjustments.payroll !== 0) {
        location.corporateStaff.forEach(staff => {
          staff.salary = staff.salary * (1 + this.adjustments.payroll / 100);
        });
        location.portStaff.forEach(staff => {
          staff.salary = staff.salary * (1 + this.adjustments.payroll / 100);
        });
      }

      // Adjust overhead
      if (this.adjustments.overhead !== 0) {
        const factor = 1 + this.adjustments.overhead / 100;
        location.overhead.officeSpace.costPerSqft *= factor;
        location.overhead.insurance.longshoremen *= factor;
        location.overhead.insurance.errorsOmissions *= factor;
        location.overhead.insurance.generalLiability *= factor;
        location.overhead.technology.office365 *= factor;
        location.overhead.technology.erpNetSuite *= factor;
        location.overhead.technology.crmDynamics *= factor;
        location.overhead.technology.specializedSaaS *= factor;
        location.overhead.regulatory.customsBond *= factor;
        location.overhead.regulatory.fmcLicensing *= factor;

        if (location.overhead.professionalServices) {
          location.overhead.professionalServices.legal *= factor;
          location.overhead.professionalServices.accounting *= factor;
          location.overhead.professionalServices.consulting *= factor;
        }

        if (location.overhead.officeOperations) {
          location.overhead.officeOperations.utilities *= factor;
          location.overhead.officeOperations.officeSupplies *= factor;
          location.overhead.officeOperations.maintenanceRepairs *= factor;
          location.overhead.officeOperations.janitorial *= factor;
        }

        if (location.overhead.communications) {
          location.overhead.communications.phoneSystems *= factor;
          location.overhead.communications.mobileDevices *= factor;
        }

        if (location.overhead.employeeRelated) {
          location.overhead.employeeRelated.trainingDevelopment *= factor;
          location.overhead.employeeRelated.recruiting *= factor;
          location.overhead.employeeRelated.travelEntertainment *= factor;
        }

        if (location.overhead.vehicleTransport) {
          location.overhead.vehicleTransport.vehicleMaintenance *= factor;
          location.overhead.vehicleTransport.parking *= factor;
        }
      }
    });
  },

  /**
   * Save adjusted scenario as new scenario
   */
  saveAsScenario() {
    if (!this.adjustedScenario) {
      alert('No adjusted scenario to save.');
      return;
    }

    const name = prompt('Enter name for new scenario:', this.adjustedScenario.name);
    if (!name) return;

    this.adjustedScenario.name = name;
    this.adjustedScenario.id = 'scenario-' + Date.now();

    const success = Storage.saveScenario(this.adjustedScenario);
    if (success) {
      alert('Sensitivity scenario saved successfully!');
      App.loadScenarioDropdowns();
    } else {
      alert('Failed to save scenario.');
    }
  }
};

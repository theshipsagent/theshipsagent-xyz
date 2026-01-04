/**
 * Corporate Overhead UI Component
 * Manages corporate indirect costs and custom T&E line items
 */

const CorporateOverheadUI = {
  currentScenario: null,

  /**
   * Render corporate overhead management interface
   * @param {Scenario} scenario - Current scenario
   */
  render(scenario) {
    this.currentScenario = scenario;
    const container = document.getElementById('tab-corporate-overhead');
    if (!container) return;

    const overhead = scenario.corporateIndirectOverhead;

    const html = `
      <div class="card">
        <div class="card-header">Corporate Overhead Management</div>
        <div class="card-body">

          <!-- Methodology Documentation Section -->
          <div class="mb-3" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary-blue);">
            <h3 style="margin-top: 0; color: var(--primary-blue);">Methodology & Documentation</h3>
            <p style="margin-bottom: 12px;"><strong>How Corporate Indirect Overhead Estimates Were Calculated:</strong></p>

            <div style="margin-left: 20px;">
              <p><strong>Executive Compensation:</strong> CEO + CFO + VP-level base salaries and bonuses. This is typically separated from operational payroll for executive reporting and tax purposes.</p>

              <p><strong>Corporate Legal:</strong> Annual retainer ($30K) + ad-hoc matters ($20K) based on industry benchmark of 0.5% of revenue for professional services firms. Includes contract review, regulatory compliance, and general counsel services.</p>

              <p><strong>Corporate Accounting:</strong> External audit ($50K) + tax preparation ($15K) + quarterly reviews ($10K). Does not include internal accounting staff salaries (those are in location-level payroll).</p>

              <p><strong>Corporate Insurance:</strong> Directors & Officers insurance ($75K) + Cyber liability ($25K) based on $10M revenue company quotes from 3 brokers. Does not include operational insurance (E&O, general liability) which are allocated to locations.</p>

              <p><strong>Corporate Technology:</strong> Enterprise ERP system licensing ($50K) + Corporate CRM ($12K) + Infrastructure & security ($20K). For AI-enabled model, add AI platform costs ($150K). Location-level technology costs are allocated separately.</p>

              <p><strong>Custom T&E:</strong> Commercial development expenses tailored to business strategy. Examples: international sales trips, industry conference sponsorships, client development entertainment, trade association memberships.</p>
            </div>

            <p style="margin-top: 16px; color: var(--text-muted); font-style: italic;">Note: Corporate indirect overhead is NOT allocated to individual port locations. It represents enterprise-level costs that benefit the entire organization.</p>
          </div>

          <!-- Fixed Corporate Indirect Costs -->
          <div class="mb-3">
            <h3 style="color: var(--primary-blue);">Fixed Corporate Indirect Costs</h3>

            <div class="form-group">
              <label class="form-label">Executive Compensation</label>
              <input type="number" id="corpExecutiveComp" class="form-control"
                     value="${overhead.executiveCompensation || 0}"
                     placeholder="0">
              <small class="text-muted">CEO, CFO, VP-level compensation separated from operational payroll</small>
            </div>

            <div class="form-group">
              <label class="form-label">Corporate Legal</label>
              <input type="number" id="corpLegal" class="form-control"
                     value="${overhead.corporateLegal || 0}"
                     placeholder="50000">
              <small class="text-muted">Annual retainer + ad-hoc matters (contracts, compliance, general counsel)</small>
            </div>

            <div class="form-group">
              <label class="form-label">Corporate Accounting</label>
              <input type="number" id="corpAccounting" class="form-control"
                     value="${overhead.corporateAccounting || 0}"
                     placeholder="75000">
              <small class="text-muted">External audit + tax preparation + quarterly reviews</small>
            </div>

            <div class="form-group">
              <label class="form-label">Corporate Insurance</label>
              <input type="number" id="corpInsurance" class="form-control"
                     value="${overhead.corporateInsurance || 0}"
                     placeholder="100000">
              <small class="text-muted">D&O insurance + Cyber liability (operational insurance allocated to locations)</small>
            </div>

            <div class="form-group">
              <label class="form-label">Corporate Technology</label>
              <input type="number" id="corpTechnology" class="form-control"
                     value="${overhead.corporateTechnology || 0}"
                     placeholder="150000">
              <small class="text-muted">Enterprise ERP + Corporate CRM + Infrastructure + AI platforms (if applicable)</small>
            </div>

            <div class="metric-card mt-2" style="background: #e3f2fd;">
              <div class="metric-label">Fixed Corporate Indirect Total</div>
              <div class="metric-value" id="fixedCorpTotal">${Formatter.currency(this.calculateFixedTotal(overhead))}</div>
            </div>
          </div>

          <!-- Custom T&E Line Items -->
          <div class="mb-3">
            <h3 style="color: var(--primary-blue);">Custom Commercial T&E Line Items</h3>
            <p class="text-muted">Add custom travel & entertainment expenses for commercial development activities.</p>

            <button id="btnAddTEItem" class="btn btn-primary btn-small mb-2">+ Add Line Item</button>

            <div id="teItemsContainer">
              ${this.renderTEItems(overhead.customTEItems || [])}
            </div>

            <div class="metric-card mt-2" style="background: #e8f5e9;">
              <div class="metric-label">Custom T&E Total</div>
              <div class="metric-value" id="customTETotal">${Formatter.currency(this.calculateTETotal(overhead.customTEItems || []))}</div>
            </div>
          </div>

          <!-- Grand Total -->
          <div class="metric-card mt-3" style="background: var(--primary-blue); color: white;">
            <div class="metric-label" style="color: white;">Total Corporate Indirect Overhead</div>
            <div class="metric-value hero" style="color: white;" id="grandCorpTotal">${Formatter.currency(this.calculateGrandTotal(overhead))}</div>
            <div class="metric-subtext" style="color: rgba(255,255,255,0.9);">Not allocated to individual port locations</div>
          </div>

        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
  },

  /**
   * Render custom T&E items table
   * @param {Array} items - Custom T&E items
   */
  renderTEItems(items) {
    if (!items || items.length === 0) {
      return '<p class="text-muted">No custom T&E items. Click "Add Line Item" to create one.</p>';
    }

    let html = `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 60%;">Description</th>
            <th style="width: 30%;">Amount</th>
            <th style="width: 10%;"></th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item, index) => {
      html += `
        <tr>
          <td>
            <input type="text" class="form-control te-description"
                   data-index="${index}"
                   value="${item.description || ''}"
                   placeholder="e.g., Q1 Euro sales trip">
          </td>
          <td>
            <input type="number" class="form-control te-amount"
                   data-index="${index}"
                   value="${item.amount || 0}"
                   placeholder="0">
          </td>
          <td>
            <button class="btn btn-danger btn-small btn-remove-te" data-index="${index}">Remove</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  },

  /**
   * Attach event listeners to form elements
   */
  attachEventListeners() {
    // Fixed corporate costs inputs
    const fixedInputs = [
      'corpExecutiveComp',
      'corpLegal',
      'corpAccounting',
      'corpInsurance',
      'corpTechnology'
    ];

    fixedInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => this.updateFixedCosts());
      }
    });

    // Add T&E item button
    const btnAddTE = document.getElementById('btnAddTEItem');
    if (btnAddTE) {
      btnAddTE.addEventListener('click', () => this.addTEItem());
    }

    // T&E item inputs (description and amount)
    document.querySelectorAll('.te-description, .te-amount').forEach(input => {
      input.addEventListener('input', (e) => this.updateTEItem(e));
    });

    // Remove T&E item buttons
    document.querySelectorAll('.btn-remove-te').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.removeTEItem(index);
      });
    });
  },

  /**
   * Update fixed corporate costs in scenario
   */
  updateFixedCosts() {
    if (!this.currentScenario) return;

    const overhead = this.currentScenario.corporateIndirectOverhead;

    overhead.executiveCompensation = parseFloat(document.getElementById('corpExecutiveComp').value) || 0;
    overhead.corporateLegal = parseFloat(document.getElementById('corpLegal').value) || 0;
    overhead.corporateAccounting = parseFloat(document.getElementById('corpAccounting').value) || 0;
    overhead.corporateInsurance = parseFloat(document.getElementById('corpInsurance').value) || 0;
    overhead.corporateTechnology = parseFloat(document.getElementById('corpTechnology').value) || 0;

    this.updateTotals();

    // Trigger dashboard refresh if this is the traditional scenario
    if (window.app && window.app.currentScenario === this.currentScenario) {
      window.app.refreshDashboard();
    }
  },

  /**
   * Add new T&E item
   */
  addTEItem() {
    if (!this.currentScenario) return;

    const description = prompt('Enter T&E item description:', 'Commercial development expense');
    if (!description) return;

    const amountStr = prompt('Enter amount:', '0');
    const amount = parseFloat(amountStr) || 0;

    const overhead = this.currentScenario.corporateIndirectOverhead;
    if (!overhead.customTEItems) {
      overhead.customTEItems = [];
    }

    overhead.customTEItems.push({ description, amount });

    // Re-render T&E items section
    const container = document.getElementById('teItemsContainer');
    if (container) {
      container.innerHTML = this.renderTEItems(overhead.customTEItems);
      this.attachEventListeners(); // Re-attach listeners for new items
    }

    this.updateTotals();

    if (window.app && window.app.currentScenario === this.currentScenario) {
      window.app.refreshDashboard();
    }
  },

  /**
   * Update T&E item when input changes
   * @param {Event} e - Input event
   */
  updateTEItem(e) {
    if (!this.currentScenario) return;

    const index = parseInt(e.target.getAttribute('data-index'));
    const overhead = this.currentScenario.corporateIndirectOverhead;

    if (!overhead.customTEItems || !overhead.customTEItems[index]) return;

    if (e.target.classList.contains('te-description')) {
      overhead.customTEItems[index].description = e.target.value;
    } else if (e.target.classList.contains('te-amount')) {
      overhead.customTEItems[index].amount = parseFloat(e.target.value) || 0;
    }

    this.updateTotals();

    if (window.app && window.app.currentScenario === this.currentScenario) {
      window.app.refreshDashboard();
    }
  },

  /**
   * Remove T&E item
   * @param {number} index - Item index to remove
   */
  removeTEItem(index) {
    if (!this.currentScenario) return;

    const overhead = this.currentScenario.corporateIndirectOverhead;
    if (!overhead.customTEItems) return;

    overhead.customTEItems.splice(index, 1);

    // Re-render T&E items section
    const container = document.getElementById('teItemsContainer');
    if (container) {
      container.innerHTML = this.renderTEItems(overhead.customTEItems);
      this.attachEventListeners();
    }

    this.updateTotals();

    if (window.app && window.app.currentScenario === this.currentScenario) {
      window.app.refreshDashboard();
    }
  },

  /**
   * Calculate fixed corporate costs total
   * @param {Object} overhead - Corporate indirect overhead object
   */
  calculateFixedTotal(overhead) {
    return (overhead.executiveCompensation || 0) +
           (overhead.corporateLegal || 0) +
           (overhead.corporateAccounting || 0) +
           (overhead.corporateInsurance || 0) +
           (overhead.corporateTechnology || 0);
  },

  /**
   * Calculate custom T&E total
   * @param {Array} items - Custom T&E items
   */
  calculateTETotal(items) {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  },

  /**
   * Calculate grand total of all corporate indirect overhead
   * @param {Object} overhead - Corporate indirect overhead object
   */
  calculateGrandTotal(overhead) {
    return this.calculateFixedTotal(overhead) + this.calculateTETotal(overhead.customTEItems || []);
  },

  /**
   * Update all total displays
   */
  updateTotals() {
    if (!this.currentScenario) return;

    const overhead = this.currentScenario.corporateIndirectOverhead;

    const fixedTotalEl = document.getElementById('fixedCorpTotal');
    if (fixedTotalEl) {
      fixedTotalEl.textContent = Formatter.currency(this.calculateFixedTotal(overhead));
    }

    const customTETotalEl = document.getElementById('customTETotal');
    if (customTETotalEl) {
      customTETotalEl.textContent = Formatter.currency(this.calculateTETotal(overhead.customTEItems || []));
    }

    const grandTotalEl = document.getElementById('grandCorpTotal');
    if (grandTotalEl) {
      grandTotalEl.textContent = Formatter.currency(this.calculateGrandTotal(overhead));
    }
  }
};

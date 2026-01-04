/**
 * Scenario Manager UI Component
 * Directory view of all saved scenarios with load, copy, download, delete actions
 */

const ScenarioManager = {
  MAX_SCENARIOS: 25,

  /**
   * Initialize scenario manager UI
   */
  init() {
    this.refreshScenarioList();
  },

  /**
   * Refresh the scenario list display
   */
  refreshScenarioList() {
    const scenarios = Storage.getAllScenarios();
    const container = document.getElementById('scenario-list-container');

    if (!container) return;

    // Sort by last modified (newest first)
    scenarios.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    // Storage info
    const storageInfo = Storage.getStorageInfo();
    const storageInfoHtml = `
      <div class="storage-info">
        <div class="storage-stat">
          <span class="stat-label">Scenarios:</span>
          <span class="stat-value">${storageInfo.scenarioCount} / ${this.MAX_SCENARIOS}</span>
        </div>
        <div class="storage-stat">
          <span class="stat-label">Storage Used:</span>
          <span class="stat-value">${storageInfo.sizeKB} KB</span>
        </div>
      </div>
    `;

    if (scenarios.length === 0) {
      container.innerHTML = `
        ${storageInfoHtml}
        <div class="empty-state">
          <p>📋 No saved scenarios</p>
          <p class="empty-state-desc">Create a new scenario or load an example to get started.</p>
        </div>
      `;
      return;
    }

    // Build scenario table
    const tableHtml = `
      ${storageInfoHtml}
      <div class="scenario-table-wrapper">
        <table class="scenario-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Locations</th>
              <th>Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${scenarios.map(s => this.renderScenarioRow(s)).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;

    // Attach event listeners
    this.attachEventListeners();
  },

  /**
   * Render a single scenario row
   */
  renderScenarioRow(scenarioData) {
    const created = new Date(scenarioData.created).toLocaleDateString();
    const modified = new Date(scenarioData.lastModified).toLocaleString();
    const locationCount = scenarioData.locations ? scenarioData.locations.length : 0;
    const typeLabel = scenarioData.modelType === 'traditional' ? 'Traditional' : 'AI-Enabled';
    const typeBadge = scenarioData.modelType === 'traditional' ? 'badge-traditional' : 'badge-ai';

    const currentScenarioId = Storage.getCurrentScenarioId();
    const isActive = currentScenarioId === scenarioData.id;

    return `
      <tr class="scenario-row ${isActive ? 'active-scenario' : ''}" data-scenario-id="${scenarioData.id}">
        <td>
          <div class="scenario-name">
            ${isActive ? '<span class="active-indicator">●</span>' : ''}
            ${scenarioData.name}
          </div>
          <div class="scenario-meta">Created: ${created}</div>
        </td>
        <td>
          <span class="badge ${typeBadge}">${typeLabel}</span>
        </td>
        <td class="text-center">${locationCount}</td>
        <td class="scenario-date">${modified}</td>
        <td class="scenario-actions">
          <button class="action-btn btn-load" data-action="load" data-id="${scenarioData.id}" title="Load scenario">
            📂 Load
          </button>
          <button class="action-btn btn-copy" data-action="copy" data-id="${scenarioData.id}" title="Duplicate scenario">
            📋 Copy
          </button>
          <button class="action-btn btn-download" data-action="download" data-id="${scenarioData.id}" title="Download JSON">
            💾 Download
          </button>
          <button class="action-btn btn-delete" data-action="delete" data-id="${scenarioData.id}" title="Delete scenario">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  },

  /**
   * Attach event listeners to action buttons
   */
  attachEventListeners() {
    const container = document.getElementById('scenario-list-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const scenarioId = btn.dataset.id;

      switch (action) {
        case 'load':
          this.loadScenario(scenarioId);
          break;
        case 'copy':
          this.copyScenario(scenarioId);
          break;
        case 'download':
          this.downloadScenario(scenarioId);
          break;
        case 'delete':
          this.deleteScenario(scenarioId);
          break;
      }
    });
  },

  /**
   * Load a scenario
   */
  loadScenario(scenarioId) {
    const scenario = Storage.loadScenario(scenarioId);
    if (!scenario) {
      alert('Error loading scenario');
      return;
    }

    // Set as current scenario
    Storage.setCurrentScenario(scenarioId);

    // Load scenario data into app
    if (window.app && window.app.loadScenario) {
      window.app.loadScenario(scenario);
      console.log('Loaded scenario:', scenario.name);

      // Switch to dashboard tab
      const dashboardTab = document.querySelector('.tab-button[data-tab="dashboard"]');
      if (dashboardTab) {
        dashboardTab.click();
      }

      // Refresh the list to update active indicator
      this.refreshScenarioList();
    }
  },

  /**
   * Copy (duplicate) a scenario
   */
  copyScenario(scenarioId) {
    const original = Storage.loadScenario(scenarioId);
    if (!original) {
      alert('Error loading scenario to copy');
      return;
    }

    // Check scenario limit
    const scenarios = Storage.getAllScenarios();
    if (scenarios.length >= this.MAX_SCENARIOS) {
      alert(`Cannot create more scenarios. Maximum limit is ${this.MAX_SCENARIOS} scenarios.\n\nPlease delete some scenarios first.`);
      return;
    }

    // Create copy with new ID and name
    const copyData = original.toJSON();
    copyData.id = 'scenario-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    copyData.name = original.name + ' (Copy)';
    copyData.created = new Date().toISOString();
    copyData.lastModified = new Date().toISOString();

    const copy = Scenario.fromJSON(copyData);

    // Save the copy
    if (Storage.saveScenario(copy)) {
      console.log('Scenario copied:', copy.name);
      this.refreshScenarioList();

      // Highlight the new copy
      setTimeout(() => {
        const row = document.querySelector(`[data-scenario-id="${copy.id}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('highlight-flash');
          setTimeout(() => row.classList.remove('highlight-flash'), 2000);
        }
      }, 100);
    } else {
      alert('Error saving scenario copy');
    }
  },

  /**
   * Download a scenario as JSON file
   */
  downloadScenario(scenarioId) {
    const scenario = Storage.loadScenario(scenarioId);
    if (!scenario) {
      alert('Error loading scenario to download');
      return;
    }

    const json = Storage.exportScenario(scenario);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Scenario downloaded:', scenario.name);
  },

  /**
   * Delete a scenario
   */
  deleteScenario(scenarioId) {
    const scenario = Storage.loadScenario(scenarioId);
    if (!scenario) {
      alert('Error loading scenario to delete');
      return;
    }

    const confirmMsg = `Are you sure you want to delete "${scenario.name}"?\n\nThis action cannot be undone.`;
    if (!confirm(confirmMsg)) {
      return;
    }

    if (Storage.deleteScenario(scenarioId)) {
      console.log('Scenario deleted:', scenario.name);

      // If deleted scenario was current, clear current
      if (Storage.getCurrentScenarioId() === scenarioId) {
        Storage.setCurrentScenario(null);

        // Clear the app if available
        if (window.app && window.app.clearScenario) {
          window.app.clearScenario();
        }
      }

      this.refreshScenarioList();
    } else {
      alert('Error deleting scenario');
    }
  },

  /**
   * Delete all scenarios (with confirmation)
   */
  deleteAllScenarios() {
    const scenarios = Storage.getAllScenarios();
    const confirmMsg = `⚠️ DELETE ALL SCENARIOS?\n\nThis will permanently delete all ${scenarios.length} saved scenarios.\n\nThis action CANNOT be undone!\n\nType "DELETE ALL" to confirm:`;

    const userInput = prompt(confirmMsg);
    if (userInput !== 'DELETE ALL') {
      return;
    }

    if (Storage.clearAllScenarios()) {
      console.log('All scenarios deleted');

      // Clear the app if available
      if (window.app && window.app.clearScenario) {
        window.app.clearScenario();
      }

      this.refreshScenarioList();
      alert('All scenarios have been deleted.');
    } else {
      alert('Error deleting scenarios');
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ScenarioManager.init());
} else {
  ScenarioManager.init();
}

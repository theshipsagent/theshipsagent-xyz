/**
 * LocalStorage Management for Ship Agency Financial Model
 * Save and load scenarios, handle data persistence
 */

const Storage = {
  STORAGE_KEY: 'shipAgencyScenarios',
  CURRENT_SCENARIO_KEY: 'shipAgencyCurrentScenario',

  /**
   * Save a scenario to localStorage
   * @param {Scenario} scenario - Scenario to save
   * @returns {boolean} Success status
   */
  saveScenario(scenario) {
    try {
      const scenarios = this.getAllScenarios();

      // Check if scenario already exists (update)
      const existingIndex = scenarios.findIndex(s => s.id === scenario.id);

      if (existingIndex >= 0) {
        scenarios[existingIndex] = scenario.toJSON();
      } else {
        scenarios.push(scenario.toJSON());
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));
      console.log('Scenario saved:', scenario.name);
      return true;
    } catch (error) {
      console.error('Error saving scenario:', error);
      return false;
    }
  },

  /**
   * Load a specific scenario from localStorage
   * @param {string} scenarioId - Scenario ID to load
   * @returns {Scenario|null} Scenario object or null if not found
   */
  loadScenario(scenarioId) {
    try {
      const scenarios = this.getAllScenarios();
      const scenarioData = scenarios.find(s => s.id === scenarioId);

      if (scenarioData) {
        return Scenario.fromJSON(scenarioData);
      }
      return null;
    } catch (error) {
      console.error('Error loading scenario:', error);
      return null;
    }
  },

  /**
   * Get all scenarios from localStorage
   * @returns {Array} Array of scenario JSON objects
   */
  getAllScenarios() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scenarios:', error);
      return [];
    }
  },

  /**
   * Get all scenario metadata (id, name, modelType, dates)
   * @returns {Array} Array of scenario metadata
   */
  getScenarioList() {
    const scenarios = this.getAllScenarios();
    return scenarios.map(s => ({
      id: s.id,
      name: s.name,
      modelType: s.modelType,
      created: s.created,
      lastModified: s.lastModified
    }));
  },

  /**
   * Delete a scenario from localStorage
   * @param {string} scenarioId - Scenario ID to delete
   * @returns {boolean} Success status
   */
  deleteScenario(scenarioId) {
    try {
      const scenarios = this.getAllScenarios();
      const filtered = scenarios.filter(s => s.id !== scenarioId);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('Scenario deleted:', scenarioId);
      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      return false;
    }
  },

  /**
   * Save current scenario ID
   * @param {string} scenarioId - Current scenario ID
   */
  setCurrentScenario(scenarioId) {
    try {
      localStorage.setItem(this.CURRENT_SCENARIO_KEY, scenarioId);
    } catch (error) {
      console.error('Error setting current scenario:', error);
    }
  },

  /**
   * Get current scenario ID
   * @returns {string|null} Current scenario ID or null
   */
  getCurrentScenarioId() {
    try {
      return localStorage.getItem(this.CURRENT_SCENARIO_KEY);
    } catch (error) {
      console.error('Error getting current scenario:', error);
      return null;
    }
  },

  /**
   * Load current scenario
   * @returns {Scenario|null} Current scenario or null
   */
  loadCurrentScenario() {
    const scenarioId = this.getCurrentScenarioId();
    if (scenarioId) {
      return this.loadScenario(scenarioId);
    }
    return null;
  },

  /**
   * Export scenario as JSON file
   * @param {Scenario} scenario - Scenario to export
   * @returns {string} JSON string
   */
  exportScenario(scenario) {
    return JSON.stringify(scenario.toJSON(), null, 2);
  },

  /**
   * Import scenario from JSON string
   * @param {string} jsonString - JSON string
   * @returns {Scenario|null} Imported scenario or null if invalid
   */
  importScenario(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Validate required fields
      if (!data.name || !data.modelType || !data.locations) {
        throw new Error('Invalid scenario JSON');
      }

      // Generate new ID for imported scenario
      data.id = 'scenario-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      data.created = new Date().toISOString();
      data.lastModified = new Date().toISOString();

      return Scenario.fromJSON(data);
    } catch (error) {
      console.error('Error importing scenario:', error);
      return null;
    }
  },

  /**
   * Clear all scenarios from localStorage (with confirmation)
   * @returns {boolean} Success status
   */
  clearAllScenarios() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.CURRENT_SCENARIO_KEY);
      console.log('All scenarios cleared');
      return true;
    } catch (error) {
      console.error('Error clearing scenarios:', error);
      return false;
    }
  },

  /**
   * Get storage usage info
   * @returns {Object} Storage info
   */
  getStorageInfo() {
    try {
      const scenarios = this.getAllScenarios();
      const jsonString = localStorage.getItem(this.STORAGE_KEY) || '';
      const sizeBytes = new Blob([jsonString]).size;
      const sizeKB = (sizeBytes / 1024).toFixed(2);

      return {
        scenarioCount: scenarios.length,
        sizeBytes,
        sizeKB,
        estimatedLimit: '5-10 MB (browser dependent)'
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        scenarioCount: 0,
        sizeBytes: 0,
        sizeKB: '0',
        estimatedLimit: 'Unknown'
      };
    }
  },

  /**
   * Check if localStorage is available
   * @returns {boolean} Availability status
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Storage };
}

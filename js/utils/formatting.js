/**
 * Formatting Utilities for Ship Agency Financial Model
 * Currency, percentage, and number formatting
 */

const Formatter = {
  /**
   * Format number as currency (USD)
   * @param {number} amount - Dollar amount
   * @param {number} decimals - Number of decimal places (default: 0)
   * @returns {string} Formatted currency string
   */
  currency(amount, decimals = 0) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0';
    }
    return '$' + this.number(amount, decimals);
  },

  /**
   * Format number with thousands separators
   * @param {number} num - Number to format
   * @param {number} decimals - Number of decimal places (default: 0)
   * @returns {string} Formatted number string
   */
  number(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Format number as percentage
   * @param {number} value - Percentage value (e.g., 25.5 for 25.5%)
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {string} Formatted percentage string
   */
  percent(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.0%';
    }
    return value.toFixed(decimals) + '%';
  },

  /**
   * Format delta (difference) with +/- sign and color class
   * @param {number} delta - Delta value
   * @param {boolean} isCurrency - Whether to format as currency (default: true)
   * @param {number} decimals - Number of decimal places (default: 0)
   * @returns {Object} { text, className }
   */
  delta(delta, isCurrency = true, decimals = 0) {
    if (delta === null || delta === undefined || isNaN(delta)) {
      delta = 0;
    }

    const sign = delta >= 0 ? '+' : '';
    const text = isCurrency
      ? sign + this.currency(delta, decimals)
      : sign + this.number(delta, decimals);

    // For costs, negative is good (savings)
    // For revenue, positive is good (increase)
    const className = delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : 'delta-neutral';

    return { text, className, value: delta };
  },

  /**
   * Format percent change with +/- sign and color class
   * @param {number} percentChange - Percent change value
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {Object} { text, className }
   */
  percentChange(percentChange, decimals = 1) {
    if (percentChange === null || percentChange === undefined || isNaN(percentChange)) {
      percentChange = 0;
    }

    const sign = percentChange >= 0 ? '+' : '';
    const text = sign + percentChange.toFixed(decimals) + '%';

    const className = percentChange > 0 ? 'delta-positive' : percentChange < 0 ? 'delta-negative' : 'delta-neutral';

    return { text, className, value: percentChange };
  },

  /**
   * Format large currency amounts with K/M suffixes
   * @param {number} amount - Dollar amount
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {string} Formatted currency string with suffix
   */
  currencyShort(amount, decimals = 1) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0';
    }

    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 1000000) {
      return sign + '$' + (absAmount / 1000000).toFixed(decimals) + 'M';
    } else if (absAmount >= 1000) {
      return sign + '$' + (absAmount / 1000).toFixed(decimals) + 'K';
    } else {
      return sign + '$' + absAmount.toFixed(decimals);
    }
  },

  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  date(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format date and time to readable string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date/time string
   */
  datetime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Truncate text to max length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length (default: 50)
   * @returns {string} Truncated text
   */
  truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  /**
   * Format input value for editing (remove formatting)
   * @param {string} formattedValue - Formatted value string
   * @returns {number} Numeric value
   */
  unformat(formattedValue) {
    if (!formattedValue) return 0;
    // Remove currency symbols, commas, percent signs
    const cleaned = formattedValue.toString().replace(/[$,%]/g, '').replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Format scenario name for display
   * @param {string} name - Scenario name
   * @param {string} modelType - Model type ('traditional' or 'ai-enabled')
   * @returns {string} Formatted name with model type badge
   */
  scenarioName(name, modelType) {
    const badge = modelType === 'ai-enabled' ? '[AI]' : '[Traditional]';
    return `${name} ${badge}`;
  },

  /**
   * Format hourly rate (always with 2 decimal places)
   * @param {number} rate - Hourly rate
   * @returns {string} Formatted hourly rate string
   */
  hourlyRate(rate) {
    if (rate === null || rate === undefined || isNaN(rate)) {
      return '$0.00';
    }
    return '$' + rate.toFixed(2);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Formatter };
}

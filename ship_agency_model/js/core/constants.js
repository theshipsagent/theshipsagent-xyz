/**
 * Constants for Ship Agency Financial Model
 * Default values for ship types, positions, and overhead categories
 */

// Ship types with default agency fees and funds per call values
const SHIP_TYPES = [
  { type: 'Break-bulk', feePerCall: 4500, fundsPerCall: 15000 },
  { type: 'Coal', feePerCall: 9800, fundsPerCall: 100000 },
  { type: 'Petcoke', feePerCall: 10500, fundsPerCall: 100000 },
  { type: 'Grain', feePerCall: 12000, fundsPerCall: 135000 },
  { type: 'Cement', feePerCall: 10500, fundsPerCall: 75000 },
  { type: 'Fertilizer', feePerCall: 10500, fundsPerCall: 120000 },
  { type: 'Misc Bulk', feePerCall: 9500, fundsPerCall: 54000 },
  { type: 'Belt Ship Bulkers', feePerCall: 3500, fundsPerCall: 12000 },
  { type: 'Cruise Ships', feePerCall: 1500, fundsPerCall: 12000 },
  { type: 'Container', feePerCall: 500, fundsPerCall: 5000 },
  { type: 'RoRo', feePerCall: 750, fundsPerCall: 5000 },
  { type: 'Misc Port Calls', feePerCall: 1500, fundsPerCall: 25000 },
  { type: 'Parcel Tanker', feePerCall: 3750, fundsPerCall: 25000 },
  { type: 'Gas Carrier', feePerCall: 3750, fundsPerCall: 25000 },
  { type: 'LNG Carrier', feePerCall: 4500, fundsPerCall: 35000 },
  { type: 'Product Tankers', feePerCall: 3500, fundsPerCall: 35000 },
  { type: 'Crude Tankers', feePerCall: 4000, fundsPerCall: 35000 }
];

// Corporate staff positions with salary ranges and defaults
const CORPORATE_POSITIONS = [
  { position: 'CEO/President', salaryMin: 225000, salaryMax: 500000, salaryDefault: 350000 },
  { position: 'CFO', salaryMin: 275000, salaryMax: 275000, salaryDefault: 275000 },
  { position: 'Controller', salaryMin: 165000, salaryMax: 165000, salaryDefault: 165000 },
  { position: 'VP Ops', salaryMin: 225000, salaryMax: 225000, salaryDefault: 225000 },
  { position: 'VP Commercial', salaryMin: 225000, salaryMax: 225000, salaryDefault: 225000 },
  { position: 'Commercial Manager', salaryMin: 125000, salaryMax: 175000, salaryDefault: 150000 },
  { position: 'Executive Admin', salaryMin: 90000, salaryMax: 90000, salaryDefault: 90000 },
  { position: 'Marketing Manager', salaryMin: 175000, salaryMax: 175000, salaryDefault: 175000 },
  { position: 'HR Manager', salaryMin: 200000, salaryMax: 200000, salaryDefault: 200000 },
  { position: 'HR Clerk/Payroll', salaryMin: 85000, salaryMax: 85000, salaryDefault: 85000 },
  { position: 'IT Manager', salaryMin: 175000, salaryMax: 175000, salaryDefault: 175000 },
  { position: 'Desktop Support', salaryMin: 95000, salaryMax: 95000, salaryDefault: 95000 },
  { position: 'Accounting Manager', salaryMin: 125000, salaryMax: 125000, salaryDefault: 125000 },
  { position: 'Accounting Supervisor', salaryMin: 80000, salaryMax: 80000, salaryDefault: 80000 },
  { position: 'Accounting Clerk', salaryMin: 65000, salaryMax: 65000, salaryDefault: 65000 },
  { position: 'Documentation Manager', salaryMin: 95000, salaryMax: 95000, salaryDefault: 95000 },
  { position: 'Document Clerk', salaryMin: 65000, salaryMax: 65000, salaryDefault: 65000 }
];

// Port operations staff positions with salary ranges and defaults
const PORT_POSITIONS = [
  { position: 'Regional Manager Ops', salaryMin: 125000, salaryMax: 175000, salaryDefault: 150000 },
  { position: 'Port Ops Manager', salaryMin: 120000, salaryMax: 165000, salaryDefault: 142500 },
  { position: 'Asst Ops Manager', salaryMin: 95000, salaryMax: 120000, salaryDefault: 107500 },
  { position: 'Ship Agent', salaryMin: 95000, salaryMax: 120000, salaryDefault: 107500 },
  { position: 'Boarding Agent/Runner', salaryMin: 65000, salaryMax: 95000, salaryDefault: 80000 },
  { position: 'Ops Admin Clerk', salaryMin: 65000, salaryMax: 65000, salaryDefault: 65000 }
];

// Overhead categories with default values
const OVERHEAD_CATEGORIES = {
  officeSpace: {
    label: 'Office Space (sqft)',
    minSqft: 2500,
    costPerSqftMin: 15,
    costPerSqftMax: 25,
    defaultCostPerSqft: 20
  },
  insurance: {
    longshoremen: { label: 'Longshoremen & Harbor Worker Insurance', default: 25000 },
    errorsOmissions: { label: 'Errors & Omissions Insurance', default: 50000 },
    generalLiability: { label: 'General Liability Insurance', default: 15000 }
  },
  technology: {
    office365: { label: 'Office 365/Azure', default: 3600 },
    erpNetSuite: { label: 'ERP (Oracle NetSuite)', default: 50000, isEnterprise: true },
    crmDynamics: { label: 'CRM (MS Dynamics)', default: 12000 },
    specializedSaaS: { label: 'Specialized SaaS (Sedna, Marcura)', default: 30000 }
  },
  regulatory: {
    customsBond: { label: 'Type 3 US Customs Carrier Bond', default: 15000 },
    fmcLicensing: { label: 'FMC Licensing', default: 5000 }
  },
  other: {
    vehicleMaintenance: { label: 'Company Vehicles M&R', default: 12000 }
  }
};

// Global benefit assumptions
const GLOBAL_ASSUMPTIONS = {
  healthInsurancePerEmployee: 15000,
  retirement401kPercent: 4,
  husbandryMarginPercent: 9,
  commissionMarginPercent: 1.5
};

// AI reduction factors (applied to AI-enabled model)
const AI_REDUCTION_FACTORS = {
  documentationStaff: 0.60,  // 60% reduction
  accountingClerks: 0.50,     // 50% reduction
  opsAdminClerks: 0.70,       // 70% reduction
  technologyIncrease: 150000  // +$150K for AI systems
};

// Predefined locations (13 total: HQ + 12 port offices)
const PREDEFINED_LOCATIONS = [
  { id: 'houston-hq', name: 'Houston', type: 'hq', state: 'TX' },
  { id: 'new-york', name: 'New York', type: 'port-office', state: 'NY' },
  { id: 'philadelphia', name: 'Philadelphia', type: 'port-office', state: 'PA' },
  { id: 'norfolk', name: 'Norfolk', type: 'port-office', state: 'VA' },
  { id: 'savannah', name: 'Savannah', type: 'port-office', state: 'GA' },
  { id: 'jacksonville', name: 'Jacksonville', type: 'port-office', state: 'FL' },
  { id: 'port-everglades', name: 'Port Everglades', type: 'port-office', state: 'FL' },
  { id: 'tampa', name: 'Tampa', type: 'port-office', state: 'FL' },
  { id: 'mobile', name: 'Mobile', type: 'port-office', state: 'AL' },
  { id: 'new-orleans', name: 'New Orleans', type: 'port-office', state: 'LA' },
  { id: 'long-beach', name: 'Long Beach', type: 'port-office', state: 'CA' },
  { id: 'portland', name: 'Portland', type: 'port-office', state: 'OR' }
];

// Export constants for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS
  module.exports = {
    SHIP_TYPES,
    CORPORATE_POSITIONS,
    PORT_POSITIONS,
    OVERHEAD_CATEGORIES,
    GLOBAL_ASSUMPTIONS,
    AI_REDUCTION_FACTORS,
    PREDEFINED_LOCATIONS
  };
}

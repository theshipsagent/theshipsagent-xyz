# Ship Agency Financial Model

**Interactive HTML/JavaScript calculator comparing Traditional vs. AI-Enabled ship agency operations**

---

## Overview

This single-page web application allows ship agency operators to model their business financials under different scenarios:
- **Traditional Model:** Manual staffing and operations
- **AI-Enabled Model:** Automated operations with reduced staffing

### Core Business Model

Ship agency is a professional services business where **staffing represents 88% of overhead**. The key KPI is:

**Delta per Call = (Revenue per Call) - (Cost per Call)**

Revenue streams:
- Agency fees by ship type (17 types from Break-bulk to Crude Tankers)
- Husbandry revenue (8-10% margin on base fees)
- Commission revenue (1-2% on base + husbandry)
- Documentation fees

---

## Features

### ✅ MVP (Phase 1) - COMPLETED

**Core Functionality:**
- ✅ Dashboard with Traditional vs AI-Enabled side-by-side comparison
- ✅ Location manager (add/edit HQ and satellite offices)
- ✅ Staffing editor (add/remove corporate and port operations staff)
- ✅ Revenue modeling (port calls by ship type, husbandry, commission)
- ✅ Overhead management (office, insurance, technology, regulatory)
- ✅ Real-time financial calculations
- ✅ localStorage persistence
- ✅ Scenario save/load
- ✅ Delta analysis showing AI vs Traditional comparison
- ✅ JSON export for backup
- ✅ Sensitivity analysis with interactive sliders
- ✅ Tornado chart showing variable impact ranking
- ✅ Direct Delta per Call KPI (port operations)
- ✅ Variable costs per call (mileage, M&R)
- ✅ Inline editing for staff and ship types
- ✅ Office sqft auto-scaling by team size
- ✅ Class A vs Class B rent options
- ✅ Detailed G&A overhead categories
- ✅ Editable overhead line items (add/remove/edit custom items)
- ✅ Hourly wage support with OT calculation (1.5x)
- ✅ Bonus percentage (default 10% annual)
- ✅ Workload analysis (calls per agent/month)
- ✅ Benchmark overhead defaults by company size (Small/Medium/Large)
- ✅ Organization chart visualizations (hierarchical & functional views)
- ✅ Scenario comparison (side-by-side analysis of 2-3 scenarios)

**Financial Calculations:**
- Base agency fees: Σ(calls × feePerType)
- Husbandry revenue: Base × 9%
- Commission revenue: (Base + Husbandry) × 1.5%
- Staff compensation:
  - Salaried: Annual salary × (1 + bonus%)
  - Hourly: (Hourly rate × 2080 hours) + (Hourly rate × 1.5 × OT hours) × (1 + bonus%)
- Total costs: Payroll + Benefits (4% 401k + $15K health/employee) + Overhead + Variable costs
- Key KPIs: Direct Delta/Call, Total Delta/Call, EBITDA, EBITDA Margin, Break-Even Calls

**AI Reduction Model:**
- Documentation staff: -60%
- Accounting clerks: -50%
- Ops admin clerks: -70%
- Technology overhead: +$150K (AI systems)

---

## File Structure

```
ship_agency_model/
├── index.html              # Main application
├── README.md               # This file
│
├── css/
│   └── model-styles.css    # Blue theme styling (#0d3b66)
│
├── js/
│   ├── core/
│   │   ├── constants.js    # Ship types, positions, defaults
│   │   ├── data-model.js   # Location and Scenario classes
│   │   └── calculations.js # Financial calculation engine
│   │
│   ├── ui/
│   │   ├── dashboard.js    # Dashboard rendering
│   │   └── location-editor.js # Location editor
│   │
│   ├── utils/
│   │   ├── formatting.js   # Currency/number formatting
│   │   └── storage.js      # localStorage management
│   │
│   └── app.js              # Main application controller
│
├── data/
│   ├── defaults.json       # Default location templates
│   └── examples/
│       ├── traditional-example.json  # (To be created)
│       └── ai-enabled-example.json   # (To be created)
│
└── lib/
    ├── chart.min.js        # Chart.js (CDN)
    └── xlsx.full.min.js    # SheetJS (CDN)
```

---

## Getting Started

### 1. Open the Application

Open `index.html` in a web browser (Chrome, Firefox, Edge recommended).

### 2. Create Your First Scenario

**Option A: Load Example Scenario**
- Click "Load Example" button
- Pre-configured Houston HQ with realistic staffing and revenue

**Option B: Create New Scenario**
1. Click "New Scenario"
2. Enter scenario name
3. Choose model type (Traditional or AI-Enabled)
4. Click "Add HQ" in Locations tab
5. Add staff, ship types, and configure overhead

### 3. Compare Traditional vs AI

The dashboard automatically:
- Displays Traditional model in left column
- Generates AI-Enabled model in right column (with automatic staffing reductions)
- Shows delta analysis at the bottom

### 4. Edit Locations

**Locations Tab:**
- Add HQ (corporate + port operations)
- Add satellite offices (port operations only)
- Edit staffing, revenue, overhead for each location
- Toggle locations active/inactive

**Location Editor:**
- General info (name, state, type)
- Corporate staff (CEO, CFO, accounting, documentation, etc.)
- Port operations staff (managers, agents, clerks)
- Revenue (port calls by ship type, husbandry, commission)
- Overhead (office space, insurance, technology, regulatory)

### 5. Save Your Work

- Click "Save" to store scenario in browser localStorage
- Select saved scenarios from dropdown
- Click "Export" to download JSON backup

---

## Usage Guide

### Adding Staff

1. Navigate to Locations tab
2. Select a location
3. Click "Add Corporate Staff" or "Add Port Staff"
4. Enter position, salary, count
5. Dashboard updates automatically

**Default Positions:**

*Corporate Staff:*
- CEO/President: $350K
- CFO: $275K
- Controller: $165K
- VP Ops: $225K
- VP Commercial: $225K
- Accounting Manager: $125K
- Accounting Clerk: $65K (×2)
- Documentation Manager: $95K
- Document Clerk: $65K (×2)

*Port Operations Staff:*
- Port Ops Manager: $142.5K
- Asst Ops Manager: $107.5K
- Ship Agent: $107.5K (×3)
- Boarding Agent: $80K (×2)
- Ops Admin Clerk: $65K (×2)

### Adding Ship Types

1. Select location
2. Click "Add Ship Type"
3. Enter ship type, calls per year, fee per call
4. Dashboard recalculates revenue

**Ship Types & Default Fees:**
- Grain: $12,000/call
- Coal: $9,800/call
- Container: $500/call
- Crude Tankers: $4,000/call
- LNG Carrier: $4,500/call
- Break-bulk: $4,500/call
- (11 more types available)

### Understanding the Dashboard

**Hero Metric: Direct Delta per Call**
- Primary KPI showing port-level profitability per call
- Direct costs only (port payroll, port benefits, variable costs)
- Green = profitable, Red = losing money
- Cross-reference: Total Delta per Call (includes corporate overhead)

**Key Metrics Cards:**
- Total Revenue (all locations, all ship types)
- Total Costs (payroll + benefits + overhead)
- EBITDA (earnings before interest, taxes, depreciation, amortization)
- Break-Even Calls (calls needed to cover overhead)

**Delta Analysis:**
- Cost Savings (AI vs Traditional)
- Employee Reduction (automation impact)
- Delta per Call Improvement
- EBITDA Improvement

### Using Sensitivity Analysis

**Navigate to Sensitivity Analysis tab to perform what-if scenarios:**

1. **Interactive Sliders** (±20% range):
   - Port Call Volume: Test impact of volume changes
   - Average Fee per Call: Test pricing scenarios
   - Payroll Costs: Model wage increases/decreases
   - Overhead Costs: Test expense management scenarios

2. **Real-Time Results**:
   - Comparison table showing Baseline vs Adjusted
   - Impact on key metrics (EBITDA, Delta/Call, Break-Even)
   - Percentage changes color-coded (green = improvement, red = decline)

3. **Tornado Chart**:
   - Shows which variables have the most impact on EBITDA
   - Ranks variables by total impact at ±20% change
   - Helps prioritize what to focus on

4. **Save Adjusted Scenario**:
   - Click "Save as New Scenario" to preserve sensitivity results
   - Creates new scenario you can compare later
   - Useful for planning different business cases

**Example Use Cases:**
- "What if we lose 10% of our port calls?"
- "Can we afford a 15% wage increase?"
- "What happens if we reduce overhead by 10%?"
- "How much revenue increase do we need to offset a cost increase?"

### Using Workload Analysis

**Navigate to Locations tab → Select a location to view workload metrics:**

The workload analysis card shows:
- **Monthly Calls (avg)**: Total annual calls ÷ 12
- **Agent Capacity**: Total FTE (Ship Agents 100%, Ops Managers 50%)
- **Calls per Agent/Month**: Industry benchmark indicator
- **Status**: Color-coded workload assessment
  - Green (Optimal): 20-30 calls/agent/month
  - Yellow (Underutilized): <20 calls/agent/month
  - Yellow (High): 30-40 calls/agent/month
  - Red (Overworked): >40 calls/agent/month

**Using the Insights:**
- If underutilized → Can take on more business or reduce staff
- If optimal → Perfect staffing level
- If high/overworked → Need to hire additional agents or reduce calls

### Managing Overhead Line Items

**Add Custom Overhead Items:**
1. Navigate to Locations tab → Select a location
2. Scroll to G&A Overhead Categories
3. Click "+ Add Item" button next to any category
4. Enter item name (e.g., "Software Subscriptions")
5. Enter annual amount
6. Item appears with edit and remove (×) buttons

**Edit Overhead Items:**
- Each overhead item has an editable input field
- Changes auto-save and recalculate dashboard in real-time

**Remove Overhead Items:**
- Click the "×" button next to any line item
- Confirm deletion
- Item removed and totals updated

**Apply Benchmark Defaults:**
1. Navigate to G&A Overhead section
2. See current employee count and tier (Small/Medium/Large)
3. Click "Apply Defaults" button
4. Confirm to replace all overhead values with industry benchmarks
5. Benchmarks scale by company size:
   - Small (1-10 employees): Lower costs, no ERP
   - Medium (11-50 employees): Standard costs, full ERP/CRM
   - Large (51-125 employees): Higher absolute costs, volume discounts on insurance

### Working with Hourly Staff

**Hourly positions auto-detected:**
- Boarding Agent / Runner
- Ops Admin Clerk
- Accounting Clerk
- Document Clerk
- HR Clerk / Payroll

**Staff table shows:**
- **Type**: Badge showing "Hourly" (blue) or "Salary" (gray)
- **Base Rate**: Hourly rate ($/hour) or annual salary
- **OT Hrs**: Annual overtime hours (only for hourly staff, calculated at 1.5x)
- **Bonus %**: Annual bonus percentage (default 10%)
- **Count**: Number of employees in this position
- **Total Comp**: Auto-calculated total compensation

**Compensation Formulas:**
- Hourly: `[(Hourly Rate × 2080) + (Hourly Rate × 1.5 × OT Hours)] × (1 + Bonus%) × Count`
- Salary: `Annual Salary × (1 + Bonus%) × Count`

**Benefits calculated separately:**
- 401k: 4% of total compensation
- Health insurance: $15,000 per employee
- Total benefits = 401k + health insurance

### Viewing Organization Charts

**Navigate to Locations tab → Select a location → Scroll to Organization Chart section**

The org chart automatically analyzes your staffing structure and displays it in two views:

**1. Hierarchical View:**
- Shows reporting structure by organizational levels:
  - Level 0: Executive (CEO, President)
  - Level 1: C-Suite (CFO, VPs)
  - Level 2: Directors & VPs (Controller, Regional Managers, Department Heads)
  - Level 3: Managers (Port Ops Manager, Accounting Manager, etc.)
  - Level 4: Supervisors & Assistant Managers
  - Level 5: Agents (Ship Agents)
  - Level 6: Clerks & Staff (Admin, Documentation, Boarding Agents)
- Each position card shows:
  - Position title
  - Function (color-coded badge)
  - Headcount
  - Salary
- Color-coded by function for easy identification

**2. Functional View:**
- Groups staff by department/function:
  - Executive
  - Finance (Accounting, Controller)
  - Operations (Port Ops, Ship Agents, Documentation)
  - Commercial (Sales, Marketing)
  - IT (Technology, Desktop Support)
  - HR (Human Resources, Payroll)
- Shows total headcount and payroll per function
- Lists all positions within each function

**Function Color Codes:**
- Executive: Dark Blue (#003366)
- Finance: Blue (#0070C0)
- Operations: Navy (#0d3b66)
- Commercial: Green (#00A86B)
- IT: Purple (#6A5ACD)
- HR: Red (#DC143C)

**Organizational Summary:**
- Total Positions: Unique job titles
- Total Headcount: Sum of all employees (counts multiples)
- Functions: Number of functional departments

**Toggle Between Views:**
- Click "Hierarchical View" button to see reporting structure
- Click "Functional View" button to see departmental grouping
- Charts update instantly when you add/remove staff

### Comparing Scenarios

**Navigate to Compare Scenarios tab to analyze multiple scenarios side-by-side**

**How to Compare:**
1. Click **"Compare Scenarios"** tab
2. Select scenarios from dropdown menus:
   - Scenario 1: First scenario to compare (will be baseline for delta calculations)
   - Scenario 2: Second scenario to compare
   - Scenario 3: Optional third scenario
3. Click **"Compare"** button
4. View comprehensive comparison results

**Comparison Features:**

**1. Scenario Header:**
- Shows name, model type (Traditional/AI-Enabled), location count, last modified date
- Quick visual summary of each scenario

**2. Key Metrics Comparison:**
- All major KPIs side-by-side
- **Best** column highlights which scenario wins for each metric
- Metrics include:
  - Total Revenue / Total Costs / EBITDA
  - EBITDA Margin
  - Total Calls / Revenue per Call
  - Total Cost per Call / Total Delta per Call
  - Direct Cost per Call / Direct Delta per Call (KEY KPI)
  - Break-Even Calls

**3. Revenue Breakdown:**
- Base Agency Fees
- Husbandry Revenue
- Commission Revenue
- Documentation Fees
- Total Revenue

**4. Cost Breakdown:**
- Corporate Payroll
- Port Payroll
- Benefits (401k + Health Insurance)
- Total Overhead
- Variable Costs
- Total Costs

**5. KPI Comparison with Deltas:**
- Uses Scenario 1 as baseline
- Shows absolute values for each scenario
- Displays delta (difference) from baseline
- Shows percentage change
- Color-coded: Green (improvement), Red (decline)
- Example: If Scenario 2 has higher EBITDA, shows "+$500K (+25%)" in green

**6. Location Comparison:**
- Lists all locations across all scenarios
- Shows staff count and annual calls for each location
- Indicates if a location doesn't exist in a scenario with "—"

**7. Best-in-Class Summary:**
- Automatically identifies best scenario for each key metric:
  - Highest Revenue
  - Lowest Costs
  - Highest EBITDA
  - Best EBITDA Margin
  - Best Delta per Call
  - Most Efficient (Lowest Break-Even)
- Shows winning scenario name and value for each metric

**Example Use Cases:**
- Compare Traditional vs AI-Enabled models
- Evaluate impact of opening new satellite offices
- Test different staffing strategies
- Compare pricing scenarios (different fee structures)
- Analyze expansion vs consolidation strategies

**Tips:**
- Save multiple scenarios before comparing (use "Save" button on Dashboard)
- Try comparing 3 scenarios: Current State, Optimistic Growth, Conservative Growth
- Use comparison to present business cases to stakeholders
- Export scenarios as JSON for backup before major changes

---

## Planned Features (Phase 2 & 3)

### Phase 2 - Enhanced Features ✅ COMPLETE
- [x] Sensitivity Analysis tab (working sliders for what-if scenarios) - **COMPLETED**
- [x] Tornado chart (sensitivity ranking) - **COMPLETED**
- [x] Hourly wage support with OT calculation - **COMPLETED**
- [x] Bonus percentage tracking - **COMPLETED**
- [x] Workload analysis calculator - **COMPLETED**
- [x] Benchmark overhead defaults by company size - **COMPLETED**
- [x] Editable overhead line items (add/remove/edit) - **COMPLETED**
- [x] Org chart visualizations (hierarchical & functional views) - **COMPLETED**
- [x] Compare Scenarios tab (side-by-side comparison of 2-3 scenarios) - **COMPLETED**
- [ ] Excel export (multi-sheet workbook with SheetJS)
- [ ] Additional Charts (Chart.js visualizations)
  - Revenue & Cost breakdown
  - Delta per Call comparison
  - Break-even analysis chart

### Phase 3 - Advanced Features
- [ ] Growth tipping point calculator
- [ ] Audit report generation (print-ready HTML)
- [ ] Data validation and error checking
- [ ] Example scenarios (pre-built JSON files)

---

## Technical Details

### Data Model

**Location Object:**
```javascript
{
  id, name, type, state, active,
  corporateStaff: [{ position, salary, count }],
  portStaff: [{ position, salary, count }],
  revenue: {
    shipTypes: [{ type, calls, feePerCall, cashFlowPerCall }],
    husbandry: { enabled, marginPercent },
    commission: { enabled, marginPercent },
    documentation: { manualAmount }
  },
  overhead: {
    officeSpace, insurance, technology, regulatory, other
  }
}
```

**Scenario Object:**
```javascript
{
  id, name, modelType, created, lastModified,
  locations: [Location],
  globalAssumptions: {
    healthInsurancePerEmployee: 15000,
    retirement401kPercent: 4,
    aiReductionFactors: { ... }
  },
  consolidated: { /* calculated financials */ }
}
```

### Calculations

All formulas are in `js/core/calculations.js`:

**Revenue:**
```
Base = Σ(calls × feePerType)
Husbandry = Base × 9%
Commission = (Base + Husbandry) × 1.5%
Total Revenue = Base + Husbandry + Commission + Documentation
```

**Costs:**
```
Payroll = Σ(salary × count)
401k = Payroll × 4%
Health Insurance = employeeCount × $15K
Benefits = 401k + Health Insurance
Overhead = office + insurance + tech + regulatory + other
Total Costs = Payroll + Benefits + Overhead
```

**KPIs:**
```
Revenue per Call = Total Revenue / Total Calls
Cost per Call = Total Costs / Total Calls
Delta per Call = Revenue per Call - Cost per Call
EBITDA = Total Revenue - Total Costs
EBITDA Margin = (EBITDA / Total Revenue) × 100
Break-Even Calls = Total Costs / Revenue per Call
```

### Browser Compatibility

Tested on:
- Chrome 120+
- Firefox 120+
- Edge 120+

Requires:
- localStorage support
- ES6 JavaScript (classes, arrow functions)
- Fetch API
- CSS Grid

### External Dependencies

Loaded from CDN:
- Chart.js 4.4.0 (for charts)
- SheetJS 0.20.1 (for Excel export)

No build process required - just open index.html!

---

## Development

### Adding New Features

1. **New Calculation:**
   - Add formula to `js/core/calculations.js`
   - Update `FinancialCalculator` class

2. **New UI Component:**
   - Create file in `js/ui/`
   - Add render methods
   - Call from `app.js`

3. **New Constants:**
   - Update `js/core/constants.js`
   - Export new constants

### Debugging

Open browser console (F12) to see:
- Initialization messages
- Scenario save/load confirmations
- Calculation results
- Error messages

### Data Persistence

Scenarios are saved to `localStorage` with keys:
- `shipAgencyScenarios`: Array of all scenarios
- `shipAgencyCurrentScenario`: ID of active scenario

To clear all data:
```javascript
Storage.clearAllScenarios();
```

To view storage info:
```javascript
Storage.getStorageInfo();
```

---

## Deployment

### GitHub Pages

1. Commit all files to repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch, root folder
4. URL: `https://theshipsagent.github.io/ship_agency_model/`

### Local Server

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# Then open: http://localhost:8000
```

---

## Credits

**Developed:** January 2, 2026
**Technology:** Vanilla JavaScript, HTML5, CSS3
**Styling:** Blue theme matching existing reports (#0d3b66)
**Libraries:** Chart.js, SheetJS

---

## License

Internal use only. Not for redistribution.

---

## Support

For questions or issues, refer to:
- Ship agency market analysis in `../ship_agency_market/`
- Plan document: `C:\Users\wsd3\.claude\plans\flickering-singing-key.md`

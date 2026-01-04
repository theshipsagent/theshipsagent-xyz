/**
 * Export utilities for Ship Agency Financial Model
 * Provides Excel and CSV export functionality using SheetJS with professional styling
 */

const ExportManager = {
  /**
   * Cell style definitions
   */
  styles: {
    // Title style (large, bold, blue background)
    title: {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0D3B66" } },
      alignment: { horizontal: "left", vertical: "center" }
    },

    // Section header (bold, light blue background)
    sectionHeader: {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0070C0" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    },

    // Table header (bold, gray background)
    tableHeader: {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    },

    // Location header (bold, teal background)
    locationHeader: {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "00B0F0" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    },

    // Data cell (normal, bordered)
    dataCell: {
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      }
    },

    // Currency cell (right-aligned, $ format, bordered)
    currency: {
      numFmt: "$#,##0.00",
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      }
    },

    // Number cell (right-aligned, comma format, bordered)
    number: {
      numFmt: "#,##0",
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      }
    },

    // Percent cell (right-aligned, % format, bordered)
    percent: {
      numFmt: "0.0%",
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D0D0D0" } },
        bottom: { style: "thin", color: { rgb: "D0D0D0" } },
        left: { style: "thin", color: { rgb: "D0D0D0" } },
        right: { style: "thin", color: { rgb: "D0D0D0" } }
      }
    },

    // Total row (bold, light yellow background)
    totalRow: {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFF2CC" } },
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    },

    // Info cell (light gray background)
    infoCell: {
      fill: { fgColor: { rgb: "F2F2F2" } },
      alignment: { horizontal: "left", vertical: "center" }
    }
  },

  /**
   * Apply style to a cell
   */
  applyCellStyle(ws, cellRef, style) {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = style;
  },

  /**
   * Apply style to a range of cells
   */
  applyRangeStyle(ws, startRow, startCol, endRow, endCol, style) {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        this.applyCellStyle(ws, cellRef, style);
      }
    }
  },

  /**
   * Export scenario to multi-sheet Excel workbook
   */
  exportToExcel(scenario, calculations) {
    // Use ExcelJS if available (supports styling)
    if (window.ExcelJS) {
      return this.exportToExcelStyled(scenario, calculations);
    }

    // Fallback to SheetJS (no styling)
    if (!window.XLSX) {
      console.error('Excel export library not loaded');
      alert('Excel export library not loaded. Please refresh the page.');
      return;
    }

    try {
      // Create new workbook
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "Ship Agency Financial Model",
        Subject: scenario.name,
        Author: "Ship Agency Financial Model",
        CreatedDate: new Date()
      };

      // Sheet 1: Dashboard Summary
      const dashboardSheet = this.createDashboardSheet(scenario, calculations);
      XLSX.utils.book_append_sheet(wb, dashboardSheet, 'Dashboard Summary');

      // Sheet 2: Staffing Detail
      const staffingSheet = this.createStaffingSheet(scenario);
      XLSX.utils.book_append_sheet(wb, staffingSheet, 'Staffing Detail');

      // Sheet 3: Revenue Detail
      const revenueSheet = this.createRevenueSheet(scenario, calculations);
      XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue Detail');

      // Sheet 4: Overhead Detail
      const overheadSheet = this.createOverheadSheet(scenario);
      XLSX.utils.book_append_sheet(wb, overheadSheet, 'Overhead Detail');

      // Sheet 5: Location Breakdown
      const locationSheet = this.createLocationSheet(scenario, calculations);
      XLSX.utils.book_append_sheet(wb, locationSheet, 'Location Breakdown');

      // Write file with cell styles
      const fileName = `${scenario.name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, fileName, { cellStyles: true, bookType: 'xlsx' });

      console.log(`Excel file exported: ${fileName}`);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  },

  /**
   * Create Dashboard Summary sheet
   */
  createDashboardSheet(scenario, calculations) {
    const data = [];
    let currentRow = 0;

    // Header
    data.push(['Ship Agency Financial Model - Dashboard Summary']);
    data.push(['Scenario:', scenario.name]);
    data.push(['Model Type:', scenario.modelType === 'traditional' ? 'Traditional' : 'AI-Enabled']);
    data.push(['Export Date:', new Date().toLocaleDateString()]);
    data.push([]);
    currentRow = 5;

    // Key Performance Indicators
    data.push(['KEY PERFORMANCE INDICATORS']);
    const kpiHeaderRow = currentRow;
    currentRow++;

    data.push(['Metric', 'Value', 'Unit']);
    const kpiTableHeaderRow = currentRow;
    currentRow++;

    data.push(['Total Port Calls', calculations.totalCalls, 'calls']);
    data.push(['Total Employees', calculations.totalEmployees, 'employees']);
    data.push(['Revenue per Call', calculations.revenuePerCall, '$/call']);
    data.push(['Cost per Call', calculations.costPerCall, '$/call']);
    data.push(['Delta per Call (Total)', calculations.deltaPerCall, '$/call']);
    data.push(['Direct Delta per Call (KEY KPI)', calculations.directDeltaPerCall || 0, '$/call']);
    const kpiLastRow = currentRow + 6;
    currentRow = kpiLastRow + 1;

    data.push([]);
    currentRow++;

    // Financial Summary
    data.push(['FINANCIAL SUMMARY']);
    const financialHeaderRow = currentRow;
    currentRow++;

    data.push(['Category', 'Amount']);
    const financialTableHeaderRow = currentRow;
    currentRow++;

    data.push(['Total Revenue', calculations.totalRevenue]);
    data.push(['Total Costs', calculations.totalCosts]);
    data.push(['  Payroll', calculations.totalPayroll]);
    data.push(['  Benefits', calculations.totalBenefits]);
    data.push(['  Overhead', calculations.totalOverhead]);
    data.push(['  Variable Costs', calculations.totalVariableCosts || 0]);
    data.push(['EBITDA', calculations.ebitda]);
    data.push(['EBITDA Margin (%)', calculations.ebitdaMargin / 100]);
    data.push(['Break-Even Calls', calculations.breakEvenCalls]);
    const financialLastRow = currentRow + 9;
    currentRow = financialLastRow + 1;

    data.push([]);
    currentRow++;

    // Assumptions
    data.push(['GLOBAL ASSUMPTIONS']);
    const assumptionsHeaderRow = currentRow;
    currentRow++;

    data.push(['Item', 'Value']);
    const assumptionsTableHeaderRow = currentRow;
    currentRow++;

    data.push(['Health Insurance per Employee', scenario.globalAssumptions.healthInsurancePerEmployee]);
    data.push(['401(k) Match (%)', scenario.globalAssumptions.retirement401kPercent / 100]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Apply styles
    // Title
    this.applyCellStyle(ws, 'A1', this.styles.title);

    // Info cells
    this.applyCellStyle(ws, 'A2', this.styles.infoCell);
    this.applyCellStyle(ws, 'B2', this.styles.dataCell);
    this.applyCellStyle(ws, 'A3', this.styles.infoCell);
    this.applyCellStyle(ws, 'B3', this.styles.dataCell);
    this.applyCellStyle(ws, 'A4', this.styles.infoCell);
    this.applyCellStyle(ws, 'B4', this.styles.dataCell);

    // KPI section header
    this.applyRangeStyle(ws, kpiHeaderRow, 0, kpiHeaderRow, 2, this.styles.sectionHeader);

    // KPI table headers
    this.applyRangeStyle(ws, kpiTableHeaderRow, 0, kpiTableHeaderRow, 2, this.styles.tableHeader);

    // KPI data rows
    for (let r = kpiTableHeaderRow + 1; r <= kpiLastRow; r++) {
      this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 0 }), this.styles.dataCell);
      this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 1 }), this.styles.currency);
      this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 2 }), this.styles.dataCell);
    }

    // Financial section header
    this.applyRangeStyle(ws, financialHeaderRow, 0, financialHeaderRow, 1, this.styles.sectionHeader);

    // Financial table headers
    this.applyRangeStyle(ws, financialTableHeaderRow, 0, financialTableHeaderRow, 1, this.styles.tableHeader);

    // Financial data rows
    for (let r = financialTableHeaderRow + 1; r <= financialLastRow; r++) {
      this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 0 }), this.styles.dataCell);

      // EBITDA Margin is a percentage
      if (r === financialLastRow - 1) {
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 1 }), this.styles.percent);
      } else if (r === financialLastRow) {
        // Break-even is a number
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 1 }), this.styles.number);
      } else {
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c: 1 }), this.styles.currency);
      }
    }

    // Assumptions section header
    this.applyRangeStyle(ws, assumptionsHeaderRow, 0, assumptionsHeaderRow, 1, this.styles.sectionHeader);

    // Assumptions table headers
    this.applyRangeStyle(ws, assumptionsTableHeaderRow, 0, assumptionsTableHeaderRow, 1, this.styles.tableHeader);

    // Assumptions data rows
    this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: assumptionsTableHeaderRow + 1, c: 0 }), this.styles.dataCell);
    this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: assumptionsTableHeaderRow + 1, c: 1 }), this.styles.currency);
    this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: assumptionsTableHeaderRow + 2, c: 0 }), this.styles.dataCell);
    this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: assumptionsTableHeaderRow + 2, c: 1 }), this.styles.percent);

    // Set column widths
    ws['!cols'] = [
      { wch: 35 },
      { wch: 18 },
      { wch: 15 }
    ];

    // Freeze first row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    return ws;
  },

  /**
   * Create Staffing Detail sheet
   */
  createStaffingSheet(scenario) {
    const data = [];
    let currentRow = 0;

    // Header
    data.push(['Ship Agency Financial Model - Staffing Detail']);
    data.push([]);
    currentRow = 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      data.push([`Location: ${location.name} (${location.type.toUpperCase()})`]);
      const locationHeaderRow = currentRow;
      currentRow++;

      data.push([]);
      currentRow++;

      // Corporate Staff
      if (location.corporateStaff && location.corporateStaff.length > 0) {
        data.push(['CORPORATE STAFF']);
        const corpSectionRow = currentRow;
        currentRow++;

        data.push(['Position', 'Type', 'Base Rate', 'Annual Hours', 'OT Hours', 'Bonus %', 'Count', 'Total Compensation']);
        const corpHeaderRow = currentRow;
        currentRow++;

        for (const staff of location.corporateStaff) {
          const totalComp = this.calculateStaffCompensation(staff);
          data.push([
            staff.position,
            staff.isHourly ? 'Hourly' : 'Salary',
            staff.salary,
            staff.annualHours || 2080,
            staff.overtimeHours || 0,
            (staff.bonusPercent || 0) / 100,
            staff.count,
            totalComp
          ]);
          currentRow++;
        }

        data.push([]);
        currentRow++;
      }

      // Port Staff
      if (location.portStaff && location.portStaff.length > 0) {
        data.push(['PORT OPERATIONS STAFF']);
        const portSectionRow = currentRow;
        currentRow++;

        data.push(['Position', 'Type', 'Base Rate', 'Annual Hours', 'OT Hours', 'Bonus %', 'Count', 'Total Compensation']);
        const portHeaderRow = currentRow;
        currentRow++;

        for (const staff of location.portStaff) {
          const totalComp = this.calculateStaffCompensation(staff);
          data.push([
            staff.position,
            staff.isHourly ? 'Hourly' : 'Salary',
            staff.salary,
            staff.annualHours || 2080,
            staff.overtimeHours || 0,
            (staff.bonusPercent || 0) / 100,
            staff.count,
            totalComp
          ]);
          currentRow++;
        }

        data.push([]);
        currentRow++;
      }

      data.push([]);
      currentRow++;
    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Apply styles to all rows
    currentRow = 0;

    // Title
    this.applyRangeStyle(ws, 0, 0, 0, 7, this.styles.title);
    currentRow = 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      this.applyRangeStyle(ws, currentRow, 0, currentRow, 7, this.styles.locationHeader);
      currentRow += 2;

      // Corporate Staff
      if (location.corporateStaff && location.corporateStaff.length > 0) {
        // Section header
        this.applyRangeStyle(ws, currentRow, 0, currentRow, 7, this.styles.sectionHeader);
        currentRow++;

        // Table header
        this.applyRangeStyle(ws, currentRow, 0, currentRow, 7, this.styles.tableHeader);
        currentRow++;

        // Data rows
        for (let i = 0; i < location.corporateStaff.length; i++) {
          for (let c = 0; c < 8; c++) {
            let style = this.styles.dataCell;
            if (c === 2 || c === 7) style = this.styles.currency; // Base Rate, Total Comp
            else if (c === 3 || c === 4 || c === 6) style = this.styles.number; // Hours, Count
            else if (c === 5) style = this.styles.percent; // Bonus %

            this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c }), style);
          }
          currentRow++;
        }
        currentRow++;
      }

      // Port Staff
      if (location.portStaff && location.portStaff.length > 0) {
        // Section header
        this.applyRangeStyle(ws, currentRow, 0, currentRow, 7, this.styles.sectionHeader);
        currentRow++;

        // Table header
        this.applyRangeStyle(ws, currentRow, 0, currentRow, 7, this.styles.tableHeader);
        currentRow++;

        // Data rows
        for (let i = 0; i < location.portStaff.length; i++) {
          for (let c = 0; c < 8; c++) {
            let style = this.styles.dataCell;
            if (c === 2 || c === 7) style = this.styles.currency;
            else if (c === 3 || c === 4 || c === 6) style = this.styles.number;
            else if (c === 5) style = this.styles.percent;

            this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c }), style);
          }
          currentRow++;
        }
        currentRow++;
      }

      currentRow++;
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 13 },
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 20 }
    ];

    // Freeze first row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    return ws;
  },

  /**
   * Create Revenue Detail sheet
   */
  createRevenueSheet(scenario, calculations) {
    const data = [];
    let currentRow = 0;

    // Header
    data.push(['Ship Agency Financial Model - Revenue Detail']);
    data.push([]);
    currentRow = 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      data.push([`Location: ${location.name}`]);
      const locationHeaderRow = currentRow;
      currentRow++;

      data.push([]);
      currentRow++;

      // Ship types
      data.push(['PORT CALLS BY SHIP TYPE']);
      const shipSectionRow = currentRow;
      currentRow++;

      data.push(['Ship Type', 'Calls', 'Fee per Call', 'Total Fees', 'Funds per Call']);
      const shipHeaderRow = currentRow;
      currentRow++;

      for (const ship of location.revenue.shipTypes) {
        const totalFees = ship.calls * ship.feePerCall;
        data.push([
          ship.type,
          ship.calls,
          ship.feePerCall,
          totalFees,
          ship.fundsPerCall || 0
        ]);
        currentRow++;
      }

      data.push([]);
      currentRow++;

      // Revenue breakdown
      const baseRevenue = location.revenue.shipTypes.reduce((sum, ship) => sum + (ship.calls * ship.feePerCall), 0);
      const husbandryRevenue = location.revenue.husbandry.enabled ? baseRevenue * (location.revenue.husbandry.marginPercent / 100) : 0;
      const commissionRevenue = location.revenue.commission.enabled ? (baseRevenue + husbandryRevenue) * (location.revenue.commission.marginPercent / 100) : 0;
      const docRevenue = location.revenue.documentation?.manualAmount || 0;

      data.push(['REVENUE BREAKDOWN']);
      const revSectionRow = currentRow;
      currentRow++;

      data.push(['Category', 'Amount']);
      const revHeaderRow = currentRow;
      currentRow++;

      data.push(['Base Agency Fees', baseRevenue]);
      data.push(['Husbandry Revenue', husbandryRevenue]);
      data.push(['Commission Revenue', commissionRevenue]);
      data.push(['Documentation Revenue', docRevenue]);
      data.push(['Total Revenue', baseRevenue + husbandryRevenue + commissionRevenue + docRevenue]);
      const revLastRow = currentRow + 4;
      currentRow = revLastRow + 1;

      data.push([]);
      data.push([]);
      currentRow += 2;
    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Apply styles
    currentRow = 0;

    // Title
    this.applyRangeStyle(ws, 0, 0, 0, 4, this.styles.title);
    currentRow = 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      this.applyRangeStyle(ws, currentRow, 0, currentRow, 4, this.styles.locationHeader);
      currentRow += 2;

      // Ship types section
      this.applyRangeStyle(ws, currentRow, 0, currentRow, 4, this.styles.sectionHeader);
      currentRow++;

      this.applyRangeStyle(ws, currentRow, 0, currentRow, 4, this.styles.tableHeader);
      const shipHeaderRow = currentRow;
      currentRow++;

      const shipCount = location.revenue.shipTypes.length;
      for (let i = 0; i < shipCount; i++) {
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.number);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 2 }), this.styles.currency);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 3 }), this.styles.currency);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 4 }), this.styles.currency);
        currentRow++;
      }
      currentRow++;

      // Revenue breakdown section
      this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.sectionHeader);
      currentRow++;

      this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.tableHeader);
      currentRow++;

      // Revenue breakdown rows
      for (let i = 0; i < 4; i++) {
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.currency);
        currentRow++;
      }

      // Total row
      this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.totalRow);
      this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), { ...this.styles.totalRow, numFmt: "$#,##0.00" });
      currentRow += 3;
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 22 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 }
    ];

    // Freeze first row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    return ws;
  },

  /**
   * Create Overhead Detail sheet
   */
  createOverheadSheet(scenario) {
    const data = [];
    let currentRow = 0;

    // Header
    data.push(['Ship Agency Financial Model - Overhead Detail']);
    data.push([]);
    currentRow = 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      data.push([`Location: ${location.name}`]);
      const locationHeaderRow = currentRow;
      currentRow++;

      data.push([]);
      currentRow++;

      const overhead = location.overhead;

      // Office Space
      if (overhead.officeSpace) {
        data.push(['OFFICE SPACE']);
        const officeSectionRow = currentRow;
        currentRow++;

        data.push(['Item', 'Value']);
        const officeHeaderRow = currentRow;
        currentRow++;

        data.push(['Square Feet', overhead.officeSpace.sqft]);
        data.push(['Rent Class', overhead.officeSpace.rentClass]);
        data.push(['Cost per Sqft', overhead.officeSpace.costPerSqft]);
        data.push(['Annual Rent', overhead.officeSpace.sqft * overhead.officeSpace.costPerSqft]);
        currentRow += 4;

        data.push([]);
        currentRow++;
      }

      // Process all overhead categories
      const categories = [
        { key: 'insurance', title: 'INSURANCE', columns: ['Type', 'Annual Cost'] },
        { key: 'technology', title: 'TECHNOLOGY', columns: ['System', 'Annual Cost'] },
        { key: 'regulatory', title: 'REGULATORY', columns: ['Item', 'Annual Cost'] },
        { key: 'professionalServices', title: 'PROFESSIONAL SERVICES', columns: ['Service', 'Annual Cost'] },
        { key: 'officeOperations', title: 'OFFICE OPERATIONS', columns: ['Item', 'Annual Cost'] },
        { key: 'communications', title: 'COMMUNICATIONS', columns: ['Item', 'Annual Cost'] },
        { key: 'employeeRelated', title: 'EMPLOYEE RELATED', columns: ['Item', 'Annual Cost'] },
        { key: 'vehicleTransport', title: 'VEHICLE & TRANSPORTATION', columns: ['Item', 'Annual Cost'] }
      ];

      for (const category of categories) {
        if (overhead[category.key]) {
          data.push([category.title]);
          const catSectionRow = currentRow;
          currentRow++;

          data.push(category.columns);
          const catHeaderRow = currentRow;
          currentRow++;

          for (const [key, value] of Object.entries(overhead[category.key])) {
            data.push([this.formatLabel(key), value]);
            currentRow++;
          }

          data.push([]);
          currentRow++;
        }
      }

      // Variable Costs
      if (overhead.variableCosts) {
        data.push(['VARIABLE COSTS PER CALL']);
        const varSectionRow = currentRow;
        currentRow++;

        data.push(['Item', 'Value']);
        const varHeaderRow = currentRow;
        currentRow++;

        data.push(['Miles per Call', overhead.variableCosts.milesPerCall]);
        data.push(['Vehicle Type', overhead.variableCosts.vehicleType]);
        data.push(['Cost per Call', overhead.variableCosts.costPerCall]);
        currentRow += 3;

        data.push([]);
        currentRow++;
      }

      data.push([]);
      currentRow++;
    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Apply styles
    currentRow = 0;

    // Title
    this.applyRangeStyle(ws, 0, 0, 0, 1, this.styles.title);
    currentRow = 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.locationHeader);
      currentRow += 2;

      const overhead = location.overhead;

      // Office Space
      if (overhead.officeSpace) {
        this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.sectionHeader);
        currentRow++;

        this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.tableHeader);
        currentRow++;

        // 4 data rows
        for (let i = 0; i < 3; i++) {
          this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
          this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.dataCell);
          currentRow++;
        }
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.currency);
        currentRow += 2;
      }

      // All other categories
      const categories = [
        'insurance', 'technology', 'regulatory', 'professionalServices',
        'officeOperations', 'communications', 'employeeRelated', 'vehicleTransport'
      ];

      for (const category of categories) {
        if (overhead[category]) {
          // Section header
          this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.sectionHeader);
          currentRow++;

          // Table header
          this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.tableHeader);
          currentRow++;

          // Data rows
          const itemCount = Object.keys(overhead[category]).length;
          for (let i = 0; i < itemCount; i++) {
            this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
            this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.currency);
            currentRow++;
          }

          currentRow++;
        }
      }

      // Variable Costs
      if (overhead.variableCosts) {
        this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.sectionHeader);
        currentRow++;

        this.applyRangeStyle(ws, currentRow, 0, currentRow, 1, this.styles.tableHeader);
        currentRow++;

        // 3 data rows
        for (let i = 0; i < 2; i++) {
          this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
          this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.dataCell);
          currentRow++;
        }
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 0 }), this.styles.dataCell);
        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r: currentRow, c: 1 }), this.styles.currency);
        currentRow += 2;
      }

      currentRow++;
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 35 },
      { wch: 18 }
    ];

    // Freeze first row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    return ws;
  },

  /**
   * Create Location Breakdown sheet
   */
  createLocationSheet(scenario, calculations) {
    const data = [];

    // Header
    data.push(['Ship Agency Financial Model - Location Breakdown']);
    data.push([]);

    // Location summary table
    data.push(['Location', 'Type', 'State', 'Active', 'Calls', 'Revenue', 'Costs', 'EBITDA']);

    for (const location of scenario.locations) {
      const calls = location.revenue.shipTypes.reduce((sum, ship) => sum + ship.calls, 0);

      data.push([
        location.name,
        location.type.toUpperCase(),
        location.state || '',
        location.active ? 'Yes' : 'No',
        calls,
        '', // Revenue - to be calculated
        '', // Costs - to be calculated
        ''  // EBITDA - to be calculated
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Apply styles
    // Title
    this.applyRangeStyle(ws, 0, 0, 0, 7, this.styles.title);

    // Table header
    this.applyRangeStyle(ws, 2, 0, 2, 7, this.styles.tableHeader);

    // Data rows
    for (let r = 3; r < 3 + scenario.locations.length; r++) {
      for (let c = 0; c < 8; c++) {
        let style = this.styles.dataCell;
        if (c === 4) style = this.styles.number; // Calls
        else if (c >= 5) style = this.styles.currency; // Revenue, Costs, EBITDA

        this.applyCellStyle(ws, XLSX.utils.encode_cell({ r, c }), style);
      }
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 22 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 }
    ];

    // Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 3 };

    // Add auto-filter
    ws['!autofilter'] = { ref: `A3:H${3 + scenario.locations.length}` };

    return ws;
  },

  /**
   * Calculate staff compensation
   */
  calculateStaffCompensation(staff) {
    if (staff.isHourly) {
      const basePay = staff.salary * (staff.annualHours || 2080);
      const otPay = staff.salary * 1.5 * (staff.overtimeHours || 0);
      return (basePay + otPay) * (1 + (staff.bonusPercent || 0) / 100) * staff.count;
    } else {
      return staff.salary * (1 + (staff.bonusPercent || 0) / 100) * staff.count;
    }
  },

  /**
   * Format label
   */
  formatLabel(str) {
    return str.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
  },

  /**
   * Export to styled Excel using ExcelJS (supports colors, borders, formatting)
   */
  async exportToExcelStyled(scenario, calculations) {
    try {
      const ExcelJS = window.ExcelJS;
      const workbook = new ExcelJS.Workbook();

      // Set workbook properties
      workbook.creator = 'Ship Agency Financial Model';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Add worksheets with styling
      await this.createStyledDashboard(workbook, scenario, calculations);
      await this.createStyledStaffing(workbook, scenario);
      await this.createStyledRevenue(workbook, scenario, calculations);
      await this.createStyledOverhead(workbook, scenario);
      await this.createStyledLocations(workbook, scenario, calculations);

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scenario.name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      console.log(`Styled Excel file exported: ${a.download}`);
    } catch (error) {
      console.error('Styled Excel export error:', error);
      alert('Error exporting styled Excel. Please try again.');
    }
  },

  /**
   * Create styled Dashboard sheet with ExcelJS
   */
  async createStyledDashboard(workbook, scenario, calculations) {
    const sheet = workbook.addWorksheet('Dashboard Summary');

    // Color scheme
    const colors = {
      primaryBlue: 'FF0D3B66',
      lightBlue: 'FF0070C0',
      tableHeader: 'FF4472C4',
      teal: 'FF00B0F0',
      lightGray: 'FFF2F2F2',
      yellow: 'FFFFF2CC'
    };

    // Title
    sheet.getCell('A1').value = 'Ship Agency Financial Model - Dashboard Summary';
    sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } };
    sheet.getCell('A1').alignment = { horizontal: 'left', vertical: 'middle' };

    // Info rows
    sheet.getCell('A2').value = 'Scenario:';
    sheet.getCell('B2').value = scenario.name;
    sheet.getCell('A3').value = 'Model Type:';
    sheet.getCell('B3').value = scenario.modelType === 'traditional' ? 'Traditional' : 'AI-Enabled';
    sheet.getCell('A4').value = 'Export Date:';
    sheet.getCell('B4').value = new Date().toLocaleDateString();

    ['A2', 'A3', 'A4'].forEach(cell => {
      sheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightGray } };
    });

    let row = 6;

    // KPI Section
    sheet.getCell(`A${row}`).value = 'KEY PERFORMANCE INDICATORS';
    sheet.mergeCells(`A${row}:C${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    // KPI Table Header
    sheet.getCell(`A${row}`).value = 'Metric';
    sheet.getCell(`B${row}`).value = 'Value';
    sheet.getCell(`C${row}`).value = 'Unit';
    ['A', 'B', 'C'].forEach(col => {
      const cell = sheet.getCell(`${col}${row}`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.tableHeader } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = this.getAllBorders();
    });
    row++;

    // KPI Data
    const kpis = [
      ['Total Port Calls', calculations.totalCalls, 'calls'],
      ['Total Employees', calculations.totalEmployees, 'employees'],
      ['Revenue per Call', calculations.revenuePerCall, '$/call'],
      ['Cost per Call', calculations.costPerCall, '$/call'],
      ['Delta per Call (Total)', calculations.deltaPerCall, '$/call'],
      ['Direct Delta per Call (KEY KPI)', calculations.directDeltaPerCall || 0, '$/call']
    ];

    kpis.forEach(([metric, value, unit]) => {
      sheet.getCell(`A${row}`).value = metric;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`C${row}`).value = unit;

      ['A', 'B', 'C'].forEach(col => {
        sheet.getCell(`${col}${row}`).border = this.getThinBorders();
      });
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      row++;
    });

    row++;

    // Financial Section
    sheet.getCell(`A${row}`).value = 'FINANCIAL SUMMARY';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    // Financial Table Header
    sheet.getCell(`A${row}`).value = 'Category';
    sheet.getCell(`B${row}`).value = 'Amount';
    ['A', 'B'].forEach(col => {
      const cell = sheet.getCell(`${col}${row}`);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.tableHeader } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = this.getAllBorders();
    });
    row++;

    // Financial Data
    const financials = [
      ['Total Revenue', calculations.totalRevenue, '$'],
      ['Total Costs', calculations.totalCosts, '$'],
      ['  Payroll', calculations.totalPayroll, '$'],
      ['  Benefits', calculations.totalBenefits, '$'],
      ['  Overhead', calculations.totalOverhead, '$'],
      ['  Variable Costs', calculations.totalVariableCosts || 0, '$'],
      ['EBITDA', calculations.ebitda, '$'],
      ['EBITDA Margin (%)', calculations.ebitdaMargin / 100, '%'],
      ['Break-Even Calls', calculations.breakEvenCalls, '#']
    ];

    financials.forEach(([category, amount, fmt]) => {
      sheet.getCell(`A${row}`).value = category;
      sheet.getCell(`B${row}`).value = amount;

      if (fmt === '$') {
        sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      } else if (fmt === '%') {
        sheet.getCell(`B${row}`).numFmt = '0.0%';
      } else {
        sheet.getCell(`B${row}`).numFmt = '#,##0';
      }

      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      row++;
    });

    // Set column widths
    sheet.getColumn(1).width = 35;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 15;
  },

  /**
   * Create styled Staffing sheet
   */
  async createStyledStaffing(workbook, scenario) {
    const sheet = workbook.addWorksheet('Staffing Detail');
    const colors = {
      primaryBlue: 'FF0D3B66',
      lightBlue: 'FF0070C0',
      tableHeader: 'FF4472C4',
      teal: 'FF00B0F0'
    };

    let row = 1;

    // Title
    sheet.getCell(`A${row}`).value = 'Ship Agency Financial Model - Staffing Detail';
    sheet.mergeCells(`A${row}:H${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } };
    row += 2;

    for (const location of scenario.locations) {
      if (!location.active) continue;

      // Location header
      sheet.getCell(`A${row}`).value = `Location: ${location.name} (${location.type.toUpperCase()})`;
      sheet.mergeCells(`A${row}:H${row}`);
      sheet.getCell(`A${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.teal } };
      sheet.getCell(`A${row}`).border = this.getAllBorders();
      row += 2;

      // Corporate Staff
      if (location.corporateStaff && location.corporateStaff.length > 0) {
        sheet.getCell(`A${row}`).value = 'CORPORATE STAFF';
        sheet.mergeCells(`A${row}:H${row}`);
        sheet.getCell(`A${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
        row++;

        // Header
        const headers = ['Position', 'Type', 'Base Rate', 'Annual Hours', 'OT Hours', 'Bonus %', 'Count', 'Total Compensation'];
        headers.forEach((header, i) => {
          const col = String.fromCharCode(65 + i);
          sheet.getCell(`${col}${row}`).value = header;
          sheet.getCell(`${col}${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
          sheet.getCell(`${col}${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.tableHeader } };
          sheet.getCell(`${col}${row}`).alignment = { horizontal: 'center' };
          sheet.getCell(`${col}${row}`).border = this.getAllBorders();
        });
        row++;

        // Data rows
        location.corporateStaff.forEach(staff => {
          const totalComp = this.calculateStaffCompensation(staff);
          sheet.getCell(`A${row}`).value = staff.position;
          sheet.getCell(`B${row}`).value = staff.isHourly ? 'Hourly' : 'Salary';
          sheet.getCell(`C${row}`).value = staff.salary;
          sheet.getCell(`C${row}`).numFmt = '$#,##0.00';
          sheet.getCell(`D${row}`).value = staff.annualHours || 2080;
          sheet.getCell(`D${row}`).numFmt = '#,##0';
          sheet.getCell(`E${row}`).value = staff.overtimeHours || 0;
          sheet.getCell(`E${row}`).numFmt = '#,##0';
          sheet.getCell(`F${row}`).value = (staff.bonusPercent || 0) / 100;
          sheet.getCell(`F${row}`).numFmt = '0.0%';
          sheet.getCell(`G${row}`).value = staff.count;
          sheet.getCell(`G${row}`).numFmt = '#,##0';
          sheet.getCell(`H${row}`).value = totalComp;
          sheet.getCell(`H${row}`).numFmt = '$#,##0.00';

          for (let i = 0; i < 8; i++) {
            sheet.getCell(`${String.fromCharCode(65 + i)}${row}`).border = this.getThinBorders();
          }
          sheet.getCell(`C${row}`).alignment = { horizontal: 'right' };
          sheet.getCell(`D${row}`).alignment = { horizontal: 'right' };
          sheet.getCell(`E${row}`).alignment = { horizontal: 'right' };
          sheet.getCell(`F${row}`).alignment = { horizontal: 'right' };
          sheet.getCell(`G${row}`).alignment = { horizontal: 'right' };
          sheet.getCell(`H${row}`).alignment = { horizontal: 'right' };
          row++;
        });
        row++;
      }

      // Port Staff (similar structure)
      if (location.portStaff && location.portStaff.length > 0) {
        sheet.getCell(`A${row}`).value = 'PORT OPERATIONS STAFF';
        sheet.mergeCells(`A${row}:H${row}`);
        sheet.getCell(`A${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
        row++;

        const headers = ['Position', 'Type', 'Base Rate', 'Annual Hours', 'OT Hours', 'Bonus %', 'Count', 'Total Compensation'];
        headers.forEach((header, i) => {
          const col = String.fromCharCode(65 + i);
          sheet.getCell(`${col}${row}`).value = header;
          sheet.getCell(`${col}${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
          sheet.getCell(`${col}${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.tableHeader } };
          sheet.getCell(`${col}${row}`).alignment = { horizontal: 'center' };
          sheet.getCell(`${col}${row}`).border = this.getAllBorders();
        });
        row++;

        location.portStaff.forEach(staff => {
          const totalComp = this.calculateStaffCompensation(staff);
          sheet.getCell(`A${row}`).value = staff.position;
          sheet.getCell(`B${row}`).value = staff.isHourly ? 'Hourly' : 'Salary';
          sheet.getCell(`C${row}`).value = staff.salary;
          sheet.getCell(`C${row}`).numFmt = '$#,##0.00';
          sheet.getCell(`D${row}`).value = staff.annualHours || 2080;
          sheet.getCell(`E${row}`).value = staff.overtimeHours || 0;
          sheet.getCell(`F${row}`).value = (staff.bonusPercent || 0) / 100;
          sheet.getCell(`F${row}`).numFmt = '0.0%';
          sheet.getCell(`G${row}`).value = staff.count;
          sheet.getCell(`H${row}`).value = totalComp;
          sheet.getCell(`H${row}`).numFmt = '$#,##0.00';

          for (let i = 0; i < 8; i++) {
            sheet.getCell(`${String.fromCharCode(65 + i)}${row}`).border = this.getThinBorders();
          }
          sheet.getCell(`C${row}`).alignment = { horizontal: 'right' };
          sheet.getCell(`H${row}`).alignment = { horizontal: 'right' };
          row++;
        });
        row++;
      }

      row++;
    }

    // Set column widths
    sheet.getColumn(1).width = 25;
    sheet.getColumn(2).width = 10;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 13;
    sheet.getColumn(5).width = 10;
    sheet.getColumn(6).width = 10;
    sheet.getColumn(7).width = 8;
    sheet.getColumn(8).width = 20;
  },

  /**
   * Create styled Revenue sheet
   */
  async createStyledRevenue(workbook, scenario, calculations) {
    const sheet = workbook.addWorksheet('Revenue Detail');
    const colors = {
      primaryBlue: 'FF0D3B66',
      lightBlue: 'FF0070C0',
      tableHeader: 'FF4472C4',
      teal: 'FF00B0F0'
    };

    let row = 1;

    // Title
    sheet.getCell(`A${row}`).value = 'Ship Agency Financial Model - Revenue Detail';
    sheet.mergeCells(`A${row}:E${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } };
    sheet.getCell(`A${row}`).alignment = { horizontal: 'left', vertical: 'middle' };
    row += 2;

    // Aggregate all ship types across locations
    const shipTypeData = new Map();
    for (const location of scenario.locations) {
      if (!location.active || !location.revenue || !location.revenue.shipTypes) continue;

      for (const shipType of location.revenue.shipTypes) {
        if (!shipTypeData.has(shipType.type)) {
          shipTypeData.set(shipType.type, {
            calls: 0,
            feePerCall: shipType.feePerCall,
            totalFees: 0,
            fundsPerCall: shipType.fundsPerCall || 0
          });
        }
        const data = shipTypeData.get(shipType.type);
        data.calls += shipType.calls;
        data.totalFees += shipType.calls * shipType.feePerCall;
      }
    }

    // Port Calls by Ship Type section
    sheet.getCell(`A${row}`).value = 'PORT CALLS BY SHIP TYPE';
    sheet.mergeCells(`A${row}:E${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    // Table headers
    const headers = ['Ship Type', 'Calls', 'Fee per Call', 'Total Fees', 'Funds per Call'];
    headers.forEach((header, i) => {
      const col = String.fromCharCode(65 + i);
      sheet.getCell(`${col}${row}`).value = header;
      sheet.getCell(`${col}${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getCell(`${col}${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.tableHeader } };
      sheet.getCell(`${col}${row}`).alignment = { horizontal: 'center' };
      sheet.getCell(`${col}${row}`).border = this.getAllBorders();
    });
    row++;

    // Ship type data rows
    let totalCalls = 0;
    let totalFees = 0;
    for (const [type, data] of shipTypeData) {
      sheet.getCell(`A${row}`).value = type;
      sheet.getCell(`B${row}`).value = data.calls;
      sheet.getCell(`B${row}`).numFmt = '#,##0';
      sheet.getCell(`C${row}`).value = data.feePerCall;
      sheet.getCell(`C${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`D${row}`).value = data.totalFees;
      sheet.getCell(`D${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`E${row}`).value = data.fundsPerCall;
      sheet.getCell(`E${row}`).numFmt = '$#,##0.00';

      for (let i = 0; i < 5; i++) {
        sheet.getCell(`${String.fromCharCode(65 + i)}${row}`).border = this.getThinBorders();
      }
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      sheet.getCell(`C${row}`).alignment = { horizontal: 'right' };
      sheet.getCell(`D${row}`).alignment = { horizontal: 'right' };
      sheet.getCell(`E${row}`).alignment = { horizontal: 'right' };

      totalCalls += data.calls;
      totalFees += data.totalFees;
      row++;
    }

    // Totals row
    sheet.getCell(`A${row}`).value = 'TOTAL';
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = totalCalls;
    sheet.getCell(`B${row}`).numFmt = '#,##0';
    sheet.getCell(`B${row}`).font = { bold: true };
    sheet.getCell(`D${row}`).value = totalFees;
    sheet.getCell(`D${row}`).numFmt = '$#,##0.00';
    sheet.getCell(`D${row}`).font = { bold: true };
    for (let i = 0; i < 5; i++) {
      sheet.getCell(`${String.fromCharCode(65 + i)}${row}`).border = this.getAllBorders();
    }
    sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`D${row}`).alignment = { horizontal: 'right' };
    row += 2;

    // Revenue Summary section
    sheet.getCell(`A${row}`).value = 'REVENUE SUMMARY';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const revenueSummary = [
      ['Base Agency Fees', calculations.consolidated.totalRevenue],
      ['Husbandry Revenue (9%)', calculations.consolidated.totalRevenue * 0.09],
      ['Commission Revenue (1.5%)', calculations.consolidated.totalRevenue * 0.015],
      ['Documentation Fees', 0]
    ];

    revenueSummary.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      row++;
    });

    // Total revenue
    sheet.getCell(`A${row}`).value = 'TOTAL REVENUE';
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = calculations.consolidated.totalRevenue;
    sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
    sheet.getCell(`B${row}`).font = { bold: true };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    sheet.getCell(`B${row}`).border = this.getAllBorders();
    sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };

    // Set column widths
    sheet.getColumn(1).width = 22;
    sheet.getColumn(2).width = 12;
    sheet.getColumn(3).width = 16;
    sheet.getColumn(4).width = 16;
    sheet.getColumn(5).width = 20;
  },

  /**
   * Create styled Overhead sheet
   */
  async createStyledOverhead(workbook, scenario) {
    const sheet = workbook.addWorksheet('Overhead Detail');
    const colors = {
      primaryBlue: 'FF0D3B66',
      lightBlue: 'FF0070C0',
      tableHeader: 'FF4472C4',
      teal: 'FF00B0F0'
    };

    let row = 1;

    // Title
    sheet.getCell(`A${row}`).value = 'Ship Agency Financial Model - Overhead Detail';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } };
    sheet.getCell(`A${row}`).alignment = { horizontal: 'left', vertical: 'middle' };
    row += 2;

    // Aggregate overhead across all locations
    let totalFixed = 0;
    let totalVariable = 0;

    const aggregatedOverhead = {
      officeSpace: { total: 0, sqft: 0 },
      insurance: { longshoremen: 0, errors: 0, liability: 0 },
      technology: { office365: 0, erp: 0, crm: 0, specialized: 0 },
      regulatory: { customsBond: 0, fmcLicensing: 0 },
      professional: { legal: 0, accounting: 0, consulting: 0 },
      officeOps: { utilities: 0, supplies: 0, maintenance: 0, janitorial: 0 },
      communications: { phone: 0, mobile: 0 },
      employeeRelated: { training: 0, recruiting: 0, travel: 0 },
      vehicle: { maintenance: 0, parking: 0 },
      variable: { total: 0 }
    };

    // Aggregate from all locations
    for (const location of scenario.locations) {
      if (!location.active || !location.overhead) continue;

      const oh = location.overhead;

      if (oh.officeSpace) {
        aggregatedOverhead.officeSpace.total += oh.officeSpace.annualRent || 0;
        aggregatedOverhead.officeSpace.sqft += oh.officeSpace.sqft || 0;
      }

      if (oh.insurance) {
        aggregatedOverhead.insurance.longshoremen += oh.insurance.longshoremen || 0;
        aggregatedOverhead.insurance.errors += oh.insurance.errorsOmissions || 0;
        aggregatedOverhead.insurance.liability += oh.insurance.generalLiability || 0;
      }

      if (oh.technology) {
        aggregatedOverhead.technology.office365 += oh.technology.office365 || 0;
        aggregatedOverhead.technology.erp += oh.technology.erpNetSuite || 0;
        aggregatedOverhead.technology.crm += oh.technology.crmDynamics || 0;
        aggregatedOverhead.technology.specialized += oh.technology.specializedSaaS || 0;
      }

      if (oh.regulatory) {
        aggregatedOverhead.regulatory.customsBond += oh.regulatory.customsBond || 0;
        aggregatedOverhead.regulatory.fmcLicensing += oh.regulatory.fmcLicensing || 0;
      }

      if (oh.professionalServices) {
        aggregatedOverhead.professional.legal += oh.professionalServices.legal || 0;
        aggregatedOverhead.professional.accounting += oh.professionalServices.accounting || 0;
        aggregatedOverhead.professional.consulting += oh.professionalServices.consulting || 0;
      }

      if (oh.officeOperations) {
        aggregatedOverhead.officeOps.utilities += oh.officeOperations.utilities || 0;
        aggregatedOverhead.officeOps.supplies += oh.officeOperations.officeSupplies || 0;
        aggregatedOverhead.officeOps.maintenance += oh.officeOperations.maintenanceRepairs || 0;
        aggregatedOverhead.officeOps.janitorial += oh.officeOperations.janitorial || 0;
      }

      if (oh.communications) {
        aggregatedOverhead.communications.phone += oh.communications.phoneSystems || 0;
        aggregatedOverhead.communications.mobile += oh.communications.mobileDevices || 0;
      }

      if (oh.employeeRelated) {
        aggregatedOverhead.employeeRelated.training += oh.employeeRelated.trainingDevelopment || 0;
        aggregatedOverhead.employeeRelated.recruiting += oh.employeeRelated.recruiting || 0;
        aggregatedOverhead.employeeRelated.travel += oh.employeeRelated.travelEntertainment || 0;
      }

      if (oh.vehicleTransportation) {
        aggregatedOverhead.vehicle.maintenance += oh.vehicleTransportation.vehicleMaintenance || 0;
        aggregatedOverhead.vehicle.parking += oh.vehicleTransportation.parking || 0;
      }

      if (oh.variable) {
        aggregatedOverhead.variable.total += oh.variable.totalVariableCosts || 0;
      }
    }

    // Office Space section
    sheet.getCell(`A${row}`).value = 'OFFICE SPACE';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const officeData = [
      ['Total Square Feet', aggregatedOverhead.officeSpace.sqft],
      ['Annual Rent', aggregatedOverhead.officeSpace.total]
    ];
    officeData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = label.includes('Square') ? '#,##0' : '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += (label.includes('Square') ? 0 : value);
      row++;
    });
    row++;

    // Insurance section
    sheet.getCell(`A${row}`).value = 'INSURANCE';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const insuranceData = [
      ['Longshoremen & Harbor Worker', aggregatedOverhead.insurance.longshoremen],
      ['Errors & Omissions', aggregatedOverhead.insurance.errors],
      ['General Liability', aggregatedOverhead.insurance.liability]
    ];
    insuranceData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Technology section
    sheet.getCell(`A${row}`).value = 'TECHNOLOGY';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const techData = [
      ['Office 365 / Azure', aggregatedOverhead.technology.office365],
      ['ERP (Oracle NetSuite)', aggregatedOverhead.technology.erp],
      ['CRM (MS Dynamics)', aggregatedOverhead.technology.crm],
      ['Specialized SaaS (Sedna, Marcura)', aggregatedOverhead.technology.specialized]
    ];
    techData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Regulatory section
    sheet.getCell(`A${row}`).value = 'REGULATORY';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const regulatoryData = [
      ['US Customs Carrier Bond', aggregatedOverhead.regulatory.customsBond],
      ['FMC Licensing', aggregatedOverhead.regulatory.fmcLicensing]
    ];
    regulatoryData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Professional Services section
    sheet.getCell(`A${row}`).value = 'PROFESSIONAL SERVICES';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const professionalData = [
      ['Legal Services', aggregatedOverhead.professional.legal],
      ['Accounting Services', aggregatedOverhead.professional.accounting],
      ['Consulting', aggregatedOverhead.professional.consulting]
    ];
    professionalData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Office Operations section
    sheet.getCell(`A${row}`).value = 'OFFICE OPERATIONS';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const officeOpsData = [
      ['Utilities', aggregatedOverhead.officeOps.utilities],
      ['Office Supplies', aggregatedOverhead.officeOps.supplies],
      ['Maintenance & Repairs', aggregatedOverhead.officeOps.maintenance],
      ['Janitorial Services', aggregatedOverhead.officeOps.janitorial]
    ];
    officeOpsData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Communications section
    sheet.getCell(`A${row}`).value = 'COMMUNICATIONS';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const commData = [
      ['Phone Systems', aggregatedOverhead.communications.phone],
      ['Mobile Devices', aggregatedOverhead.communications.mobile]
    ];
    commData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Employee Related section
    sheet.getCell(`A${row}`).value = 'EMPLOYEE RELATED';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const employeeData = [
      ['Training & Development', aggregatedOverhead.employeeRelated.training],
      ['Recruiting', aggregatedOverhead.employeeRelated.recruiting],
      ['Travel & Entertainment', aggregatedOverhead.employeeRelated.travel]
    ];
    employeeData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Vehicle & Transportation section
    sheet.getCell(`A${row}`).value = 'VEHICLE & TRANSPORTATION';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const vehicleData = [
      ['Vehicle Maintenance', aggregatedOverhead.vehicle.maintenance],
      ['Parking', aggregatedOverhead.vehicle.parking]
    ];
    vehicleData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`A${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).border = this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      totalFixed += value;
      row++;
    });
    row++;

    // Variable Costs section
    sheet.getCell(`A${row}`).value = 'VARIABLE COSTS';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    sheet.getCell(`A${row}`).value = 'Total Variable Costs per Call';
    sheet.getCell(`B${row}`).value = aggregatedOverhead.variable.total;
    sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
    sheet.getCell(`A${row}`).border = this.getThinBorders();
    sheet.getCell(`B${row}`).border = this.getThinBorders();
    sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
    totalVariable = aggregatedOverhead.variable.total;
    row += 2;

    // Summary section
    sheet.getCell(`A${row}`).value = 'OVERHEAD SUMMARY';
    sheet.mergeCells(`A${row}:B${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } };
    sheet.getCell(`A${row}`).border = this.getAllBorders();
    row++;

    const summaryData = [
      ['Total Fixed Overhead', totalFixed],
      ['Total Variable Costs', totalVariable],
      ['Grand Total', totalFixed + totalVariable]
    ];
    summaryData.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`A${row}`).font = { bold: label === 'Grand Total' };
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`B${row}`).font = { bold: label === 'Grand Total' };
      sheet.getCell(`A${row}`).border = label === 'Grand Total' ? this.getAllBorders() : this.getThinBorders();
      sheet.getCell(`B${row}`).border = label === 'Grand Total' ? this.getAllBorders() : this.getThinBorders();
      sheet.getCell(`B${row}`).alignment = { horizontal: 'right' };
      row++;
    });

    // Set column widths
    sheet.getColumn(1).width = 35;
    sheet.getColumn(2).width = 18;
  },

  /**
   * Create styled Locations sheet
   */
  async createStyledLocations(workbook, scenario, calculations) {
    const sheet = workbook.addWorksheet('Location Breakdown');
    const colors = {
      primaryBlue: 'FF0D3B66',
      lightBlue: 'FF0070C0',
      tableHeader: 'FF4472C4',
      teal: 'FF00B0F0'
    };

    let row = 1;

    // Title
    sheet.getCell(`A${row}`).value = 'Ship Agency Financial Model - Location Breakdown';
    sheet.mergeCells(`A${row}:H${row}`);
    sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } };
    sheet.getCell(`A${row}`).alignment = { horizontal: 'left', vertical: 'middle' };
    row += 2;

    // Table header
    const headers = ['Location', 'Type', 'State', 'Active', 'Calls', 'Revenue', 'Costs', 'EBITDA'];
    headers.forEach((header, i) => {
      const col = String.fromCharCode(65 + i);
      sheet.getCell(`${col}${row}`).value = header;
      sheet.getCell(`${col}${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getCell(`${col}${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.tableHeader } };
      sheet.getCell(`${col}${row}`).alignment = { horizontal: 'center' };
      sheet.getCell(`${col}${row}`).border = this.getAllBorders();
    });
    row++;

    // Calculate location-specific metrics
    let totalCalls = 0;
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalEBITDA = 0;

    for (const location of scenario.locations) {
      // Calculate location revenue
      let locationRevenue = 0;
      let locationCalls = 0;
      if (location.revenue && location.revenue.shipTypes) {
        for (const shipType of location.revenue.shipTypes) {
          locationCalls += shipType.calls;
          locationRevenue += shipType.calls * shipType.feePerCall;
        }
        // Add husbandry and commission if enabled
        if (location.revenue.husbandry && location.revenue.husbandry.enabled) {
          locationRevenue += locationRevenue * ((location.revenue.husbandry.marginPercent || 9) / 100);
        }
        if (location.revenue.commission && location.revenue.commission.enabled) {
          locationRevenue += locationRevenue * ((location.revenue.commission.marginPercent || 1.5) / 100);
        }
      }

      // Calculate location costs (staffing + overhead)
      let locationCosts = 0;

      // Staffing costs
      if (location.corporateStaff) {
        for (const staff of location.corporateStaff) {
          locationCosts += this.calculateStaffCompensation(staff);
        }
      }
      if (location.portStaff) {
        for (const staff of location.portStaff) {
          locationCosts += this.calculateStaffCompensation(staff);
        }
      }

      // Overhead costs (simplified - just aggregate the major categories)
      if (location.overhead) {
        const oh = location.overhead;
        if (oh.officeSpace) locationCosts += oh.officeSpace.annualRent || 0;
        if (oh.insurance) {
          locationCosts += (oh.insurance.longshoremen || 0) +
                          (oh.insurance.errorsOmissions || 0) +
                          (oh.insurance.generalLiability || 0);
        }
        if (oh.technology) {
          locationCosts += (oh.technology.office365 || 0) +
                          (oh.technology.erpNetSuite || 0) +
                          (oh.technology.crmDynamics || 0) +
                          (oh.technology.specializedSaaS || 0);
        }
        if (oh.regulatory) {
          locationCosts += (oh.regulatory.customsBond || 0) +
                          (oh.regulatory.fmcLicensing || 0);
        }
        if (oh.professionalServices) {
          locationCosts += (oh.professionalServices.legal || 0) +
                          (oh.professionalServices.accounting || 0) +
                          (oh.professionalServices.consulting || 0);
        }
        if (oh.officeOperations) {
          locationCosts += (oh.officeOperations.utilities || 0) +
                          (oh.officeOperations.officeSupplies || 0) +
                          (oh.officeOperations.maintenanceRepairs || 0) +
                          (oh.officeOperations.janitorial || 0);
        }
        if (oh.communications) {
          locationCosts += (oh.communications.phoneSystems || 0) +
                          (oh.communications.mobileDevices || 0);
        }
        if (oh.employeeRelated) {
          locationCosts += (oh.employeeRelated.trainingDevelopment || 0) +
                          (oh.employeeRelated.recruiting || 0) +
                          (oh.employeeRelated.travelEntertainment || 0);
        }
        if (oh.vehicleTransportation) {
          locationCosts += (oh.vehicleTransportation.vehicleMaintenance || 0) +
                          (oh.vehicleTransportation.parking || 0);
        }
      }

      const locationEBITDA = locationRevenue - locationCosts;

      // Populate row
      sheet.getCell(`A${row}`).value = location.name;
      sheet.getCell(`B${row}`).value = location.type.toUpperCase();
      sheet.getCell(`C${row}`).value = location.state || 'N/A';
      sheet.getCell(`D${row}`).value = location.active ? 'Yes' : 'No';
      sheet.getCell(`E${row}`).value = locationCalls;
      sheet.getCell(`E${row}`).numFmt = '#,##0';
      sheet.getCell(`F${row}`).value = locationRevenue;
      sheet.getCell(`F${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`G${row}`).value = locationCosts;
      sheet.getCell(`G${row}`).numFmt = '$#,##0.00';
      sheet.getCell(`H${row}`).value = locationEBITDA;
      sheet.getCell(`H${row}`).numFmt = '$#,##0.00';

      // Borders and alignment
      for (let i = 0; i < 8; i++) {
        sheet.getCell(`${String.fromCharCode(65 + i)}${row}`).border = this.getThinBorders();
      }
      sheet.getCell(`D${row}`).alignment = { horizontal: 'center' };
      sheet.getCell(`E${row}`).alignment = { horizontal: 'right' };
      sheet.getCell(`F${row}`).alignment = { horizontal: 'right' };
      sheet.getCell(`G${row}`).alignment = { horizontal: 'right' };
      sheet.getCell(`H${row}`).alignment = { horizontal: 'right' };

      // Accumulate totals
      if (location.active) {
        totalCalls += locationCalls;
        totalRevenue += locationRevenue;
        totalCosts += locationCosts;
        totalEBITDA += locationEBITDA;
      }

      row++;
    }

    // Totals row
    sheet.getCell(`A${row}`).value = 'TOTAL';
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`E${row}`).value = totalCalls;
    sheet.getCell(`E${row}`).numFmt = '#,##0';
    sheet.getCell(`E${row}`).font = { bold: true };
    sheet.getCell(`F${row}`).value = totalRevenue;
    sheet.getCell(`F${row}`).numFmt = '$#,##0.00';
    sheet.getCell(`F${row}`).font = { bold: true };
    sheet.getCell(`G${row}`).value = totalCosts;
    sheet.getCell(`G${row}`).numFmt = '$#,##0.00';
    sheet.getCell(`G${row}`).font = { bold: true };
    sheet.getCell(`H${row}`).value = totalEBITDA;
    sheet.getCell(`H${row}`).numFmt = '$#,##0.00';
    sheet.getCell(`H${row}`).font = { bold: true };

    for (let i = 0; i < 8; i++) {
      sheet.getCell(`${String.fromCharCode(65 + i)}${row}`).border = this.getAllBorders();
    }
    sheet.getCell(`E${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`F${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`G${row}`).alignment = { horizontal: 'right' };
    sheet.getCell(`H${row}`).alignment = { horizontal: 'right' };

    // Set column widths
    sheet.getColumn(1).width = 22;
    sheet.getColumn(2).width = 10;
    sheet.getColumn(3).width = 10;
    sheet.getColumn(4).width = 10;
    sheet.getColumn(5).width = 12;
    sheet.getColumn(6).width = 18;
    sheet.getColumn(7).width = 18;
    sheet.getColumn(8).width = 18;
  },

  /**
   * Helper: Get all borders
   */
  getAllBorders() {
    return {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  },

  /**
   * Helper: Get thin gray borders
   */
  getThinBorders() {
    return {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
    };
  },

  /**
   * Export to CSV
   */
  exportToCSV(scenario, calculations) {
    const data = [];

    // Header
    data.push(['Ship Agency Financial Model - CSV Export']);
    data.push(['Scenario:', scenario.name]);
    data.push(['Model Type:', scenario.modelType === 'traditional' ? 'Traditional' : 'AI-Enabled']);
    data.push(['Export Date:', new Date().toLocaleDateString()]);
    data.push([]);

    // KPIs
    data.push(['KEY PERFORMANCE INDICATORS']);
    data.push(['Metric', 'Value']);
    data.push(['Total Port Calls', calculations.totalCalls]);
    data.push(['Total Employees', calculations.totalEmployees]);
    data.push(['Revenue per Call', `$${calculations.revenuePerCall.toFixed(2)}`]);
    data.push(['Cost per Call', `$${calculations.costPerCall.toFixed(2)}`]);
    data.push(['Delta per Call', `$${calculations.deltaPerCall.toFixed(2)}`]);
    data.push(['Direct Delta per Call (KEY KPI)', `$${(calculations.directDeltaPerCall || 0).toFixed(2)}`]);
    data.push([]);

    // Financial Summary
    data.push(['FINANCIAL SUMMARY']);
    data.push(['Category', 'Amount']);
    data.push(['Total Revenue', `$${calculations.totalRevenue.toFixed(2)}`]);
    data.push(['Total Costs', `$${calculations.totalCosts.toFixed(2)}`]);
    data.push(['EBITDA', `$${calculations.ebitda.toFixed(2)}`]);
    data.push(['EBITDA Margin', `${calculations.ebitdaMargin.toFixed(1)}%`]);

    // Convert to CSV
    const csv = data.map(row => row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Make available globally
window.ExportManager = ExportManager;

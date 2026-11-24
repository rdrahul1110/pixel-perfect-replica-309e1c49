import { allocate, money, type Stance, type Scenario } from "./nimbus";
export async function exportExcel(budget: number, stance: Stance, scenario: Scenario) {
  const { Workbook } = await import("exceljs");
  const plan = allocate(budget, stance, scenario);
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet("Risk reconciliation");
  sheet.columns = [
    { header: "Line item", key: "item", width: 48 },
    { header: "Value (INR Cr)", key: "value", width: 22 },
    { header: "Basis", key: "basis", width: 55 },
  ];
  sheet.addRows([
    { item: "Scenario", value: "", basis: scenario },
    { item: "Approved envelope", value: budget, basis: stance },
    {
      item: "Gross annual exposure",
      value: plan.gross,
      basis: "Prototype scenario model; not an audited valuation",
    },
    ...plan.funded.map((p) => ({
      item: `Abatement: ${p.id} ${p.name}`,
      value: -Math.round((p.retired * plan.gross) / 2655),
      basis: `${p.cost} Cr capex`,
    })),
    {
      item: "Residual after capex",
      value: plan.residual,
      basis: "Gross minus funded annual abatement",
    },
    {
      item: "Opex control mitigation",
      value: -plan.mitigated,
      basis: "Non-additive conservative portfolio estimate",
    },
    { item: "Net after capex and opex", value: plan.net, basis: "Residual minus mitigation" },
    { item: "Idle capital", value: plan.idle, basis: "Envelope minus committed capex" },
  ]);
  const ledger = workbook.addWorksheet("Quarterly ledger");
  ledger.columns = [
    { header: "Project", key: "name", width: 44 },
    { header: "Approved capex (Cr)", key: "cost", width: 22 },
    { header: "Tranche spent (Cr)", key: "spent", width: 22 },
    { header: "Milestone", key: "gate", width: 40 },
    { header: "Completion (%)", key: "progress", width: 18 },
    { header: "Annual exposure retired (Cr)", key: "retired", width: 30 },
    { header: "Realised loss avoided (Cr)", key: "realised", width: 28 },
  ];
  ledger.addRows(
    plan.funded.map((p) => ({ ...p, retired: Math.round((p.retired * plan.gross) / 2655) })),
  );
  ledger.addRow({
    name: "Illustrative prototype milestones and benefits; not audited project records.",
  });
  const buffer = await workbook.xlsx.writeBuffer();
  download(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "Nimbus-Reconciliation.xlsx",
  );
}

export async function exportBRSRAndIFRS(budget: number, stance: Stance, scenario: Scenario) {
  const { Workbook } = await import("exceljs");
  const plan = allocate(budget, stance, scenario);
  const workbook = new Workbook();

  // ==========================================
  // SHEET 1: SEBI BRSR Principle 6 (Environment)
  // ==========================================
  const brsrSheet = workbook.addWorksheet("SEBI_BRSR_Principle_6");
  brsrSheet.columns = [
    { header: "SEBI Mandate & Section Ref", key: "mandate", width: 44 },
    { header: "Initiative & Facility Tag", key: "initiative", width: 40 },
    { header: "Accounting Classification", key: "classification", width: 30 },
    { header: "Capex (INR Cr)", key: "capex", width: 20 },
    { header: "Opex Hedging (INR Cr/yr)", key: "opex", width: 26 },
    { header: "Target Impact & Risk Retired", key: "impact", width: 50 },
    { header: "Auditor Verification / Lineage", key: "lineage", width: 38 },
  ];

  brsrSheet.addRow({
    mandate: "ENTITY IDENTIFICATION: NIMBUS CEMENT LTD",
    initiative: "CIN: L26940MH2010PLC123456",
    classification: "Top 1000 Listed Entities",
    capex: budget,
    opex: 0,
    impact: `Scenario: ${scenario} · Stance: ${stance}`,
    lineage: "Statutory Reporting: FY 2025-26",
  });
  brsrSheet.addRow({
    mandate: "SEBI BRSR PRINCIPLE 6 (ENVIRONMENT) - CAPITAL EXPENDITURE & RESILIENCE ALLOCATION",
    initiative: "",
    classification: "",
    capex: "",
    opex: "",
    impact: "",
    lineage: "",
  });

  const isP1Funded = plan.funded.some((p) => p.id === "P1");
  const isP2Funded = plan.funded.some((p) => p.id === "P2");
  const isP3Funded = plan.funded.some((p) => p.id === "P3");

  // Indicator 1: Energy Transition (P1)
  brsrSheet.addRow({
    mandate: "Essential Indicator 7: Clean Energy Transition & Decarbonisation",
    initiative: isP1Funded
      ? "P1: 120MW Captive Solar + WHR (Raipur P01)"
      : "P1 Deferred: Third-Party Solar PPA (Open Access)",
    classification: isP1Funded
      ? "Capex (Addition to Gross Block)"
      : "Opex (Operational Offtake Agreement)",
    capex: isP1Funded ? 450 : 0,
    opex: isP1Funded ? 0 : 42,
    impact: isP1Funded
      ? "Replaces 68% captive thermal power; retires ₹820 Cr/yr CCTS carbon penalty liability"
      : "Procures 45% solar power via bilateral PPA; mitigates ₹320 Cr/yr carbon penalty",
    lineage: isP1Funded
      ? "EPC Turnkey Contract #TPS-2026-9041"
      : "Bilateral Group Captive PPA Term Sheet",
  });

  // Indicator 2: Water Stewardship (P2)
  brsrSheet.addRow({
    mandate: "Essential Indicator 4: Water Stewardship & Drought Adaptation",
    initiative: isP2Funded
      ? "P2: Slag Grinding Dry Process Conversion (Gulbarga P05)"
      : "P2 Deferred: Emergency Water Tankers & Mobile RO Leasing",
    classification: isP2Funded
      ? "Capex (Plant Modernisation)"
      : "Opex (Contingency Water Supply)",
    capex: isP2Funded ? 280 : 0,
    opex: isP2Funded ? 0 : 18,
    impact: isP2Funded
      ? "Eliminates 28-day dry season water shutdown risk; retires ₹520 Cr/yr water/coal exposure"
      : "Sustains minimum kiln cooling during 14-day acute water curtailment",
    lineage: isP2Funded
      ? "Kiln Conversion PO #SLG-4401"
      : "District Industrial Water Tanker Contract",
  });

  // Indicator 3: Supply Chain Resilience (P3)
  brsrSheet.addRow({
    mandate: "Leadership Indicator 2: Value Chain Resilience & Climate Hardening",
    initiative: isP3Funded
      ? "P3: Clinker Buffer Silos (P07 Nagpur, P08 Solapur, P09 Hubli)"
      : "P3 Deferred: Priority Rail Rake Logistics Leasing",
    classification: isP3Funded
      ? "Capex (Infrastructure Asset Block)"
      : "Opex (Logistics Priority Service)",
    capex: isP3Funded ? 90 : 0,
    opex: isP3Funded ? 0 : 12,
    impact: isP3Funded
      ? "Expands clinker inventory buffer from 10 to 25 days; insulates 3 grinding units from rail washouts"
      : "Guarantees emergency rail rakes during 10-day monsoon track blockages",
    lineage: isP3Funded
      ? "Civil Works Milestone Gate #CW-P07"
      : "CONCOR Dedicated Freight Corridor SLA",
  });

  // Total Summary Row
  brsrSheet.addRow({
    mandate: "TOTAL STATUTORY ENVIRONMENTAL ALLOCATION",
    initiative: `${plan.funded.length} Projects Funded (${plan.label})`,
    classification: `Idle Capital: ₹${plan.idle} Cr`,
    capex: plan.cost,
    opex: plan.deferred.reduce((sum, p) => sum + (p.id === "P1" ? 42 : p.id === "P2" ? 18 : 12), 0),
    impact: `Retires ₹${plan.retired} Cr/yr annual risk; Residual ₹${plan.residual} Cr/yr`,
    lineage: "Statutory Auditor Assurance Standard: Ind AS 37 & SEBI BRSR Core",
  });

  // ==========================================
  // SHEET 2: IFRS S2 Climate-related Disclosures
  // ==========================================
  const ifrsSheet = workbook.addWorksheet("IFRS_S2_Strategy_Capital");
  ifrsSheet.columns = [
    { header: "IFRS S2 Disclosure Pillar", key: "pillar", width: 36 },
    { header: "Disclosure Line Item / Metric", key: "metric", width: 44 },
    { header: "Financial Exposure (INR Cr)", key: "financial", width: 28 },
    { header: "Technical & Scenario Basis", key: "basis", width: 54 },
    { header: "Balance Sheet Accounting Lineage (Ind AS)", key: "lineage", width: 38 },
  ];

  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 13: Scenario Analysis",
    metric: "Gross Climate Risk Exposure (2040 Horizon)",
    financial: plan.gross,
    basis: `Evaluated under ${scenario} (CMIP6 Downscaled Climate Model Pathways)`,
    lineage: "Ind AS 36 (Impairment Testing Baseline)",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 14: Transition Risk",
    metric: "Statutory Carbon Price Liability (India BEE CCTS)",
    financial: 271,
    basis: "BEE CCTS Mandate binding at 0.65 t/t clinker; penalty at ₹4,500/t deficit",
    lineage: "Ind AS 37 (Provisions & Contingent Liabilities)",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 14: Physical Risk",
    metric: "Multi-Hazard Stoppage Loss & Direct Asset Damage",
    financial: plan.gross - 271,
    basis: "WRI Aqueduct 4.0 water drought + IMD river floods + extreme heat derating",
    lineage: "Ind AS 16 (Carrying Value of Industrial Kilns & Units)",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 21: Capital Deployment",
    metric: "Approved Climate Resilience Capital Envelope",
    financial: budget,
    basis: `Approved by Board of Directors under ${stance} strategic stance`,
    lineage: "Board Resolution Capital Authorization",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 21: Capital Deployment",
    metric: "Committed Capex Allocation to Resilience Assets",
    financial: plan.cost,
    basis: `Allocated across: ${plan.label || "No projects approved"}`,
    lineage: "Capital Work-in-Progress (CWIP)",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 21: Financial Effects",
    metric: "Gross Exposure Retired by Capex Projects",
    financial: -plan.retired,
    basis: "Annual financial exposure eliminated via permanent physical abatement",
    lineage: "Offset against balance-sheet contingent liability pool",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 21: Financial Effects",
    metric: "Residual Risk Remaining Post-Capex",
    financial: plan.residual,
    basis: "Gross Exposure minus Funded Annual Abatement",
    lineage: "Residual exposure under active monitoring",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 21: Financial Effects",
    metric: "Compensating Operational Controls (Opex Mitigation)",
    financial: -plan.mitigated,
    basis: "Conservative non-additive mitigation from operational workarounds",
    lineage: "Annual operating budget allocation",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 21: Net Financial Position",
    metric: "Net Unhedged Exposure on Balance Sheet",
    financial: plan.net,
    basis: "Net residual risk after combined capex and opex controls",
    lineage: "Audited footnote disclosure under Ind AS 37",
  });
  ifrsSheet.addRow({
    pillar: "IFRS S2 Paragraph 22: Capital Efficiency",
    metric: "Capital Benefit Multiple (Exposure Retired / Capex)",
    financial: plan.cost > 0 ? (plan.retired / plan.cost).toFixed(2) + "x" : "0.00x",
    basis: "Portfolio benefit-to-cost ratio (Full portfolio benchmark: 2.2x)",
    lineage: "Management Discussion & Analysis (MD&A) KPI",
  });

  const buffer = await workbook.xlsx.writeBuffer();
  download(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `Nimbus_SEBI_BRSR_and_IFRS_S2_Filing_${scenario.replace(/\s+/g, "_")}_${budget}Cr.xlsx`,
  );
}
export async function exportResolution(budget: number, stance: Stance, scenario: Scenario) {
  const { jsPDF } = await import("jspdf");
  const p = allocate(budget, stance, scenario);
  const pdf = new jsPDF();
  pdf.setFontSize(20);
  pdf.text("NIMBUS CEMENT LTD", 20, 25);
  pdf.setFontSize(13);
  pdf.text("Climate Risk & Capital Allocation | Board Resolution", 20, 37);
  pdf.setFontSize(10);
  const lines = [
    "DRAFT PROTOTYPE - FOR BOARD REVIEW",
    `Scenario: ${scenario} | Strategic stance: ${stance}`,
    `Approved envelope: INR ${budget} Cr | Committed: INR ${p.cost} Cr | Idle: INR ${p.idle} Cr`,
    "",
    "RESOLVED that the following climate-resilience projects are approved:",
    ...p.funded.map((x) => `${x.id}: ${x.name} - INR ${x.cost} Cr`),
    "",
    `Annual risk retired: INR ${p.retired} Cr`,
    `Annual capex residual: INR ${p.residual} Cr`,
    `Estimated annual opex mitigation: INR ${p.mitigated} Cr`,
    `Net annual exposure: INR ${p.net} Cr`,
    "",
    "Deferred projects remain subject to compensating operational controls.",
    "Quarterly disbursements are subject to milestone delivery gates.",
    "",
    "Illustrative scenario inputs; no independent audit or legal sign-off implied.",
    "",
    "Board Chair: __________________    CFO: __________________",
  ];
  let y = 52;
  for (const line of lines) {
    const wrapped = pdf.splitTextToSize(line, 170);
    pdf.text(wrapped, 20, y);
    y += wrapped.length * 5 + 4;
  }
  pdf.save(`Nimbus-Board-Resolution-${budget}Cr.pdf`);
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const planSummary = (budget: number, stance: Stance, scenario: Scenario) =>
  `${money(allocate(budget, stance, scenario).retired)} Cr/yr retired`;

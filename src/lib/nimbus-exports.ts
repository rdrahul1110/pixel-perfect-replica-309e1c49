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

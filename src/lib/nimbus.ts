export type Stance = "balanced" | "compliance" | "continuity";
export type Scenario = "2026 Baseline" | "2040 Trajectory" | "2040 Net Zero";
export const projects = [
  {
    id: "P1",
    name: "Captive Solar + Waste Heat Recovery",
    plant: "P01 · Raipur",
    cost: 450,
    retired: 820,
    category: "carbon",
    owner: "Energy & ESG",
    gate: "Solar EPC contract awarded",
    progress: 35,
    spent: 158,
    realised: 96,
  },
  {
    id: "P2",
    name: "Kiln Conversion to Slag Grinding",
    plant: "P05 · Gulbarga",
    cost: 280,
    retired: 520,
    category: "water",
    owner: "Plant Operations",
    gate: "Slag grinding equipment delivered",
    progress: 48,
    spent: 134,
    realised: 118,
  },
  {
    id: "P3",
    name: "Clinker Silo Buffer Expansion",
    plant: "P07–P09 · Grinding units",
    cost: 90,
    retired: 480,
    category: "cascade",
    owner: "Supply Chain",
    gate: "P07 silo civil works",
    progress: 65,
    spent: 59,
    realised: 162,
  },
] as const;
export type Project = (typeof projects)[number];
export const grossFor = (scenario: Scenario, overrideGross?: number) =>
  overrideGross ??
  (scenario === "2026 Baseline" ? 688 : scenario === "2040 Trajectory" ? 1515 : 2655);
export function portfolios(stance: Stance = "balanced", scenario: Scenario = "2040 Net Zero") {
  const scale = grossFor(scenario) / 2655;
  return Array.from({ length: 8 }, (_, mask) => {
    const funded = projects.filter((_, index) => (mask & (1 << index)) !== 0);
    const cost = funded.reduce((sum, p) => sum + p.cost, 0);
    const retired = Math.round(funded.reduce((sum, p) => sum + p.retired, 0) * scale);
    const score = funded.reduce(
      (sum, p) =>
        sum +
        p.retired *
          (stance === "compliance" && p.id === "P1"
            ? 3
            : stance === "continuity" && p.id !== "P1"
              ? 2
              : 1),
      0,
    );
    return {
      mask,
      funded,
      cost,
      retired,
      score,
      label: funded.map((p) => p.id).join(" + ") || "No capex",
    };
  });
}
export function allocate(
  budget: number,
  stance: Stance = "balanced",
  scenario: Scenario = "2040 Net Zero",
  overrideGross?: number,
) {
  const options = portfolios(stance, scenario);
  const best =
    options
      .filter((p) => p.cost <= budget)
      .sort((a, b) => b.score - a.score || a.cost - b.cost)[0] ?? options[0];
  if (!best) throw new Error("Missing empty portfolio");
  const deferred = projects.filter((p) => !best.funded.includes(p));
  const currentGross = grossFor(scenario, overrideGross);
  const mitigated = Math.round(
    (deferred.reduce((sum, p) => sum + (p.id === "P1" ? 320 : p.id === "P2" ? 120 : 80), 0) *
      currentGross) /
      2655,
  );
  const next = options
    .filter((p) => p.cost > budget && p.score > best.score)
    .sort((a, b) => a.cost - b.cost)[0];
  return {
    ...best,
    deferred,
    idle: budget - best.cost,
    gross: currentGross,
    residual: currentGross - best.retired,
    mitigated,
    net: currentGross - best.retired - mitigated,
    next,
  };
}
export const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export type Plant = {
  id: string;
  name: string;
  location: string;
  type: "Integrated kiln" | "Grinding unit";
  capacity: number;
  risk: number;
  dominant: string;
  category: string;
  severity: "Critical" | "High" | "Moderate";
  buffer: number;
  breakdown: number[];
};
export const plants: Plant[] = [
  {
    id: "P01",
    name: "Raipur Mega Integrated",
    location: "Chhattisgarh",
    type: "Integrated kiln",
    capacity: 3.2,
    risk: 487,
    dominant: "BEE CCTS Carbon Cap · 0.95 t/t",
    category: "carbon",
    severity: "Critical",
    buffer: 7,
    breakdown: [320, 60, 42, 40, 25],
  },
  {
    id: "P02",
    name: "Bilaspur Integrated",
    location: "Chhattisgarh",
    type: "Integrated kiln",
    capacity: 2.4,
    risk: 142,
    dominant: "Water Stress & Heat",
    category: "water",
    severity: "Moderate",
    buffer: 20,
    breakdown: [30, 58, 12, 32, 10],
  },
  {
    id: "P03",
    name: "Sambalpur Integrated",
    location: "Odisha",
    type: "Integrated kiln",
    capacity: 2.8,
    risk: 98,
    dominant: "Mahanadi River Flood",
    category: "flood",
    severity: "Moderate",
    buffer: 18,
    breakdown: [20, 10, 48, 12, 8],
  },
  {
    id: "P04",
    name: "Chandrapur Integrated",
    location: "Maharashtra",
    type: "Integrated kiln",
    capacity: 2.6,
    risk: 210,
    dominant: "Groundwater Depletion · 28d shutdown",
    category: "water",
    severity: "High",
    buffer: 16,
    breakdown: [40, 120, 12, 28, 10],
  },
  {
    id: "P05",
    name: "Gulbarga Integrated",
    location: "Karnataka",
    type: "Integrated kiln",
    capacity: 3,
    risk: 320,
    dominant: "Critical Water Drought & Coal Cost",
    category: "water",
    severity: "Critical",
    buffer: 14,
    breakdown: [115, 130, 20, 40, 15],
  },
  {
    id: "P06",
    name: "Bellary Integrated",
    location: "Karnataka",
    type: "Integrated kiln",
    capacity: 2.5,
    risk: 190,
    dominant: "Heat Derate & Corridor Dispatch",
    category: "heat",
    severity: "High",
    buffer: 12,
    breakdown: [60, 30, 20, 55, 25],
  },
  {
    id: "P07",
    name: "Nagpur Grinding Unit",
    location: "Maharashtra",
    type: "Grinding unit",
    capacity: 1.5,
    risk: 115,
    dominant: "Clinker Starvation · 7 days cover",
    category: "cascade",
    severity: "Critical",
    buffer: 7,
    breakdown: [12, 8, 15, 10, 70],
  },
  {
    id: "P08",
    name: "Solapur Grinding Unit",
    location: "Maharashtra",
    type: "Grinding unit",
    capacity: 1.2,
    risk: 85,
    dominant: "Supply Cascade & Rain Delays",
    category: "cascade",
    severity: "High",
    buffer: 12,
    breakdown: [10, 10, 20, 10, 35],
  },
  {
    id: "P09",
    name: "Hubli Grinding Unit",
    location: "Karnataka",
    type: "Grinding unit",
    capacity: 1.4,
    risk: 78,
    dominant: "Rail Rake Logistics Slip",
    category: "flood",
    severity: "Moderate",
    buffer: 15,
    breakdown: [10, 8, 18, 12, 30],
  },
];
export const riskCategories = [
  { name: "Carbon / transition", key: "carbon" },
  { name: "Water drought", key: "water" },
  { name: "Floods & cyclones", key: "flood" },
  { name: "Heatwave", key: "heat" },
  { name: "Clinker cascade", key: "cascade" },
];
export const controls = [
  {
    project: "P1",
    days: "30 Days",
    name: "Group-Captive Solar PPA",
    mechanism: "Reduce",
    owner: "Energy Head",
    opex: 42,
    benefit: "45% carbon penalty reduction¹",
    ttl: "30 days",
  },
  {
    project: "P2",
    days: "30 Days",
    name: "Water Tanker Contingency",
    mechanism: "Shift",
    owner: "Plant GM",
    opex: 18,
    benefit: "₹120 Cr / yr",
    ttl: "30 days",
  },
  {
    project: "P3",
    days: "30 Days",
    name: "Emergency Clinker Road Dispatch",
    mechanism: "Shift",
    owner: "Supply Chain",
    opex: 12,
    benefit: "₹80 Cr / yr",
    ttl: "14 days",
  },
  {
    project: "P1",
    days: "60 Days",
    name: "Raise PPC / PSC Blended Cement Ratio",
    mechanism: "Reduce",
    owner: "Commercial Head",
    opex: 8,
    benefit: "6% lower clinker factor",
    ttl: "60 days",
  },
  {
    project: "P1",
    days: "90+ Days",
    name: "CCC Carbon Credit Forward Hedge",
    mechanism: "Hedge",
    owner: "Treasury",
    opex: 6,
    benefit: "Carbon price volatility capped",
    ttl: "90 days",
  },
];
export function floodShock(days = 14, buffer = 7) {
  return {
    starvationDay: buffer,
    downtime: Math.max(0, days - buffer),
    loss: Math.round(((Math.max(0, days - buffer) * 18.6) / 7) * 10) / 10,
  };
}

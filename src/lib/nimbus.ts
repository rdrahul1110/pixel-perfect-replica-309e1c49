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

export type AuditDocument = {
  id: string;
  title: string;
  docType: "EPC Turnkey Contract" | "Milestone Tax Invoice" | "Physical Site Inspection";
  vendor: string;
  amount: string;
  date: string;
  verifiedBy: string;
  sha256Hash: string;
  fileSize: string;
  notes: string;
};

export const projectAuditEvidence: Record<string, AuditDocument[]> = {
  P1: [
    {
      id: "DOC-P1-01",
      title: "Solar EPC Master Turnkey Agreement",
      docType: "EPC Turnkey Contract",
      vendor: "Tata Power Solar Systems Ltd",
      amount: "₹450.00 Cr (Committed)",
      date: "14-Jul-2026",
      verifiedBy: "Meera Iyer (Head ESG) & CFO Office",
      sha256Hash: "8a4f91e2bc8041d8a1c902",
      fileSize: "4.2 MB",
      notes: "Board-approved turnkey contract for 120MW captive solar + Raipur kiln waste heat recovery system.",
    },
    {
      id: "DOC-P1-02",
      title: "Milestone 1 Tax Invoice (Civil Works & Inverters)",
      docType: "Milestone Tax Invoice",
      vendor: "Tata Power Solar Systems Ltd",
      amount: "₹96.50 Cr (Disbursed)",
      date: "28-Sep-2026",
      verifiedBy: "Deloitte Statutory Audit Team",
      sha256Hash: "7c3b29af18d99042e11108",
      fileSize: "1.8 MB",
      notes: "Invoice #TPS-2026-9041 cleared following delivery of 33kV substation switchgear and solar inverters.",
    },
    {
      id: "DOC-P1-03",
      title: "Physical Site Engineering Verification Certificate",
      docType: "Physical Site Inspection",
      vendor: "Nimbus Engineering Inspection Bureau",
      amount: "42 MW Erected (35% Gate)",
      date: "10-Nov-2026",
      verifiedBy: "Rajesh Sharma (Raipur Plant General Manager)",
      sha256Hash: "2f8a10d94ac1092e0ee41",
      fileSize: "8.4 MB",
      notes: "Drone-surveyed installation of module mounting structures and WHR heat-exchanger foundation civil works.",
    },
  ],
  P2: [
    {
      id: "DOC-P2-01",
      title: "Vertical Roller Mill (VRM) Supply & Erection Contract",
      docType: "EPC Turnkey Contract",
      vendor: "FLSmidth India Pvt Ltd",
      amount: "₹280.00 Cr (Committed)",
      date: "02-May-2026",
      verifiedBy: "Procurement Committee & CFO",
      sha256Hash: "5e1a89c42bd8901aa3412",
      fileSize: "5.1 MB",
      notes: "Contract for kiln conversion to dry slag grinding, eliminating 28-day dry season water shutdown risk.",
    },
    {
      id: "DOC-P2-02",
      title: "VRM Equipment Delivery & Customs Clearance Voucher",
      docType: "Milestone Tax Invoice",
      vendor: "FLSmidth India Pvt Ltd",
      amount: "₹82.40 Cr (Disbursed)",
      date: "19-Aug-2026",
      verifiedBy: "Internal Audit & Plant Operations",
      sha256Hash: "3b9f44a71cd0288bb1902",
      fileSize: "2.3 MB",
      notes: "Customs duty and port dispatch verification for heavy roller tires and drive gearbox at Gulbarga site.",
    },
    {
      id: "DOC-P2-03",
      title: "Slag Grinding Dry Run Inspection Sign-off",
      docType: "Physical Site Inspection",
      vendor: "Gulbarga Technical Review Cell",
      amount: "Mechanical Gate Complete (48%)",
      date: "04-Nov-2026",
      verifiedBy: "K. Ramanathan (Gulbarga Plant Head)",
      sha256Hash: "9d0a11e82ef4511ca8871",
      fileSize: "3.7 MB",
      notes: "Pre-commissioning vibration test passed on VRM foundation. Zero liquid discharge cooling verified.",
    },
  ],
  P3: [
    {
      id: "DOC-P3-01",
      title: "Clinker Silo Civil Construction & Slipform PO",
      docType: "EPC Turnkey Contract",
      vendor: "Larsen & Toubro Heavy Civil Infrastructure",
      amount: "₹90.00 Cr (Committed)",
      date: "18-Jan-2026",
      verifiedBy: "Supply Chain Head & CFO",
      sha256Hash: "1f8e77a90bc1294dd5518",
      fileSize: "6.0 MB",
      notes: "Construction of 3x 25,000-tonne clinker storage silos across Nagpur (P07), Solapur (P08), and Hubli (P09).",
    },
    {
      id: "DOC-P3-02",
      title: "P07 Nagpur Silo Civil Superstructure Milestone",
      docType: "Milestone Tax Invoice",
      vendor: "Larsen & Toubro Ltd",
      amount: "₹38.20 Cr (Disbursed)",
      date: "15-Sep-2026",
      verifiedBy: "Statutory Audit Team",
      sha256Hash: "6c2b19e48df1092cc7714",
      fileSize: "1.9 MB",
      notes: "Slipform pouring completed for 45m vertical concrete shell at Nagpur grinding unit.",
    },
    {
      id: "DOC-P3-03",
      title: "Conveyor Reclaimer Mechanical Integration Sign-off",
      docType: "Physical Site Inspection",
      vendor: "Nimbus Central Supply Logistics",
      amount: "65% Buffer Operational",
      date: "22-Oct-2026",
      verifiedBy: "Anil Deshmukh (Nagpur Unit Head)",
      sha256Hash: "4a7f02d18bc9910ee2219",
      fileSize: "4.1 MB",
      notes: "P07 clinker buffer expanded from 7 days to 20 days. Automated dust extraction commissioned.",
    },
  ],
};
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

export type DecisionSnapshot = {
  id: string; // SNAP-YYYYMMDD-HHMMSS
  timestamp: string;
  scenario: Scenario;
  stance: Stance;
  budget: number;
  cost: number;
  idle: number;
  retired: number;
  residual: number;
  mitigated: number;
  net: number;
  fundedIds: string[];
  fundedLabel: string;
  multiple: string;
  sha256Hash: string;
  persona: string;
};

export const SNAPSHOTS_STORAGE_KEY = "nimbus_locked_snapshots";

export function getStoredSnapshots(): DecisionSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDecisionSnapshot(snapshot: DecisionSnapshot): DecisionSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredSnapshots();
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)];
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearStoredSnapshots(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SNAPSHOTS_STORAGE_KEY);
  } catch {}
}

export function generateSnapshotId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `SNAP-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

export function generatePayloadHash(payload: object): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `sha256-${hex}x${Date.now().toString(16).slice(-4)}`;
}

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  Check,
  CircleAlert,
  Droplets,
  Factory,
  FileText,
  Flame,
  Info,
  Leaf,
  MapPin,
  Network,
  ShieldCheck,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  allocate,
  floodShock,
  money,
  plants,
  projects,
  riskCategories,
  type Plant,
  type Scenario,
  type Stance,
} from "@/lib/nimbus";
import { type BackendPortfolioResponse } from "@/lib/api";

export const RiskIcon = ({ category, size = 14 }: { category: string; size?: number }) => {
  const Icon =
    category === "carbon"
      ? Leaf
      : category === "water"
        ? Droplets
        : category === "heat"
          ? Flame
          : category === "flood"
            ? Waves
            : Network;
  return <Icon size={size} />;
};
export function RiskStrip({ values }: { values: number[] }) {
  const total = values.reduce((a, b) => a + b, 0);
  let offset = 0;
  return (
    <svg
      className="risk-strip"
      viewBox="0 0 100 5"
      preserveAspectRatio="none"
      role="img"
      aria-label="Carbon, water, flood, heat and cascade exposure breakdown"
    >
      {values.map((v, i) => {
        const x = offset;
        const width = (v / total) * 100;
        offset += width;
        return (
          <rect
            key={i}
            x={x}
            y="0"
            width={Math.max(0, width - 0.6)}
            height="5"
            className={`risk-segment ${riskCategories[i]?.key ?? "carbon"}`}
          />
        );
      })}
    </svg>
  );
}
export function Exposure({
  budget,
  stance,
  scenario,
  backendData,
  onPlanner,
  onAudit,
  onExcel,
}: {
  budget: number;
  stance: Stance;
  scenario: Scenario;
  backendData?: BackendPortfolioResponse | null;
  onPlanner: () => void;
  onAudit: () => void;
  onExcel: () => void;
}) {
  const scenarioKey =
    scenario === "2026 Baseline"
      ? "today"
      : scenario === "2040 Trajectory"
        ? "2040_current"
        : "2040_net_zero";
  const liveGross = backendData
    ? Math.round(backendData.portfolio_summary.annual_exposure_cr[scenarioKey])
    : (scenario === "2026 Baseline" ? 688 : scenario === "2040 Trajectory" ? 1515 : 2655);
  const plan = allocate(budget, stance, scenario, liveGross);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("id");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [shock, setShock] = useState(false);
  const visible = plants
    .filter(
      (p) =>
        filter === "All" ||
        (filter === "Integrated Kilns" ? p.type === "Integrated kiln" : p.type === "Grinding unit"),
    )
    .sort((a, b) => (sort === "risk" ? b.risk - a.risk : a.id.localeCompare(b.id)));
  const scale = plan.gross / 2655;
  const liveCarbonPenalty = backendData
    ? Math.round(backendData.portfolio_summary.carbon_penalties_cr[scenarioKey])
    : (scenario === "2026 Baseline" ? 271 : Math.round(1623 * scale));
  const totalRevenue = backendData?.portfolio_summary.total_revenue_cr ?? 8660;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Climate intelligence · Nimbus Cement Ltd</div>
          <h1>Exposure, in perspective.</h1>
          <p className="subtitle">
            Nine plants. One connected view of climate risk and the capital that changes it.
          </p>
        </div>
        <div className="page-meta">
          <span className="status-dot" /> Scenario model
          <span className="meta-divider" />
          <span>FY 2026 → 2040</span>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">
            {scenario.startsWith("2026") ? "2026" : "2040"} Gross Annual Exposure
            <BarChart3 size={16} className="kpi-icon" />
          </div>
          <div className="kpi-value">
            {money(plan.gross)}
            <small>Cr / yr</small>
          </div>
          <p className="kpi-desc">
            +{Math.round((plan.gross / 688 - 1) * 100)}% vs ₹688 Cr today
            <br />
            {((plan.gross / totalRevenue) * 100).toFixed(1)}% revenue-equivalent exposure
          </p>
          <div className="kpi-bottom">
            <span className="badge critical">
              <CircleAlert size={10} />
              High Risk
            </span>
            <span className="subtitle">Gross, pre-capex</span>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">
            Near-Term CCTS Carbon Penalty
            <Leaf size={16} className="kpi-icon" />
          </div>
          <div className="kpi-value">
            {money(liveCarbonPenalty)}
            <small>Cr / yr</small>
          </div>
          <p className="kpi-desc">
            BEE deficit: 0.77 t/t vs 0.65 t/t cap
            <br />
            Ind AS 37 provision assessment
          </p>
          <div className="kpi-bottom">
            <span className="badge high">
              <CircleAlert size={10} />
              Regulatory Threat
            </span>
          </div>
        </div>
        <div className="kpi focus">
          <div className="kpi-label">
            Net Exposure Post-Capex
            <ShieldCheck size={16} className="kpi-icon" />
          </div>
          <div className="kpi-value">
            {money(plan.residual)}
            <small>Cr / yr</small>
          </div>
          <p className="kpi-desc">
            {Math.round((plan.retired / plan.gross) * 100)}% risk retired · {money(budget)} Cr
            envelope
            <br />
            Full ₹820 Cr plan targets ₹835 Cr / yr
          </p>
          <div className="kpi-bottom">
            <span className="badge teal">
              <Check size={10} />
              Capital-linked
            </span>
            <Button variant="link" className="inline-action" onClick={onPlanner}>
              Open in Planner
              <ArrowRight />
            </Button>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">
            Lowest Clinker Buffer
            <Network size={16} className="kpi-icon" />
          </div>
          <div className="kpi-value">
            10<small>Days · policy floor</small>
          </div>
          <p className="kpi-desc">
            P01 → P07 under flood / rake threat
            <br />
            Actual P07 cover: 7 days, below floor
          </p>
          <div className="kpi-bottom">
            <span className="badge high">
              <CircleAlert size={10} />
              Operational Alert
            </span>
          </div>
        </div>
      </div>
      <section className="panel bridge">
        <div className="panel-heading">
          <div className="heading-label">
            <BarChart3 />
            Audit Lineage & Calculation Bridge
          </div>
          <span className="badge teal">
            <ShieldCheck size={11} />
            Ind AS 36 / 37 aligned
          </span>
        </div>
        <div className="bridge-grid">
          <div className="bridge-col">
            <div className="bridge-step">
              01 &nbsp; GROSS {scenario.startsWith("2026") ? "2026" : "2040"} RISK
            </div>
            <div className="bridge-value">
              + {money(plan.gross)} <span>Cr / yr</span>
            </div>
            <div className="mini-breakdown">
              {[
                { name: "Carbon", key: "carbon", val: backendData ? Math.round(backendData.portfolio_summary.carbon_penalties_cr[scenarioKey]) : Math.round(1623 * scale) },
                { name: "Water", key: "water", val: backendData ? Math.round(backendData.portfolio_summary.water_revenue_loss_cr[scenarioKey]) : Math.round(436 * scale) },
                { name: "Flood", key: "flood", val: backendData ? Math.round(backendData.portfolio_summary.flood_cyclone_loss_cr[scenarioKey]) : Math.round(257 * scale) },
                { name: "Heat", key: "heat", val: backendData ? Math.round(backendData.portfolio_summary.heat_revenue_loss_cr[scenarioKey]) : Math.round(224 * scale) },
                { name: "Cascade", key: "cascade", val: backendData ? Math.round(backendData.portfolio_summary.cascade_revenue_loss_cr[scenarioKey]) : Math.round(115 * scale) },
              ].map((item) => (
                <span className="legend-item" key={item.key}>
                  <span className={`legend-dot ${item.key}`} />
                  {item.name} {money(item.val)}
                </span>
              ))}
            </div>
          </div>
          <div className="bridge-col">
            <div className="bridge-step">02 &nbsp; LESS FUNDED CAPEX ABATEMENT</div>
            <div className="bridge-value teal">
              − {money(plan.retired)} <span>Cr / yr</span>
            </div>
            <div className="mini-breakdown">
              {plan.funded.map((p) => (
                <span key={p.id} className="legend-item">
                  <span className={`legend-dot ${p.category}`} />
                  {p.id} {p.id === "P1" ? "Solar" : p.id === "P2" ? "Slag" : "Buffers"} −
                  {money(Math.round(p.retired * scale))}
                </span>
              ))}
              {!plan.funded.length && <span>No projects inside this envelope</span>}
            </div>
          </div>
          <div className="bridge-col">
            <div className="bridge-step">03 &nbsp; NET RESIDUAL, POST-CAPEX</div>
            <div className="bridge-value">
              = {money(plan.residual)} <span>Cr / yr</span>
            </div>
            <div className="mini-breakdown">
              {budget === 820
                ? "Heat ₹224 · Flood ₹257 · Drought ₹220 · Emissions ₹134"
                : `${money(plan.mitigated)} Cr further opex mitigation available · ${money(plan.net)} Cr net`}
            </div>
          </div>
        </div>
        <div className="bridge-footer">
          <p>
            Gross annual exposure − funded project abatement = residual risk. No double counting.
          </p>
          <div className="bridge-actions">
            <Button variant="link" className="inline-action" onClick={onAudit}>
              <FileText />
              Auditor Lineage
            </Button>
            <Button variant="link" className="inline-action" onClick={onExcel}>
              <ArrowDownToLine />
              Reconciliation Excel
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>Nine plants. Distinct risk profiles.</h2>
            <p>Asset-level exposure and the dependencies beneath it.</p>
          </div>
          <div className="matrix-legend">
            {riskCategories.map((c) => (
              <span className="legend-item" key={c.key}>
                <span className={`legend-dot ${c.key}`} />
                {c.name
                  .replace(" / transition", "")
                  .replace(" drought", "")
                  .replace(" & cyclones", "")
                  .replace("wave", "")
                  .replace("Clinker ", "")}
              </span>
            ))}
          </div>
        </div>
        <div className="matrix-controls">
          <div className="filter-group">
            {["All", "Integrated Kilns", "Grinding Units"].map((f, i) => (
              <Button
                key={f}
                variant="ghost"
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f} ({[9, 6, 3][i]})
              </Button>
            ))}
          </div>
          <select
            aria-label="Sort plants"
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="id">Sort by: Plant ID</option>
            <option value="risk">Sort by: Highest ₹ Risk</option>
          </select>
        </div>
        <div className="plant-grid">
          {visible.map((p) => (
            <article
              className="plant-card"
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`View ${p.id} ${p.name}`}
              onClick={() => setSelected(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(p);
                }
              }}
            >
              <div className="plant-top">
                <div className="plant-id">
                  <Factory />
                  {p.id}
                  <span>
                    · {p.type === "Integrated kiln" ? "INTEGRATED KILN" : "GRINDING UNIT"}
                  </span>
                </div>
                <span className={`badge ${p.severity.toLowerCase()}`}>{p.severity}</span>
              </div>
              <h3>{p.name}</h3>
              <p className="plant-location">
                <MapPin size={10} />
                {p.location}
                <span>· {p.capacity.toFixed(1)} MTPA</span>
              </p>
              <div className="plant-value">
                {money(Math.round(p.risk * scale))}
                <small> Cr / yr</small>
              </div>
              <RiskStrip values={p.breakdown} />
              <div className={`dominant ${p.category}`}>
                <RiskIcon category={p.category} />
                {p.dominant}
              </div>
              <div className="plant-footer">
                <span>
                  {p.id === "P01"
                    ? "Ind AS 36 watchlist"
                    : p.type === "Grinding unit"
                      ? "Clinker-linked exposure"
                      : "Asset-level assessment"}
                </span>
                <ArrowRight />
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="corridor-section">
        <div className="section-heading">
          <div>
            <h2>Clinker supply chain & buffer clock</h2>
            <p>When the mother plant stops, the clock starts at the grinding unit.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShock(!shock)}>
            <Zap />
            {shock ? "Reset flood simulation" : "Simulate 14-day P01 flood"}
          </Button>
        </div>
        <div className="panel">
          <div className="corridors">
            {[
              {
                from: "P01 Raipur",
                to: "P07 Nagpur",
                days: 7,
                status: "Critical",
                cls: "critical",
              },
              { from: "P06 Bellary", to: "P08 Solapur", days: 12, status: "Warning", cls: "high" },
              { from: "P06 Bellary", to: "P09 Hubli", days: 15, status: "Stable", cls: "moderate" },
            ].map((c, i) => (
              <div className="corridor" key={c.to}>
                <div className="corridor-line">
                  <span className="node">
                    <Factory />
                  </span>
                  <span className="rail">
                    <ArrowRight />
                  </span>
                  <span className="node">
                    <Network />
                  </span>
                </div>
                <div className="corridor-name">
                  {c.from} → {c.to}
                </div>
                <div className="corridor-detail">Integrated mother → Grinding daughter</div>
                <div className="buffer">
                  <strong>
                    {shock && i === 0 ? 0 : c.days} <small>days cover</small>
                  </strong>
                  <span className={`badge ${c.cls}`}>
                    {shock && i === 0 ? "Starved on day 7" : c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {shock && (
            <div className="shock-message" role="status">
              <Zap size={18} />
              <div>
                <strong>P07 starves on day {floodShock().starvationDay}.</strong> A 14-day P01 flood
                causes {floodShock().downtime} days of grinding downtime and{" "}
                <strong>₹18.6 Cr cascading EBITDA loss.</strong> Buffer expansion is the proposed
                countermeasure.
              </div>
            </div>
          )}
        </div>
      </section>
      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="drawer-content">
          {selected && (
            <>
              <div className="eyebrow drawer-eyebrow">
                {selected.id} · {selected.type}
              </div>
              <SheetTitle>{selected.name}</SheetTitle>
              <SheetDescription>
                {selected.location} · {selected.capacity} MTPA · {scenario}
              </SheetDescription>
              <div className="drawer-risk">
                {money(Math.round(selected.risk * scale))}
                <small> Cr / year</small>
              </div>
              <span className={`badge ${selected.severity.toLowerCase()}`}>
                {selected.severity} exposure
              </span>
              <div className="drawer-section">
                <h3>Five-risk exposure breakdown</h3>
                {riskCategories.map((c, i) => (
                  <div className="breakdown-row" key={c.key}>
                    <span className={`dominant ${c.key}`}>
                      <RiskIcon category={c.key} />
                      {c.name}
                    </span>
                    <strong>{money(Math.round((selected.breakdown[i] ?? 0) * scale))} Cr</strong>
                    <RiskStrip values={selected.breakdown.map((v, j) => (i === j ? v : 0))} />
                  </div>
                ))}
                <p>Plant breakdowns are illustrative allocations of the supplied asset totals.</p>
              </div>
              <div className="drawer-section">
                <h3>Clinker corridors & uptime</h3>
                <p>
                  {selected.id === "P01" || selected.id === "P07"
                    ? "P01 Raipur → P07 Nagpur. P07 has 7 days of physical cover. A 14-day flood causes ₹18.6 Cr cascade loss."
                    : ["P06", "P08", "P09"].includes(selected.id)
                      ? "P06 Bellary → P08 Solapur (12 days) and P09 Hubli (15 days)."
                      : `Local clinker cover: ${selected.buffer} days. Dispatch depends on road and rail availability.`}
                </p>
              </div>
              <div className="drawer-section">
                <h3>Proposed interventions</h3>
                <p>
                  {selected.id === "P01"
                    ? "P1 · Captive Solar + WHR: ₹450 Cr capex. Group-captive solar PPA is the deferred-project hedge."
                    : selected.id === "P05"
                      ? "P2 · Slag grinding conversion: ₹280 Cr capex. Emergency water arrangements preserve continuity."
                      : selected.type === "Grinding unit"
                        ? "P3 · Clinker silo expansion: ₹90 Cr across P07–P09. Emergency road dispatch is the operational hedge."
                        : "Heat and water resilience, flood insurance and dispatch contingencies. Plant-specific cost estimates require diligence."}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelected(null);
                    onPlanner();
                  }}
                >
                  Review capital plan
                  <ArrowRight />
                </Button>
              </div>
              <div className="drawer-section">
                <h3>Ind AS 36 impairment note</h3>
                <div className="drawer-callout">
                  <Info size={14} className="mb-2" />
                  {selected.id === "P01"
                    ? "Watchlist: carbon-cap compliance may reduce future cash flows. Reassess the cash-generating unit against recoverable value."
                    : "Consider climate-related downtime and input costs in cash-generating-unit forecasts. Test recoverable amount if impairment indicators arise."}{" "}
                  This prototype is not an independently verified accounting opinion.
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

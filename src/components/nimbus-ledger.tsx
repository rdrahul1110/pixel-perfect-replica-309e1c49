import { ArrowDownToLine, CheckCircle2, ClipboardList, FileSpreadsheet, Info, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { allocate, money, type Scenario, type Stance } from "@/lib/nimbus";
export function Ledger({
  budget,
  stance,
  scenario,
  locked,
  onExcel,
  onBRSR,
  onPlanner,
}: {
  budget: number;
  stance: Stance;
  scenario: Scenario;
  locked: boolean;
  onExcel: () => void;
  onBRSR?: () => void;
  onPlanner: () => void;
}) {
  const p = allocate(budget, stance, scenario);
  const spent = p.funded.reduce((s, x) => s + x.spent, 0),
    realised = p.funded.reduce((s, x) => s + x.realised, 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Capital accountability · FY 2026 Q3</div>
          <h1>From approval to impact.</h1>
          <p className="subtitle">
            Quarterly capital deployment, delivery gates and realised climate benefits.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="outline" size="sm" onClick={onExcel}>
            <ArrowDownToLine size={14} className="mr-1" />
            Export ledger
          </Button>
          {onBRSR && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBRSR}
              style={{
                borderColor: "#0F766E",
                color: "#0F766E",
                backgroundColor: "#F0FDFA",
                fontWeight: 600,
              }}
              title="Download SEBI BRSR Principle 6 & IFRS S2 statutory compliance pack"
            >
              <FileSpreadsheet size={14} className="mr-1 text-teal-700" />
              Export SEBI BRSR & IFRS S2
            </Button>
          )}
        </div>
      </div>
      <div className="lock-banner">
        {locked ? <LockKeyhole size={16} /> : <Info size={16} />}
        {locked
          ? "Locked decision · Approved portfolio for this session"
          : "Draft decision · Linked to the current capital envelope"}
        <Button variant="link" size="sm" onClick={onPlanner}>
          Review plan
        </Button>
      </div>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">
            Approved Capital
            <ClipboardList size={16} />
          </div>
          <div className="kpi-value">
            {money(p.cost)}
            <small>Cr</small>
          </div>
          <p className="kpi-desc">{p.funded.length} projects in the current portfolio</p>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tranche Spent</div>
          <div className="kpi-value">
            {money(spent)}
            <small>Cr</small>
          </div>
          <p className="kpi-desc">
            {p.cost ? Math.round((spent / p.cost) * 100) : 0}% of approved project capital
          </p>
        </div>
        <div className="kpi focus">
          <div className="kpi-label">
            Realised Loss Avoided
            <CheckCircle2 size={16} />
          </div>
          <div className="kpi-value">
            {money(realised)}
            <small>Cr</small>
          </div>
          <p className="kpi-desc">Illustrative quarter-to-date benefits</p>
        </div>
        <div className="kpi">
          <div className="kpi-label">Exposure Retired / Capital</div>
          <div className="kpi-value">
            {p.cost ? (p.retired / p.cost).toFixed(1) : "0.0"}
            <small>×</small>
          </div>
          <p className="kpi-desc">
            Annual promised abatement / approved capex
            <br />
            Full portfolio benchmark: 2.2×
          </p>
        </div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div className="heading-label">
            <ClipboardList />
            Quarterly capex & benefits realisation
          </div>
          <span className="badge neutral">Q3 · FY 2026</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Project name",
                  "Approved capex",
                  "Tranche spent",
                  "Milestone delivery gate",
                  "Promised exposure retired",
                  "Realised loss avoided",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.funded.map((x) => (
                <tr key={x.id}>
                  <td>
                    {x.name}
                    <p className="subtitle">
                      {x.id} · {x.plant}
                    </p>
                  </td>
                  <td>{money(x.cost)} Cr</td>
                  <td>{money(x.spent)} Cr</td>
                  <td>
                    {x.gate}
                    <svg className="progress-track" viewBox="0 0 100 5" preserveAspectRatio="none">
                      <rect width="100" height="5" className="outcome-residual" />
                      <rect width={x.progress} height="5" className="outcome-retired" />
                    </svg>
                    <span className="subtitle">{x.progress}% complete</span>
                  </td>
                  <td>{money(Math.round((x.retired * p.gross) / 2655))} Cr / yr</td>
                  <td>{money(x.realised)} Cr</td>
                </tr>
              ))}
              {!p.funded.length && (
                <tr>
                  <td colSpan={6}>
                    No funded projects. Increase the capital envelope to unlock the first delivery
                    gate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Milestones, disbursements and realised benefits are illustrative prototype data. Actual
          quarterly reporting requires verified project records.
        </p>
      </section>
    </>
  );
}

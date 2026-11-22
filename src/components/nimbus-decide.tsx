import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Flag,
  GitCompareArrows,
  LockKeyhole,
  Calculator,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { allocate, controls, money, type Project, type Scenario, type Stance } from "@/lib/nimbus";

export function Decide({
  budget,
  setBudget,
  stance,
  setStance,
  scenario,
  onCompare,
  onMath,
  onLock,
  locked,
}: {
  budget: number;
  setBudget: (value: number) => void;
  stance: Stance;
  setStance: (value: Stance) => void;
  scenario: Scenario;
  onCompare: () => void;
  onMath: () => void;
  onLock: () => void;
  locked: boolean;
}) {
  const p = allocate(budget, stance, scenario);
  const [time, setTime] = useState("30 Days");
  const rows = controls.filter(
    (c) => c.days === time && p.deferred.some((project) => project.id === c.project),
  );
  const update = (n: number) =>
    setBudget(Math.min(820, Math.max(0, Math.round((Number.isFinite(n) ? n : 0) / 10) * 10)));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Boardroom mode · Capital allocation</div>
          <h1>Every rupee. A deliberate decision.</h1>
          <p className="subtitle">
            Set the envelope. Choose your stance. See what gets funded—and what remains exposed.
          </p>
        </div>
        <span className="badge teal">
          <ShieldCheck size={12} />8 portfolios · Exact optimisation
        </span>
      </div>
      {locked && (
        <div className="lock-banner">
          <LockKeyhole size={16} />
          Decision locked for this session. The quarterly ledger reflects this approved portfolio.
        </div>
      )}
      <section className="panel budget-panel">
        <div className="budget-top">
          <div>
            <div className="heading-label">
              <SlidersHorizontal />
              The capital envelope
            </div>
            <p className="subtitle">A full resilience plan requires ₹820 Cr.</p>
          </div>
          <label className="budget-input">
            Approved Budget: ₹
            <input
              aria-label="Approved budget"
              type="number"
              min="0"
              max="820"
              step="10"
              value={budget}
              onChange={(e) => update(e.target.valueAsNumber)}
            />
            Cr
          </label>
        </div>
        <input
          aria-label="Budget slider"
          className="budget-slider"
          type="range"
          min="0"
          max="820"
          step="10"
          value={budget}
          onChange={(e) => update(Number(e.target.value))}
        />
        <div className="slider-labels">
          <span>₹0 Cr</span>
          <span>₹410 Cr</span>
          <span>₹820 Cr</span>
        </div>
        <div className="preset-row">
          {[820, 600, 400, 250, 100].map((v) => (
            <Button
              size="sm"
              variant="outline"
              key={v}
              className={`preset ${budget === v ? "active" : ""}`}
              onClick={() => setBudget(v)}
            >
              {money(v)} Cr{v === 820 ? " · Full" : v === 100 ? " · Austerity" : ""}
            </Button>
          ))}
        </div>
        <div className="ribbon-label">
          <span>BEST-FIT PORTFOLIO BREAKPOINTS · BALANCED STANCE</span>
          <strong>
            {p.label} · {money(p.idle)} Cr idle capital
          </strong>
        </div>
        <div className="portfolio-ribbon">
          {[
            { label: "∅", cost: 0 },
            { label: "P3", cost: 90 },
            { label: "P2", cost: 280 },
            { label: "P2 + P3", cost: 370 },
            { label: "P1 + P3", cost: 540 },
            { label: "P1 + P2", cost: 730 },
            { label: "ALL", cost: 820 },
          ].map((x) => (
            <div key={x.cost} className={`ribbon-item ${p.cost === x.cost ? "selected" : ""}`}>
              {x.label}
              <small>{money(x.cost)} Cr</small>
            </div>
          ))}
        </div>
        <div className="stances">
          <b>Board strategic stance</b>
          {(
            [
              { id: "balanced", name: "Balanced" },
              { id: "compliance", name: "Statutory Compliance First" },
              { id: "continuity", name: "Operational Continuity First" },
            ] as const
          ).map((s) => (
            <label key={s.id}>
              <input
                type="radio"
                name="stance"
                value={s.id}
                checked={stance === s.id}
                onChange={() => setStance(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </section>
      <section className="panel outcome">
        <div className="eyebrow">Your boardroom brief</div>
        <p className="spoken">
          “At {money(budget)} Cr,{" "}
          {p.funded.length
            ? `we fund ${p.funded.map((x) => (x.id === "P1" ? "solar and waste heat recovery" : x.id === "P2" ? "the water-shutdown project" : "clinker buffers")).join(" and ")}`
            : "no capital project fits the envelope"}
          .{" "}
          {p.deferred.some((x) => x.id === "P1")
            ? `${money(Math.round((820 * p.gross) / 2655))} Cr/yr of carbon penalties remains unretired.`
            : `Carbon compliance is funded; ${money(p.residual)} Cr/yr of risk remains.`}
          ”
        </p>
        <svg
          className="risk-outcomes"
          viewBox="0 0 100 21"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Retired ${p.retired}, mitigated ${p.mitigated}, residual ${p.net} Cr per year`}
        >
          <rect x="0" width={(p.retired / p.gross) * 100} height="21" className="outcome-retired" />
          <rect
            x={(p.retired / p.gross) * 100}
            width={(p.mitigated / p.gross) * 100}
            height="21"
            className="outcome-mitigated"
          />
          <rect
            x={((p.retired + p.mitigated) / p.gross) * 100}
            width={(p.net / p.gross) * 100}
            height="21"
            className="outcome-residual"
          />
        </svg>
        <div className="outcome-legend">
          <span>
            <span className="legend-dot teal" /> Retired <strong>{money(p.retired)} Cr / yr</strong>
          </span>
          <span>
            <span className="legend-dot water" /> Opex-mitigated{" "}
            <strong>{money(p.mitigated)} Cr / yr</strong>
          </span>
          <span>
            <span className="legend-dot carbon" /> Residual <strong>{money(p.net)} Cr / yr</strong>
          </span>
        </div>
        {p.next ? (
          <div className="next-unlock">
            <Flag />
            <span>
              <b>NEXT UNLOCK</b> &nbsp; At {money(p.next.cost)} Cr (+{money(p.next.cost - budget)}{" "}
              Cr), re-optimise to <b>{p.next.label}</b>, retiring {money(p.next.retired)} Cr / yr (+
              {money(p.next.retired - p.retired)} Cr).{" "}
              {p.funded.filter((x) => !p.next?.funded.includes(x)).map((x) => `${x.id} out. `)}
              {p.next.funded.filter((x) => !p.funded.includes(x)).map((x) => `${x.id} in. `)}
            </span>
          </div>
        ) : (
          <div className="next-unlock">
            <CheckCircle2 />
            <span>
              Full portfolio funded. All ₹1,820 Cr / yr of modelled capex abatement unlocked.
            </span>
          </div>
        )}
      </section>
      <section className="project-split">
        <div>
          <h2>
            <CheckCircle2 size={16} className="text-primary" />
            FUNDED · GREENLIT
            <span>
              Spent: {money(p.cost)} / {money(budget)} Cr
            </span>
          </h2>
          <div className="project-list">
            {p.funded.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                funded
                budget={budget}
                scale={p.gross / 2655}
              />
            ))}
            {!p.funded.length && (
              <div className="empty-state">
                No capital projects funded. Compensating controls remain available below.
              </div>
            )}
          </div>
        </div>
        <div>
          <h2>
            <XCircle size={16} className="text-destructive" />
            DEFERRED · UNFUNDED
            <span>
              {p.deferred.length} project{p.deferred.length !== 1 ? "s" : ""}
            </span>
          </h2>
          <div className="project-list">
            {p.deferred.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                funded={false}
                budget={budget}
                scale={p.gross / 2655}
              />
            ))}
            {!p.deferred.length && (
              <div className="empty-state">
                All three projects are greenlit. No deferred capital interventions.
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="heading-label">
              <ShieldCheck />
              Opex compensating controls
            </div>
            <p className="subtitle">Deferred does not mean abandoned.</p>
          </div>
          <div className="filter-group">
            {["30 Days", "60 Days", "90+ Days"].map((t) => (
              <Button
                variant="ghost"
                className={`filter-btn ${time === t ? "active" : ""}`}
                key={t}
                onClick={() => setTime(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Control name",
                  "Mechanism",
                  "Owner",
                  "Opex / yr",
                  "Risk mitigated",
                  "Time to live",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>
                    <span className="badge neutral">{c.mechanism}</span>
                  </td>
                  <td>{c.owner}</td>
                  <td>{money(c.opex)} Cr</td>
                  <td>{c.benefit}</td>
                  <td>{c.ttl}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6}>No deferred-project controls in this timeframe.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          ¹ PPA mechanism target is 45%; the portfolio conservatively recognises ₹320 Cr / yr across
          carbon controls. Controls are not added together.
        </p>
      </section>
      <div className="action-bar">
        <div className="action-group">
          <Button variant="outline" onClick={onCompare}>
            <GitCompareArrows />
            Compare A / B / C
          </Button>
          <Button variant="outline" onClick={onMath}>
            <Calculator />
            Show Math
          </Button>
        </div>
        <Button onClick={onLock} className="lock-button">
          <LockKeyhole />
          Lock Decision & Export Board Resolution PDF
          <ArrowRight />
        </Button>
      </div>
    </>
  );
}
function ProjectCard({
  project: p,
  funded,
  budget,
  scale,
}: {
  project: Project;
  funded: boolean;
  budget: number;
  scale: number;
}) {
  return (
    <article className={`panel project ${funded ? "" : "deferred"}`}>
      <div className="project-header">
        <span className="project-id">{p.id}</span>
        <span className={`badge ${funded ? "teal" : "neutral"}`}>
          {funded ? "Capital approved" : "Operational hedge required"}
        </span>
      </div>
      <h3>{p.name}</h3>
      <p>
        {p.plant} · {p.owner}
      </p>
      <div className="project-stats">
        <span>{money(p.cost)} Cr capex</span>
        <strong>
          {money(Math.round(p.retired * scale))} Cr / yr {funded ? "retired" : "unretired"}
        </strong>
      </div>
      {!funded && (
        <div className="project-note">
          {p.cost > budget
            ? `Exceeds total envelope by ${money(p.cost - budget)} Cr.`
            : "Lower priority in the best-fit portfolio; funding requires a reallocation."}
        </div>
      )}
    </article>
  );
}

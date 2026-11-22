import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  BriefcaseBusiness,
  Activity,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Exposure } from "@/components/nimbus-exposure";
import { Decide } from "@/components/nimbus-decide";
import { Ledger } from "@/components/nimbus-ledger";
import { allocate, money, portfolios, type Scenario, type Stance } from "@/lib/nimbus";
import { exportExcel, exportResolution } from "@/lib/nimbus-exports";
import { syncWithBackend, type SyncStatus, BACKEND_ENDPOINT } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nimbus Cement | Climate Risk & Capital Cockpit" },
      {
        name: "description",
        content:
          "Explore nine-plant climate exposure, optimise a ₹820 Cr resilience portfolio and track quarterly capital benefits for Nimbus Cement.",
      },
      { property: "og:title", content: "Nimbus Cement | Climate Risk & Capital Cockpit" },
      {
        property: "og:description",
        content:
          "Connected climate risk, capital allocation and benefits realisation across nine cement plants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NimbusCockpit,
});

function NimbusCockpit() {
  const [tab, setTab] = useState("exposure");
  const [budget, setBudget] = useState(400);
  const [stance, setStance] = useState<Stance>("balanced");
  const [scenario, setScenario] = useState<Scenario>("2040 Net Zero");
  const [persona, setPersona] = useState("Meera (ESG Head)");
  const [modal, setModal] = useState<
    "audit" | "compare" | "math" | "lock" | "notifications" | "backend" | null
  >(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: "idle",
    endpoint: BACKEND_ENDPOINT,
  });

  useEffect(() => {
    let isMounted = true;
    setSyncStatus((prev) => ({ ...prev, state: "syncing" }));
    syncWithBackend(scenario, budget, stance).then(({ data, latencyMs, error }) => {
      if (!isMounted) return;
      if (data) {
        setSyncStatus({
          state: "connected",
          latencyMs,
          lastSync: new Date(),
          endpoint: BACKEND_ENDPOINT,
          data,
        });
      } else {
        setSyncStatus({
          state: "fallback",
          latencyMs,
          endpoint: BACKEND_ENDPOINT,
          error,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [scenario, budget, stance]);

  const p = allocate(budget, stance, scenario);
  const updateBudget = (value: number) => {
    setBudget(value);
    setLocked(false);
  };
  const updateStance = (value: Stance) => {
    setStance(value);
    setLocked(false);
  };
  const toPlanner = () => {
    setTab("decide");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const excel = async () => {
    setBusy(true);
    setNotice("");
    try {
      await exportExcel(budget, stance, scenario);
      setNotice("Excel workbook downloaded.");
    } catch {
      setNotice("The Excel download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const lock = async () => {
    setBusy(true);
    try {
      await exportResolution(budget, stance, scenario);
      setLocked(true);
      setModal(null);
      setNotice("Decision locked for this session. Board resolution downloaded.");
    } catch {
      setNotice("The PDF download failed. Your decision has not been locked.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <header className="app-header">
        <div className="brand-bar">
          <div className="brand">
            <div className="wordmark" aria-label="Oren">
              oren
            </div>
            <span className="brand-divider" />
            <div>
              <div className="app-title">Nimbus Climate Risk & Capital Cockpit</div>
              <div className="brand-subtitle">
                NIMBUS CEMENT LTD &nbsp; / &nbsp; 9 PLANTS &nbsp; / &nbsp; ₹8,800 CR REVENUE
              </div>
            </div>
          </div>
          <div className="header-right">
            <select
              className="select"
              aria-label="Climate scenario"
              value={scenario}
              onChange={(e) => {
                setScenario(e.target.value as Scenario);
                setLocked(false);
              }}
            >
              {["2026 Baseline", "2040 Trajectory", "2040 Net Zero"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              title="Risk notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={17} />
            </Button>
            <span className="profile-icon">
              {persona === "Meera (ESG Head)"
                ? "MK"
                : persona === "CFO"
                  ? "CF"
                  : persona === "Plant GM"
                    ? "GM"
                    : "SC"}
            </span>
            <select
              className="select persona"
              aria-label="View as persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            >
              {["Meera (ESG Head)", "CFO", "Supply Chain Head", "Plant GM"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="nav-bar">
          <nav className="primary-nav" aria-label="Cockpit views">
            {[
              { id: "exposure", label: "Exposure", Icon: BarChart3 },
              { id: "decide", label: "Decide", Icon: BriefcaseBusiness },
              { id: "ledger", label: "Ledger", Icon: ClipboardList },
            ].map((n, i) => (
              <Button
                variant="ghost"
                key={n.id}
                aria-current={tab === n.id ? "page" : undefined}
                className={`nav-tab ${tab === n.id ? "active" : ""}`}
                onClick={() => {
                  setTab(n.id);
                  setNotice("");
                }}
              >
                <n.Icon size={16} />
                <span className="nav-number">{i + 1}.</span>
                {n.label}
                {n.id === "decide" && <span className="boardroom">Boardroom Mode</span>}
              </Button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button
              variant="outline"
              size="sm"
              className="backend-sync-btn"
              onClick={() => setModal("backend")}
              title="Click to view live Oracle Cloud n8n calculation engine status"
              style={{
                height: "28px",
                padding: "0 10px",
                fontSize: "11px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "20px",
                border: syncStatus.state === "connected" ? "1px solid #CEEAD6" : "1px solid #E2E8F0",
                background: syncStatus.state === "connected" ? "#F0FDF4" : "#F8FAFC",
                color: syncStatus.state === "connected" ? "#15803D" : "#64748B",
              }}
            >
              <Server size={12} />
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    syncStatus.state === "connected"
                      ? "#16A34A"
                      : syncStatus.state === "syncing"
                        ? "#F59E0B"
                        : "#94A3B8",
                  display: "inline-block",
                }}
              />
              <span>
                {syncStatus.state === "connected"
                  ? `n8n Engine: Live (${syncStatus.latencyMs}ms)`
                  : syncStatus.state === "syncing"
                    ? "Syncing Engine…"
                    : "n8n Engine: Local Mode"}
              </span>
            </Button>
            <div className="plan-chip">
              <span className="status-dot" />
              <span>
                Plan:{" "}
                <b>
                  {money(budget)} Cr {locked ? "Locked" : "Approved"}
                </b>{" "}
                &nbsp;|&nbsp; Residual: <b>{money(p.residual)} Cr / yr</b>
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="main">
        {notice && (
          <div className="lock-banner" role="status">
            <Info size={15} />
            {notice}
          </div>
        )}
        {busy && (
          <div className="lock-banner" role="status">
            Preparing your download…
          </div>
        )}
        {tab === "exposure" && (
          <Exposure
            budget={budget}
            stance={stance}
            scenario={scenario}
            backendData={syncStatus.data}
            onPlanner={toPlanner}
            onAudit={() => setModal("audit")}
            onExcel={() => void excel()}
          />
        )}
        {tab === "decide" && (
          <Decide
            budget={budget}
            setBudget={updateBudget}
            stance={stance}
            setStance={updateStance}
            scenario={scenario}
            onCompare={() => setModal("compare")}
            onMath={() => setModal("math")}
            onLock={() => setModal("lock")}
            locked={locked}
          />
        )}
        {tab === "ledger" && (
          <Ledger
            budget={budget}
            stance={stance}
            scenario={scenario}
            locked={locked}
            onExcel={() => void excel()}
            onPlanner={toPlanner}
          />
        )}
        <footer className="app-footer">
          <span>
            <ShieldCheck size={12} />
            Nimbus Climate Intelligence · Decision-support prototype
          </span>
          <span>
            INR crores unless stated &nbsp; · &nbsp; Scenario & asset figures illustrative &nbsp; ·
            &nbsp; Powered by <b>oren</b>
          </span>
        </footer>
      </main>
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent className="modal-wide">
          {modal === "audit" && (
            <>
              <div className="eyebrow">Transparent by design</div>
              <DialogTitle>Auditor lineage & reconciliation</DialogTitle>
              <DialogDescription>
                Current plan: {scenario} · {money(budget)} Cr envelope.
              </DialogDescription>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Calculation step</th>
                      <th>Annual value</th>
                      <th>Lineage / basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Gross exposure</td>
                      <td>{money(p.gross)} Cr</td>
                      <td>Scenario risk register · Carbon, water, flood, heat, cascade</td>
                    </tr>
                    {p.funded.map((x) => (
                      <tr key={x.id}>
                        <td>
                          {x.id} · {x.name}
                        </td>
                        <td>−{money(Math.round((x.retired * p.gross) / 2655))} Cr</td>
                        <td>{money(x.cost)} Cr proposed intervention</td>
                      </tr>
                    ))}
                    <tr>
                      <td>Post-capex residual</td>
                      <td>{money(p.residual)} Cr</td>
                      <td>Gross minus capex abatement</td>
                    </tr>
                    <tr>
                      <td>Compensating controls</td>
                      <td>−{money(p.mitigated)} Cr</td>
                      <td>Conservative, non-additive opex mitigation</td>
                    </tr>
                    <tr>
                      <td>Post-opex residual</td>
                      <td>{money(p.net)} Cr</td>
                      <td>Post-capex residual minus opex mitigation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="notice">
                <b>Accounting assessment:</b> Ind AS 36 considers climate impairment indicators and
                cash-generating-unit forecasts. Ind AS 37 considers carbon compliance obligations.
                These figures have not been independently audited.
                <br />
                <b>Model notes:</b> The supplied nine asset totals sum to ₹1,725 Cr, not the ₹2,655
                Cr group gross. Asset cards therefore remain a separate register. Baseline and
                trajectory abatement scale proportionally; the ₹1,940 Cr trajectory is illustrative.
                ₹271 Cr is the near-term penalty, while ₹820 Cr is the P1 future annual abatement
                assumption. The 10-day KPI is a policy floor; actual P07 cover is 7 days.
              </div>
              <Button onClick={() => void excel()} disabled={busy}>
                <ArrowDownToLine />
                Download reconciliation Excel
              </Button>
            </>
          )}
          {modal === "math" && (
            <>
              <div className="eyebrow">The exact allocation engine</div>
              <DialogTitle>Eight portfolios. No guesswork.</DialogTitle>
              <DialogDescription>
                Current envelope {money(budget)} Cr · {stance} stance. All combinations are
                evaluated against the budget.
              </DialogDescription>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Portfolio</th>
                      <th>Capex</th>
                      <th>Annual risk retired</th>
                      <th>Weighted score</th>
                      <th>Envelope fit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolios(stance, scenario)
                      .sort((a, b) => a.cost - b.cost)
                      .map((x) => (
                        <tr key={x.mask}>
                          <td>
                            {x.label}
                            {x.mask === p.mask && <span className="badge teal ml-2">Best fit</span>}
                          </td>
                          <td>{money(x.cost)} Cr</td>
                          <td>{money(x.retired)} Cr / yr</td>
                          <td>{x.score.toLocaleString("en-IN")}</td>
                          <td>
                            <span className={`badge ${x.cost <= budget ? "teal" : "neutral"}`}>
                              {x.cost <= budget ? "Feasible" : "Over budget"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="notice">
                Balanced maximises total annual risk retired. Compliance weights P1 carbon abatement
                3×. Continuity weights P2 and P3 uptime abatement 2×. Equal scores favour lower
                capital cost. P1 alone (₹450 Cr) is the eighth portfolio, but never wins under the
                balanced stance.
              </div>
            </>
          )}
          {modal === "compare" && (
            <>
              <div className="eyebrow">Capital alternatives</div>
              <DialogTitle>Compare A / B / C</DialogTitle>
              <DialogDescription>
                Same {scenario} scenario and {stance} stance. Three board envelopes.
              </DialogDescription>
              <div className="comparison-grid">
                {[400, 600, 820].map((b, i) => {
                  const x = allocate(b, stance, scenario);
                  return (
                    <div className="compare-col" key={b}>
                      <h3>{["A · Essential", "B · Accelerated", "C · Full resilience"][i]}</h3>
                      <p>
                        Approved envelope<strong>{money(b)} Cr</strong>
                      </p>
                      <p>
                        Funded portfolio<strong>{x.label}</strong>
                      </p>
                      <p>
                        Annual risk retired<strong>{money(x.retired)} Cr</strong>
                      </p>
                      <p>
                        Residual after capex<strong>{money(x.residual)} Cr / yr</strong>
                      </p>
                      <p>Idle capital: {money(x.idle)} Cr</p>
                      <Button
                        variant="outline"
                        className="mt-5 w-full"
                        onClick={() => {
                          updateBudget(b);
                          setModal(null);
                          toPlanner();
                        }}
                      >
                        Use scenario {["A", "B", "C"][i]}
                        <ArrowRight />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {modal === "lock" && (
            <>
              <div className="eyebrow">Board decision</div>
              <DialogTitle>Lock the {money(budget)} Cr capital envelope?</DialogTitle>
              <DialogDescription>
                Approve {p.label} with {money(p.cost)} Cr committed and {money(p.idle)} Cr held in
                reserve.
              </DialogDescription>
              <div className="notice">
                <p>
                  <b>{money(p.retired)} Cr / yr</b> of exposure retired.
                </p>
                <p>
                  <b>{money(p.residual)} Cr / yr</b> residual after capital projects.
                </p>
                <p>
                  <b>{money(p.net)} Cr / yr</b> residual after operational hedges.
                </p>
                <br />
                This generates a draft board-resolution PDF and locks the decision for this session
                only. Changing the envelope, stance or scenario reopens the decision. Formal
                sign-off and shared record storage are not included in this prototype.
              </div>
              <Button onClick={() => void lock()} disabled={busy}>
                <LockKeyhole />
                {busy ? "Preparing PDF…" : "Lock decision & download PDF"}
              </Button>
            </>
          )}
          {modal === "notifications" && (
            <>
              <div className="eyebrow">Risk signals & Executive Takeaways</div>
              <DialogTitle>Oracle n8n Intelligence Alerts</DialogTitle>
              <DialogDescription>Nimbus Cement · Live calculated scenario assessment</DialogDescription>
              {syncStatus.data?.executive_takeaways?.length ? (
                syncStatus.data.executive_takeaways.map((takeaway, idx) => (
                  <div className="notice" key={idx}>
                    <b>Alert {idx + 1}</b>
                    <p>{takeaway}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="notice">
                    <b>P07 · Clinker buffer below policy floor</b>
                    <p>7 days actual cover vs 10 days policy minimum.</p>
                  </div>
                  <div className="notice">
                    <b>P01 · Carbon compliance watchlist</b>
                    <p>0.95 t/t emissions intensity. Review solar and waste heat recovery funding.</p>
                  </div>
                  <div className="notice">
                    <b>P04 · Groundwater shutdown risk</b>
                    <p>28-day modelled shutdown. Plant continuity measures need review.</p>
                  </div>
                </>
              )}
              <Button
                onClick={() => {
                  setModal(null);
                  toPlanner();
                }}
              >
                Review capital decision
                <ArrowRight />
              </Button>
            </>
          )}
          {modal === "backend" && (
            <>
              <div className="eyebrow">Enterprise Infrastructure</div>
              <DialogTitle>Oracle Cloud n8n Calculation Engine</DialogTitle>
              <DialogDescription>
                Live calculation workflow master engine running on Oracle Cloud Infrastructure (OCI).
              </DialogDescription>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <div style={{ background: "#F8FAFC", padding: "14px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px", lineHeight: "1.6" }}>
                  <div><b>Master Webhook:</b> <code style={{ color: "#0F766E", background: "#E6FFFA", padding: "2px 6px", borderRadius: "4px" }}>{BACKEND_ENDPOINT}</code></div>
                  <div><b>Workflow ID:</b> <code>gn3yVZ55AFALdFbG</code> (Active on Oracle VM)</div>
                  <div>
                    <b>Engine Status:</b>{" "}
                    <span style={{ color: syncStatus.state === "connected" ? "#16A34A" : "#D97706", fontWeight: 600 }}>
                      {syncStatus.state === "connected" ? `🟢 Live & Connected (${syncStatus.latencyMs}ms)` : "○ Local Audit Engine Active"}
                    </span>
                  </div>
                  {syncStatus.lastSync && (
                    <div style={{ color: "#64748B", fontSize: "12px" }}>
                      Last Synced: {syncStatus.lastSync.toLocaleTimeString()} · Method: POST (CORS enabled)
                    </div>
                  )}
                  {syncStatus.error && (
                    <div style={{ color: "#DC2626", fontSize: "11px", marginTop: "4px" }}>
                      Note: {syncStatus.error}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>
                    LIVE CALCULATION PAYLOAD FROM N8N:
                  </div>
                  <pre style={{ maxHeight: "220px", overflowY: "auto", background: "#0F172A", color: "#38BDF8", padding: "12px", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}>
                    {syncStatus.data ? JSON.stringify(syncStatus.data, null, 2) : "// Live backend query response available on connection."}
                  </pre>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSyncStatus((prev) => ({ ...prev, state: "syncing" }));
                    syncWithBackend(scenario, budget, stance).then(({ data, latencyMs, error }) => {
                      if (data) {
                        setSyncStatus({ state: "connected", latencyMs, lastSync: new Date(), endpoint: BACKEND_ENDPOINT, data });
                      } else {
                        setSyncStatus({ state: "fallback", latencyMs, endpoint: BACKEND_ENDPOINT, error });
                      }
                    });
                  }}
                >
                  <Activity size={14} className="mr-1" />
                  Re-test Engine
                </Button>
                <Button onClick={() => setModal(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

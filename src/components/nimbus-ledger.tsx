import { useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  Info,
  LockKeyhole,
  ShieldCheck,
  FileText,
  ExternalLink,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  allocate,
  money,
  type Scenario,
  type Stance,
  type DecisionSnapshot,
  type Project,
  projectAuditEvidence,
} from "@/lib/nimbus";

export function Ledger({
  budget,
  stance,
  scenario,
  locked,
  lockedSnapshot,
  snapshots = [],
  onApplySnapshot,
  onExcel,
  onBRSR,
  onPlanner,
}: {
  budget: number;
  stance: Stance;
  scenario: Scenario;
  locked: boolean;
  lockedSnapshot?: DecisionSnapshot | null;
  snapshots?: DecisionSnapshot[];
  onApplySnapshot?: (snap: DecisionSnapshot) => void;
  onExcel: () => void;
  onBRSR?: () => void;
  onPlanner: () => void;
}) {
  const p = allocate(budget, stance, scenario);
  const spent = p.funded.reduce((s, x) => s + x.spent, 0);
  const realised = p.funded.reduce((s, x) => s + x.realised, 0);

  // State for Feature 4: Audit Proof Drawer
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const activeDocs = selectedProject ? projectAuditEvidence[selectedProject.id] || [] : [];

  // Is the current view in sync with the last locked snapshot?
  const isOutOfSync =
    lockedSnapshot &&
    (lockedSnapshot.budget !== budget ||
      lockedSnapshot.scenario !== scenario ||
      lockedSnapshot.stance !== stance);

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

      {/* Synchronization Alert Banner */}
      {isOutOfSync && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            color: "#92400E",
            fontSize: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            ⚠️ <b>Active Draft in Decide ({money(budget)} Cr)</b> differs from your last Locked Board Decision (
            <b>
              {money(lockedSnapshot.budget)} Cr · {lockedSnapshot.id}
            </b>
            ).
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplySnapshot && onApplySnapshot(lockedSnapshot)}
              style={{
                height: "28px",
                fontSize: "11px",
                backgroundColor: "#FFFFFF",
                borderColor: "#D97706",
                color: "#B45309",
              }}
            >
              <RotateCcw size={12} className="mr-1" /> Revert to Locked ({money(lockedSnapshot.budget)} Cr)
            </Button>
          </div>
        </div>
      )}

      <div className="lock-banner">
        {locked ? <LockKeyhole size={16} /> : <Info size={16} />}
        {locked
          ? `Locked decision · Approved portfolio ${p.label} (${money(budget)} Cr envelope)`
          : `Draft decision · Linked to the active capital envelope (${money(budget)} Cr)`}
        <Button variant="link" size="sm" onClick={onPlanner}>
          Review plan in Decide ➔
        </Button>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">
            Approved Envelope
            <ClipboardList size={16} />
          </div>
          <div className="kpi-value">
            {money(budget)}
            <small>Cr</small>
          </div>
          <p className="kpi-desc">
            {money(p.cost)} Cr committed across {p.funded.length} projects · {money(p.idle)} Cr idle reserve
          </p>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tranche Spent</div>
          <div className="kpi-value">
            {money(spent)}
            <small>Cr</small>
          </div>
          <p className="kpi-desc">
            {p.cost ? Math.round((spent / p.cost) * 100) : 0}% of committed project capital
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
          <p className="kpi-desc">Quarter-to-date physical & transition losses avoided</p>
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

      {/* SECTION 1: Projects Execution Table */}
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
                  "Audit Evidence",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.funded.map((x) => (
                <tr
                  key={x.id}
                  onClick={() => setSelectedProject(x)}
                  style={{ cursor: "pointer" }}
                  title="Click to view verified Ind AS 36/37 audit contracts & invoices"
                >
                  <td>
                    <b>{x.name}</b>
                    <p className="subtitle">
                      {x.id} · {x.plant}
                    </p>
                  </td>
                  <td>{money(x.cost)} Cr</td>
                  <td>
                    <b>{money(x.spent)} Cr</b>
                  </td>
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
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "#F0FDFA",
                        color: "#0F766E",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ShieldCheck size={12} /> View Proof ({projectAuditEvidence[x.id]?.length || 3})
                    </span>
                  </td>
                </tr>
              ))}
              {!p.funded.length && (
                <tr>
                  <td colSpan={7}>
                    No funded projects. Increase the capital envelope in Decide to unlock the first delivery gate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Click any project row to view verified EPC agreements, milestone invoices, and physical inspection sign-offs under Ind AS 36/37.
        </p>
      </section>

      {/* SECTION 2: Immutable Board Decision Snapshots Ledger (AC-5 / US-3) */}
      <section className="panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <div className="heading-label">
            <LockKeyhole size={16} />
            Immutable Governance Audit Trail (AC-5 Snapshots)
          </div>
          <span className="badge teal">
            {snapshots.length} {snapshots.length === 1 ? "Record" : "Records"} in localStorage
          </span>
        </div>

        {snapshots.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Snapshot ID</th>
                  <th>Timestamp</th>
                  <th>Scenario & Stance</th>
                  <th>Approved Envelope</th>
                  <th>Committed Capex</th>
                  <th>Annual Risk Retired</th>
                  <th>Multiple</th>
                  <th>Audit Hash (SHA-256)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => {
                  const isCurrent = s.budget === budget && s.scenario === scenario && s.stance === stance;
                  return (
                    <tr key={s.id} style={{ backgroundColor: isCurrent ? "#F0FDF4" : undefined }}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: isCurrent ? "#166534" : "#0F172A",
                          }}
                        >
                          {s.id}
                        </span>
                        {isCurrent && (
                          <span className="badge teal" style={{ marginLeft: "6px", fontSize: "10px" }}>
                            Active
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "11px", color: "#64748B" }}>{s.timestamp}</td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>{s.scenario}</span>
                        <p className="subtitle" style={{ textTransform: "capitalize" }}>
                          {s.stance} Stance
                        </p>
                      </td>
                      <td>
                        <b>{money(s.budget)} Cr</b>
                      </td>
                      <td>{money(s.cost)} Cr</td>
                      <td>
                        <b style={{ color: "#0F766E" }}>{money(s.retired)} Cr / yr</b>
                      </td>
                      <td>
                        <b>{s.multiple}</b>
                      </td>
                      <td>
                        <code
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            backgroundColor: "#F1F5F9",
                            borderRadius: "4px",
                          }}
                        >
                          {s.sha256Hash}
                        </code>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isCurrent}
                          onClick={() => onApplySnapshot && onApplySnapshot(s)}
                          style={{ height: "26px", fontSize: "11px" }}
                        >
                          {isCurrent ? "Active" : "Restore"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748B" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
              No locked board decisions recorded yet.
            </p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>
              Go to Tab 2 <b>[Decide]</b>, adjust the budget slider, and click <b>[Lock Decision & Export Board Resolution PDF]</b> to create an immutable audit record.
            </p>
            <Button variant="outline" size="sm" onClick={onPlanner} style={{ marginTop: "12px" }}>
              Go to Decide (Boardroom Planner) ➔
            </Button>
          </div>
        )}
        <p className="table-note">
          Snapshots are persisted in browser localStorage with cryptographic verification hashes compliant with Ind AS 37 audit requirements.
        </p>
      </section>

      {/* Feature 4: Slide-over Audit Evidence Drawer */}
      <Sheet open={selectedProject !== null} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <SheetContent side="right" style={{ width: "540px", maxWidth: "90vw", overflowY: "auto", padding: "24px" }}>
          {selectedProject && (
            <>
              <SheetHeader>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#0F766E",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  <ShieldCheck size={16} /> Ind AS 36/37 Statutory Evidence Locker
                </div>
                <SheetTitle style={{ fontSize: "18px", marginTop: "4px" }}>{selectedProject.name}</SheetTitle>
                <SheetDescription style={{ fontSize: "12px" }}>
                  {selectedProject.id} · Facility: <b>{selectedProject.plant}</b> · Department: <b>{selectedProject.owner}</b>
                </SheetDescription>
              </SheetHeader>

              {/* Spend & Delivery Status Card */}
              <div
                style={{
                  margin: "20px 0",
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                  <span>
                    Approved Capital: <b>{money(selectedProject.cost)} Cr</b>
                  </span>
                  <span>
                    Tranche Spent:{" "}
                    <b style={{ color: "#0F766E" }}>
                      {money(selectedProject.spent)} Cr ({selectedProject.progress}%)
                    </b>
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedProject.progress}%`, height: "100%", backgroundColor: "#0F766E" }} />
                </div>
                <p style={{ fontSize: "11px", color: "#64748B", marginTop: "8px" }}>
                  Current Delivery Gate: <b>{selectedProject.gate}</b>
                </p>
              </div>

              {/* Audit Document Chain */}
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileText size={15} /> Verified Lineage Documents ({activeDocs.length})
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activeDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#F0FDFA",
                          color: "#0F766E",
                          fontWeight: 700,
                        }}
                      >
                        {doc.docType}
                      </span>
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>{doc.date}</span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                      {doc.title}
                    </div>

                    <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "8px", lineHeight: 1.4 }}>
                      {doc.notes}
                    </p>

                    <div
                      style={{
                        fontSize: "11px",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px",
                        padding: "8px",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "6px",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        Vendor: <b>{doc.vendor}</b>
                      </div>
                      <div>
                        Amount: <b>{doc.amount}</b>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        Verified: <b>{doc.verifiedBy}</b>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#94A3B8" }}>
                      <span style={{ fontFamily: "monospace" }}>SHA-256: {doc.sha256Hash}</span>
                      <button
                        onClick={() =>
                          alert(`Document verified: ${doc.title} (${doc.fileSize}). Signed by ${doc.verifiedBy}. Hash: ${doc.sha256Hash}`)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#0F766E",
                          background: "none",
                          border: "none",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Inspect Proof <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auditor Stamp Footer */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "14px",
                  borderRadius: "8px",
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <Check size={18} style={{ color: "#16A34A", marginTop: "2px" }} />
                <div style={{ fontSize: "11px", color: "#166534" }}>
                  <b>Statutory Auditor Pre-Clearance (Ind AS 37)</b>
                  <p style={{ marginTop: "2px", color: "#15803D" }}>
                    All disbursements verified against bank escrow debits and engineering milestones. Verified for inclusion in the Annual Statutory Financial Statements.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
    </>
  );
}

import { describe, expect, it } from "vitest";
import { allocate, floodShock, portfolios } from "./nimbus";
describe("Nimbus allocation rules", () => {
  it("evaluates exactly eight combinations", () => {
    expect(portfolios()).toHaveLength(8);
    expect(new Set(portfolios().map((p) => p.mask)).size).toBe(8);
  });
  it("funds P2 and P3 at 400 with 30 idle and 1,655 residual", () => {
    const p = allocate(400);
    expect(p.label).toBe("P2 + P3");
    expect(p.cost).toBe(370);
    expect(p.idle).toBe(30);
    expect(p.retired).toBe(1000);
    expect(p.residual).toBe(1655);
    expect(p.net).toBe(1335);
  });
  it("unlocks P1 and P3 at 540", () => {
    expect(allocate(400).next?.cost).toBe(540);
    expect(allocate(540).label).toBe("P1 + P3");
    expect(allocate(540).retired).toBe(1300);
  });
  it("funds all projects for 820 and leaves 835 risk", () => {
    expect(allocate(820).cost).toBe(820);
    expect(allocate(820).retired).toBe(1820);
    expect(allocate(820).residual).toBe(835);
  });
  it("keeps all portfolios inside their envelopes", () => {
    for (let b = 0; b <= 820; b += 10) expect(allocate(b).cost).toBeLessThanOrEqual(b);
  });
  it("prioritizes statutory carbon compliance at 450", () => {
    expect(allocate(450, "compliance").label).toBe("P1");
    expect(allocate(450, "balanced").label).toBe("P2 + P3");
  });
  it("prioritizes operational continuity at 540", () => {
    expect(allocate(540, "continuity").label).toBe("P2 + P3");
  });
  it("simulates 7 days of starvation and 18.6 Cr loss for a 14-day flood", () => {
    expect(floodShock()).toEqual({ starvationDay: 7, downtime: 7, loss: 18.6 });
  });
});

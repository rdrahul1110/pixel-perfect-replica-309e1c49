import { type Scenario, type Stance } from "./nimbus";

export interface BackendPortfolioResponse {
  meta: {
    product: string;
    company: string;
    plants_monitored: number;
    generated_at: string;
    currency: string;
  };
  portfolio_summary: {
    total_asset_value_cr: number;
    total_revenue_cr: number;
    annual_exposure_cr: {
      today: number;
      "2040_current": number;
      "2040_net_zero": number;
    };
    carbon_penalties_cr: {
      today: number;
      "2040_current": number;
      "2040_net_zero": number;
    };
    water_revenue_loss_cr: {
      today: number;
      "2040_current": number;
      "2040_net_zero": number;
    };
    heat_revenue_loss_cr: {
      today: number;
      "2040_current": number;
      "2040_net_zero": number;
    };
    flood_cyclone_loss_cr: {
      today: number;
      "2040_current": number;
      "2040_net_zero": number;
    };
    cascade_revenue_loss_cr: {
      today: number;
      "2040_current": number;
      "2040_net_zero": number;
    };
  };
  executive_takeaways: string[];
}

export const BACKEND_ENDPOINT = "http://144.24.126.116:5678/webhook/portfolio-risk";

export interface SyncStatus {
  state: "connected" | "syncing" | "fallback" | "idle";
  latencyMs?: number;
  lastSync?: Date;
  endpoint: string;
  data?: BackendPortfolioResponse;
  error?: string;
}

/**
 * Calls the live Oracle n8n backend engine with graceful fallback.
 * If running on HTTPS (e.g. Vercel) and the browser blocks plain HTTP (Mixed Content),
 * or if the network is offline, it cleanly returns null so the app continues seamlessly.
 */
export async function syncWithBackend(
  scenario: Scenario = "2040 Net Zero",
  budget: number = 400,
  stance: Stance = "balanced"
): Promise<{ data: BackendPortfolioResponse | null; latencyMs: number; error?: string }> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const payload = {
      scenario,
      carbon_price: scenario === "2040 Net Zero" ? 4500 : 2500,
      capex_applied: budget >= 820,
      buffer_days: budget >= 90 ? 25 : 10,
      approved_budget: budget,
      stance,
    };

    const res = await fetch(BACKEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const data: BackendPortfolioResponse = await res.json();
    return { data, latencyMs };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);
    const isMixedContent =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      BACKEND_ENDPOINT.startsWith("http:");
    
    const errorMsg = isMixedContent
      ? "Mixed-content: HTTPS browser blocked direct plain HTTP call. Local engine active."
      : (err?.message ?? "Network request failed");

    return { data: null, latencyMs, error: errorMsg };
  }
}

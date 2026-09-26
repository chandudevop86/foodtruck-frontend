const FRONTEND_URL =
  process.env.FOODTRUCK_FRONTEND_URL || "https://quantgrid.info/foodtruck/";
const API_BASE_URL =
  process.env.FOODTRUCK_API_BASE_URL || "https://quantgrid.info/foodtruck-api";

async function check(name, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json, text/html" },
      signal: controller.signal,
    });

    return {
      name,
      ok: response.ok,
      status: response.status,
      detail: response.ok ? "ok" : `http_${response.status}`,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      status: null,
      detail: error instanceof Error ? error.name : "request_failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function runFoodTruckHealthChecks({
  frontendUrl = FRONTEND_URL,
  apiBaseUrl = API_BASE_URL,
} = {}) {
  const apiBase = apiBaseUrl.replace(/\/$/, "");
  const results = await Promise.all([
    check("frontend", frontendUrl),
    check("dashboard_api", `${apiBase}/dashboard`),
  ]);

  return {
    healthy: results.every((item) => item.ok),
    mode: "diagnostic-only",
    checks: results,
    safety: {
      creates_orders: false,
      changes_payments: false,
      writes_database: false,
      deploys_production: false,
      touches_quantgrid_trading: false,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await runFoodTruckHealthChecks();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.healthy ? 0 : 1;
}

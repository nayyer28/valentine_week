const ALLOWED_ORIGINS = new Set([
  "https://nayyer28.github.io",
  // optional for local dev:
  "http://localhost:5500",
  "http://127.0.0.1:5500",
]);

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const allowed = !origin || ALLOWED_ORIGINS.has(origin); // allow direct browser opens (no Origin)

    // Preflight
    if (request.method === "OPTIONS") {
      const headers = {
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      };
      if (origin && ALLOWED_ORIGINS.has(origin)) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Vary"] = "Origin";
      } else if (!origin) {
        headers["Access-Control-Allow-Origin"] = "*";
      }
      return new Response(null, { headers });
    }

    const headers = {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    };

    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Vary"] = "Origin";
    } else if (!origin) {
      headers["Access-Control-Allow-Origin"] = "*";
    }

    if (!allowed) {
      return new Response(JSON.stringify({
        ok: false,
        error: "CORS blocked",
        originSeen: origin || null,
        allowedOrigins: Array.from(ALLOWED_ORIGINS),
      }), { status: 403, headers });
    }

    return new Response(JSON.stringify({
      ok: true,
      nowMs: Date.now(),
      originSeen: origin || null,
    }), { headers });
  },
};

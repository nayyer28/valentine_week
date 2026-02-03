const ALLOWED_ORIGINS = new Set([
  "https://USERNAME.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  // and if you test from phone on LAN:
  // "http://192.168.1.23:5500",
]);


export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const isAllowed = ALLOWED_ORIGINS.has(origin);

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...(isAllowed ? { "Access-Control-Allow-Origin": origin } : {}),
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (!isAllowed) {
      return new Response("CORS blocked", { status: 403 });
    }

    return new Response(JSON.stringify({ nowMs: Date.now() }), {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  },
};

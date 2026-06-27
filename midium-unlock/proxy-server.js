// proxy-server.js  —  Educational proxy server for DRDO Midium Unlock
//   1) /health, /info – diagnostic endpoints
//   2) /proxy         – transparent fetch proxy (response modifier)
//   Start:  node proxy-server.js

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3001;

/* ── Allowed target hosts (SSRF guard) ─────────────────────────────────── */
const ALLOWED_HOSTS = new Set([
  "drdo-blogging-website.vercel.app",
  "www.drdo-blogging-website.vercel.app",
  "midium-blogging-website.vercel.app",
  "www.midium-blogging-website.vercel.app",
]);

/* ── Allowed schemes ────────────────────────────────────────────────────── */
const ALLOWED_SCHEMES = new Set(["http:", "https:"]);

function validateTargetUrl(raw) {
  if (!raw) return { ok: false, error: "Missing 'target' query parameter." };

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_) {
    return { ok: false, error: "Malformed URL." };
  }

  if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
    return { ok: false, error: `Scheme '${parsed.protocol}' is not allowed.` };
  }

  // Block internal / private IP ranges (SSRF)
  const host = parsed.hostname.toLowerCase();

  // Loopback (127.x.x.x, ::1, localhost)
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("127.")
  ) {
    return {
      ok: false,
      error: "Requests to localhost / loopback are blocked.",
    };
  }

  // IP ranges (RFC 1918 — private) + link-local + multicast
  const ipv4Re = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = host.match(ipv4Re);
  if (m) {
    const [, a, b] = m.map(Number);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) || // link-local
      a === 127 || // loopback already caught above but belt-and-suspenders
      a >= 224
    ) {
      // multicast / reserved
      return {
        ok: false,
        error: "Requests to private/internal IP ranges are blocked.",
      };
    }
  }

  if (!ALLOWED_HOSTS.has(host) && !host.endsWith(".vercel.app")) {
    return {
      ok: false,
      error: `Host '${host}' is not in the allowed list. Allowed: ${[...ALLOWED_HOSTS].join(", ")} or any *.vercel.app host.`,
    };
  }

  return { ok: true, parsed };
}

/* ── Middleware ────────────────────────────────────────────────────────── */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://drdo-blogging-website.vercel.app",
          "https://midium-blogging-website.vercel.app",
        ],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

function isAllowedOrigin(origin, callback) {
  if (!origin) return callback(null, true); // no Origin header = service-worker / curl
  if (origin.startsWith("chrome-extension://")) return callback(null, true);
  if (/^https?:\/\/(localhost|127\.\d+\.\d+\.\d+)(:\d+)?$/i.test(origin))
    return callback(null, true);
  const allowed = [
    "https://drdo-blogging-website.vercel.app",
    "https://www.drdo-blogging-website.vercel.app",
  ];
  const allowedOrigin = allowed.some((o) => origin === o || origin.startsWith(o + "/"));
  return callback(null, allowedOrigin);
}

// Debug helper: log every CORS decision
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const o = req.headers.origin;
    console.log(
      `%c[CORS preflight] Origin: ${o || "(none)"} → ${isAllowedOrigin(o) ? "ALLOWED" : "DENIED"}`,
      isAllowedOrigin(o) ? "color: #4CAF50" : "color: #f44336",
    );
  }
  next();
});

app.use(
  cors({
    origin: isAllowedOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// Educational logging middleware
app.use((req, _res, next) => {
  if (req.path === "/health" || req.path === "/info") {
    return next();
  } // skip noise
  console.log(`%c[DRDO Proxy] ${req.method} ${req.url}`, "color: #2196F3");
  next();
});

/* ── /health ──────────────────────────────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "DRDO Midium Unlock Proxy",
    version: "1.0.0",
    educational_use: true,
    uptime: process.uptime(),
  });
});

/* ── /info ────────────────────────────────────────────────────────────── */
app.get("/info", (_req, res) => {
  res.json({
    name: "DRDO Midium Unlock Proxy",
    purpose: "Educational security demonstration and research only",
    authorized_by: "DRDO Security Research Team",
    version: "1.0.0",
    features: [
      "Transparent request proxying with SSRF protection",
      "Educational request / response logging",
      "Response header and payload inspection",
    ],
    usage:
      "For authorized DRDO security research and educational purposes only",
  });
});

/* ── /proxy ───────────────────────────────────────────────────────────── */
app.all("/proxy", async (req, res) => {
  const { target, bypass, research } = req.query;

  // ── Validate target URL ────────────────────────────────────────────────
  const validation = validateTargetUrl(target);
  if (!validation.ok) {
    return res.status(400).json({
      error: "Invalid or disallowed target URL.",
      detail: validation.error,
      educational: true,
    });
  }

  // ── Check educational bypass header ────────────────────────────────────
  if (req.headers["x-midium-unlock"] !== "true") {
    return res.status(403).json({
      error: "Missing X-Midium-Unlock header.",
      message: "This endpoint requires the educational bypass header.",
      educational: true,
    });
  }

  try {
    // Build upstream request headers — start fresh to avoid leaking CORS preflight
    const upstreamHeaders = {
      "User-Agent": "DRDO-Midium-Unlock-Research/1.0",
      "X-Research-Purpose": "Educational Security Demonstration",
      "X-DRDO-Authorized": "true",
      "X-Forwarded-For": req.ip || req.connection?.remoteAddress || "unknown",
    };

    // Merge any safe headers from the incoming request selectively
    if (req.headers["accept"]) upstreamHeaders.Accept = req.headers["accept"];
    if (req.headers["accept-language"])
      upstreamHeaders["Accept-Language"] = req.headers["accept-language"];
    if (req.headers["content-type"])
      upstreamHeaders["Content-Type"] = req.headers["content-type"];

    // Mirror the body for POST/PUT/PATCH
    let upstreamData = undefined;
    if (!["GET", "HEAD"].includes(req.method)) {
      upstreamData = req.body;
    }

    const response = await axios({
      method: req.method,
      url: target,
      headers: upstreamHeaders,
      data: upstreamData,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: null, // pass through all status codes
    });

    // ── Educational metadata stamped onto the response ──────────────────
    const enhancedResponse = {
      data: response.data,
      _metadata: {
        service: "DRDO Midium Unlock Educational Proxy",
        purpose: "Security Research and Education",
        authorized_by: "DRDO Security Research Team",
        timestamp: new Date().toISOString(),
        educational_use: true,
        original_url: target,
        bypass_reason:
          "Authorized educational demonstration of paywall vulnerabilities",
        upstream_status: response.status,
        upstream_headers: Object.fromEntries(
          Object.entries(response.headers).filter(
            ([k]) =>
              !["set-cookie", "date", "connection"].includes(k.toLowerCase()),
          ),
        ),
      },
    };

    res.status(response.status).json(enhancedResponse);
  } catch (error) {
    console.error(
      "%c[DRDO Proxy] Error fetching article:",
      "color: #f44336",
      error.message,
    );

    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to fetch target resource",
      message: error.message,
      code: error.code,
      educational: true,
      suggestion:
        "Check that the target URL is accessible and within allowed hosts.",
    });
  }
});

/* ── Start ────────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(
    `%c[DRDO Proxy] Server running at http://localhost:${PORT}`,
    "color: #4CAF50; font-weight: bold;",
  );
  console.log(
    `%cGET    /health                     – server status`,
    "color: #2196F3",
  );
  console.log(
    `%cGET    /info                       – service information`,
    "color: #2196F3",
  );
  console.log(
    `%cALL    /proxy?target=<url>         – fetch with bypass`,
    "color: #2196F3",
  );
  console.log(
    `%c[NOTE] For authorized DRDO security research only`,
    "color: #FF9800; font-weight: bold;",
  );
});

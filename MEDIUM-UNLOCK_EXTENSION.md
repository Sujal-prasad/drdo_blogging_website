# Medium-Unlock Chrome Extension - Educational Security Research Tool

**Project:** DRDO Internship - Paywall Bypass Demonstration  
**Version:** 1.0.0  
**Purpose:** Educational security research only  
**Target:** `drdo-blogging-website.vercel.app`  
**Author:** DRDO Security Research Team  
**Status:** ✅ Fully Implemented and Documented

---

## 📋 Executive Summary

**Medium-Unlock** is a Chrome Manifest V3 extension designed to demonstrate a real-world vulnerability: client-side paywall bypass through localStorage manipulation. This tool serves as an educational PoC (Proof of Concept) for demonstrating how authentication and access control vulnerabilities can be exploited, while maintaining ethical boundaries for authorized security research.

**Key Features:**
- ✅ **Paywall Bypass** - Access all articles without payment
- ✅ **Educational Proxy** - Transparent content fetching with security headers
- ✅ **Research Logging** - Track all requests for educational analysis
- ✅ **DRDO Authorization** - Includes security research metadata

---

## 🎯 Project Goals

### Primary Objectives

1. **Educational Demonstration**
   - Show how client-side validation is vulnerable to manipulation
   - Demonstrate real-world exploit scenarios
   - Provide clear documentation for learning purposes

2. **Security Research**
   - Analyze paywall implementation vulnerabilities
   - Document attack vectors and exploitation methods
   - Provide remediation recommendations

3. **DRDO Internship Requirement**
   - Fulfill internship project requirements
   - Demonstrate security research capabilities
   - Showcase vulnerability analysis skills

---

## 🔧 Extension Architecture

### Manifest V3 Structure

```
midium-unlock/
├── manifest.json      # Extension configuration and permissions
├── background.js      # Service worker for request interception
├── content-unlock.js  # Content script for localStorage manipulation
├── rules.json         # Static declarative net request rules
└── proxy-server.js    # Educational proxy server
```

---

## 📁 Component Breakdown

### 1. manifest.json

**Purpose:** Extension configuration and permissions

```json
{
  "manifest_version": 3,
  "name": "DRDO Midium Unlock - Educational Security Tool",
  "version": "1.0.0",
  "description": "Educational extension demonstrating paywall bypass for security research. For authorized DRDO use only.",
  "permissions": [
    "declarativeNetRequest",
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://drdo-blogging-website.vercel.app/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://drdo-blogging-website.vercel.app/*"],
      "js": ["content-unlock.js"],
      "run_at": "document_start",
      "all_frames": true
    }
  ],
  "author": "DRDO Security Research Team",
  "categories": ["Security"]
}
```

**Key Permissions:**
- `declarativeNetRequest` - Modify web requests
- `storage` - Store extension state
- `activeTab` - Access active tab for content manipulation

**Host Permissions:**
- Only targets `drdo-blogging-website.vercel.app` (scoped access)

---

### 2. background.js

**Purpose:** Background service worker for declarative net request rules

**Lines 1-13: Configuration**
```javascript
const EXTENSION_ID = "drdo-midium-unlock";

const CONFIG = {
  targetDomain: "https://drdo-blogging-website.vercel.app",
  proxyUrl: "http://localhost:3001",
  payloadKey: "midium-member",
  payloadValue: "true",
  debug: true,
};
```

**Lines 15-22: Debug Logging**
```javascript
if (CONFIG.debug) {
  console.log(
    "%c[DRDO Midium Unlock] Extension Loaded",
    "color: #4CAF50; font-weight: bold;",
  );
  console.log("%cTarget Domain:", "color: #2196F3", CONFIG.targetDomain);
  console.log("%cProxy Server:", "color: #2196F3", CONFIG.proxyUrl);
}
```

**Lines 25-27: Rule ID Generation**
```javascript
function makeRuleIds() {
  return { headerRuleId: 1001, redirectRuleId: 1002 };
}
```

**Lines 30-119: Dynamic Rule Initialization**

**Purpose:** Initialize declarative net request rules dynamically

**Step 1: Remove Existing Rules**
```javascript
const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
const myIds = [headerRuleId, redirectRuleId];

// Remove any old rules
const idsToRemove = existingRules
  .filter((rule) => myIds.includes(rule.id))
  .map((rule) => rule.id);

if (idsToRemove.length) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: idsToRemove,
  });
}
```

**Step 2: Create New Rules**

**Rule 1001: Inject Header**
```javascript
{
  id: headerRuleId,
  priority: 100,
  action: {
    type: "modifyHeaders",
    requestHeaders: [
      {
        headerName: "X-Midium-Unlock",
        operation: "set",
        value: CONFIG.payloadValue,
      },
      {
        headerName: "X-Research-Purpose",
        operation: "set",
        value: "Educational Security Demonstration",
      },
      {
        headerName: "X-DRDO-Authorized",
        operation: "set",
        value: "true",
      },
    ],
  },
  condition: {
    urlFilter: CONFIG.targetDomain.replace(/^https?:\/\//, ""),
    resourceTypes: [
      "main_frame",
      "xmlhttprequest",
      "script",
      "stylesheet",
    ],
  },
}
```

**Rule 1002: Transparent Proxy**
```javascript
{
  id: redirectRuleId,
  priority: 90,
  action: {
    type: "redirect",
    redirect: {
      url: `${CONFIG.proxyUrl}/proxy?target=<url>&bypass=true`,
    },
  },
  condition: {
    urlFilter: CONFIG.targetDomain.replace(/^https?:\/\//, "") + "/api/",
    resourceTypes: ["xmlhttprequest"],
  },
}
```

**Lines 122-131: Proxy Health Probe**
```javascript
async function probeProxy() {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 4000);
    await fetch(`${CONFIG.proxyUrl}/health`, { signal: controller.signal });
    clearTimeout(tid);
  } catch (_) {
    /* proxy not running — that's fine, rules still work */
  }
}
```

**Lines 134-145: Extension Install Handler**
```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log(
      "%c[DRDO Midium Unlock] Extension installed — educational use only",
      "color: #4CAF50",
    );
    initializeRules();
  } else if (details.reason === "update") {
    console.log("%c[DRDO Midium Unlock] Extension updated", "color: #2196F3");
    initializeRules();
  }
});
```

**Lines 148-177: Runtime Message Handler**
```javascript
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TOGGLE_EXTENSION") {
    if (message.enabled) {
      initializeRules();
      console.log("%c[DRDO Midium Unlock] Extension enabled", "color: #4CAF50");
      sendResponse({ status: "success", enabled: true });
    } else {
      const { headerRuleId, redirectRuleId } = makeRuleIds();
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [headerRuleId, redirectRuleId],
      });
      console.log(
        "%c[DRDO Midium Unlock] Extension disabled",
        "color: #f44336",
      );
      sendResponse({ status: "success", enabled: false });
    }
    return true;
  }

  if (message.type === "GET_CONFIG") {
    sendResponse({
      payloadKey: CONFIG.payloadKey,
      payloadValue: CONFIG.payloadValue,
      proxyUrl: CONFIG.proxyUrl,
      targetDomain: CONFIG.targetDomain,
    });
    return true;
  }
});
```

---

### 3. content-unlock.js

**Purpose:** Inject paywall bypass via localStorage manipulation at document_start

**Lines 1-24: Direct localStorage Injection**

**Critical Exploit Logic:**
```javascript
/* ── Keys the site's paywall module reads ────────────────────────────── */
const PAYWALL_KEYS = {
  isMember:         'midium-member',   // Set to "true" → all articles unlocked
  alreadyReads:     'midium-reads',    // Cached article IDs
};

/* ── Always unlock: set member flag before any site code runs ───────── */
try {
  localStorage.setItem(PAYWALL_KEYS.isMember, 'true');
  // Reset read history so even a fresh session gets unlimited access
  localStorage.removeItem(PAYWALL_KEYS.alreadyReads);
} catch (_) {
  // localStorage can throw in some edge-cases
}
```

**Lines 26-53: localStorage Monkey-Patch**

**Prevents other code from removing the bypass:**
```javascript
(function patchStorage() {
  if (!window.Storage.prototype) return;

  const MEMBER_KEY = PAYWALL_KEYS.isMember;

  // Save original
  const originalSetItem = window.Storage.prototype.setItem;

  window.Storage.prototype.setItem = function (key, value) {
    if (key === MEMBER_KEY && value !== 'true') {
      // Site tried to revoke membership
      return originalSetItem.call(this, key, 'true');
    }
    return originalSetItem.call(this, key, value);
  };

  // Prevent removal
  const originalRemoveItem = window.Storage.prototype.removeItem;
  window.Storage.prototype.removeItem = function (key) {
    if (key === MEMBER_KEY) {
      // Refuse removal
      originalSetItem.call(this, key, 'true');
      return;
    }
    return originalRemoveItem.call(this, key);
  };
})();
```

**Lines 56-67: Remove Paywalled Blur**

```javascript
(function clearBlur() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.paywalled').forEach((el) => {
      el.classList.remove('paywalled');
    });
  });
  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
})();
```

**Lines 70-81: Close Overlay**

```javascript
(function closeOverlay() {
  const close = () => {
    document.querySelectorAll('.pay-overlay, .pay-locked').forEach((el) => {
      el.style.transition = 'opacity .2s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    });
    document.body.classList.remove('pay-locked');
  };
  close();
  window.addEventListener('DOMContentLoaded', close);
})();
```

**Lines 84-86: Remove Auth Gate**

```javascript
try {
  document.documentElement.classList.remove('auth-gate');
} catch (_) {}
```

**Lines 89-93: Debug Logging**

```javascript
console.log(
  '%c[DRDO Unlock] Paywall bypass injected — localStorage.midium-member = "true"',
  'color: #4CAF50; font-weight: bold;',
);
```

---

### 4. rules.json

**Purpose:** Static declarative net request rules

**Lines 1-3: Configuration**
```json
{
  "version": 1,
  "notes": "Static declarativeNetRequest rules. These complement the dynamic rules in background.js (runtime) — IDs 1001/1002 are dynamic and installed on install/update; rules here use 2001/2002/2003 for static supplemental behaviour.",
}
```

**Rule 2001: Static Header Injection**
```json
{
  "id": 2001,
  "priority": 100,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "headerName": "X-Midium-Unlock",
        "operation": "set",
        "value": "true"
      },
      {
        "headerName": "X-Research-Purpose",
        "operation": "set",
        "value": "Educational Security Demonstration"
      },
      {
        "headerName": "X-DRDO-Authorized",
        "operation": "set",
        "value": "true"
      }
    ]
  },
  "condition": {
    "urlFilter": "drdo-blogging-website.vercel.app",
    "resourceTypes": [
      "main_frame",
      "xmlhttprequest",
      "script",
      "stylesheet"
    ]
  }
}
```

**Rule 2002: Static Proxy Redirection**
```json
{
  "id": 2002,
  "priority": 90,
  "action": {
    "type": "redirect",
    "redirect": {
      "url": "http://localhost:3001/proxy?target=<url>&bypass=true"
    }
  },
  "condition": {
    "urlFilter": "drdo-blogging-website.vercel.app/api/",
    "resourceTypes": ["xmlhttprequest"]
  }
}
```

**Rule 2003: Additional Security Header**
```json
{
  "id": 2003,
  "priority": 80,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "headerName": "X-Security-Research",
        "operation": "set",
        "value": "true"
      }
    ]
  },
  "condition": {
    "urlFilter": "drdo-blogging-website.vercel.app/api/articles/",
    "resourceTypes": ["xmlhttprequest"]
  }
}
```

---

### 5. proxy-server.js

**Purpose:** Educational proxy server with security headers and logging

**Lines 1-11: Dependencies and Setup**
```javascript
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3001;
```

**Lines 16-24: SSRF Protection**
```javascript
const ALLOWED_HOSTS = new Set([
  "drdo-blogging-website.vercel.app",
  "www.drdo-blogging-website.vercel.app",
  "midium-blogging-website.vercel.app",
  "www.midium-blogging-website.vercel.app",
]);

const ALLOWED_SCHEMES = new Set(["http:", "https:"]);
```

**Lines 26-85: URL Validation**
```javascript
function validateTargetUrl(raw) {
  if (!raw) return { ok: false, error: "Missing 'target' query parameter." };

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_) {
    return { ok: false, error: "Malformed URL." };
  }

  if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
    return {
      ok: false,
      error: `Scheme '${parsed.protocol}' is not allowed.`,
    };
  }

  // Block internal / private IP ranges (SSRF)
  const host = parsed.hostname.toLowerCase();

  // Loopback
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

  // IP ranges (RFC 1918)
  const ipv4Re = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = host.match(ipv4Re);
  if (m) {
    const [, a, b] = m.map(Number);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 127 ||
      a >= 224
    ) {
      return {
        ok: false,
        error: "Requests to private/internal IP ranges are blocked.",
      };
    }
  }

  if (!ALLOWED_HOSTS.has(host) && !host.endsWith(".vercel.app")) {
    return {
      ok: false,
      error: `Host '${host}' is not in the allowed list.`,
    };
  }

  return { ok: true, parsed };
}
```

**Lines 88-106: Security Middleware**
```javascript
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

app.use(
  cors({
    origin: [
      "https://drdo-blogging-website.vercel.app",
      "https://www.drdo-blogging-website.vercel.app",
      "https://midium-blogging-website.vercel.app",
      "https://www.midium-blogging-website.vercel.app",
    ],
    credentials: true,
  }),
);
```

**Lines 109-129: Logging Middleware**
```javascript
app.use(express.json({ limit: "10mb" }));

// Educational logging middleware
app.use((req, _res, next) => {
  if (req.path === "/health" || req.path === "/info") {
    return next();
  }
  console.log(`%c[DRDO Proxy] ${req.method} ${req.url}`, "color: #2196F3");
  next();
});
```

**Lines 132-157: Health and Info Endpoints**
```javascript
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "DRDO Midium Unlock Proxy",
    version: "1.0.0",
    educational_use: true,
    uptime: process.uptime(),
  });
});

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
```

**Lines 160-254: Main Proxy Endpoint**

**Educational Purpose Verification:**
```javascript
app.all("/proxy", async (req, res) => {
  const { target, bypass, research } = req.query;

  // Validate target URL
  const validation = validateTargetUrl(target);
  if (!validation.ok) {
    return res.status(400).json({
      error: "Invalid or disallowed target URL.",
      detail: validation.error,
      educational: true,
    });
  }

  // Check educational bypass header
  if (req.headers["x-midium-unlock"] !== "true") {
    return res.status(403).json({
      error: "Missing X-Midium-Unlock header.",
      message: "This endpoint requires the educational bypass header.",
      educational: true,
    });
  }

  try {
    // Build upstream request headers
    const upstreamHeaders = {
      "User-Agent": "DRDO-Midium-Unlock-Research/1.0",
      "X-Research-Purpose": "Educational Security Demonstration",
      "X-DRDO-Authorized": "true",
      "X-Forwarded-For": req.ip || req.connection?.remoteAddress || "unknown",
    };

    // Merge safe headers
    if (req.headers["accept"]) upstreamHeaders.Accept = req.headers["accept"];
    if (req.headers["accept-language"])
      upstreamHeaders["Accept-Language"] = req.headers["accept-language"];
    if (req.headers["content-type"])
      upstreamHeaders["Content-Type"] = req.headers["content-type"];

    // Mirror body for POST/PUT/PATCH
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
      validateStatus: null,
    });

    // Educational metadata
    const enhancedResponse = {
      data: response.data,
      _metadata: {
        service: "DRDO Midium Unlock Educational Proxy",
        purpose: "Security Research and Education",
        authorized_by: "DRDO Security Research Team",
        timestamp: new Date().toISOString(),
        educational_use: true,
        original_url: target,
        bypass_reason: "Authorized educational demonstration of paywall vulnerabilities",
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
      suggestion: "Check that the target URL is accessible and within allowed hosts.",
    });
  }
});
```

**Lines 257-278: Server Startup**
```javascript
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
```

---

## 🚀 Installation and Setup

### Prerequisites

- ✅ Node.js v18+ installed
- ✅ Chrome browser with Manifest V3 support
- ✅ Vercel deployment access
- ✅ DRDO authorization

### Step-by-Step Installation

#### 1. Clone Repository

```bash
cd BugBounty/drdo_blogging_website
```

#### 2. Navigate to Extension Directory

```bash
cd midium-unlock
```

#### 3. Install Dependencies

```bash
npm install express axios cors helmet
```

#### 4. Start Proxy Server

**Terminal 1:**
```bash
npm run proxy
# Output:
# [DRDO Proxy] Server running at http://localhost:3001
# GET    /health                     – server status
# GET    /info                       – service information
# ALL    /proxy?target=<url>         – fetch with bypass
# [NOTE] For authorized DRDO security research only
```

#### 5. Load Extension in Chrome

**Windows/Linux:**
1. Navigate to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** button
4. Select the `midium-unlock` folder
5. ✅ Extension installed

**macOS:**
1. Navigate to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** button
4. Select the `midium-unlock` folder
5. ✅ Extension installed

#### 6. Enable Extension

1. Click the puzzle piece icon (Extensions)
2. Find **DRDO Midium Unlock**
3. Ensure toggle is **ON**

**Console Output:**
```
[DRDO Midium Unlock] Extension Loaded
Target Domain: https://drdo-blogging-website.vercel.app
Proxy Server: http://localhost:3001
```

---

## 🔍 How It Works

### Attack Vector: localStorage Manipulation

**Target File:** `scripts/feed/paywall.js`

**Vulnerable Code:**
```javascript
function isMember() {
  return localStorage.getItem(MEMBER_KEY) === "true";  // ❌ CLIENT-ONLY
}

function gate(article, opts) {
  if (isMember() || article.userPost) return false;  // ❌ NO SERVER CHECK
  // Proceed with paywall blur
}
```

### Exploitation Flow

```mermaid
graph TD
    A[User Opens Article] --> B{Extension Loaded?}
    B -->|Yes| C[content-unlock.js Executes]
    B -->|No| D[Paywall Check Runs]
    
    C --> E[Set localStorage.midium-member = true]
    C --> F[Remove localStorage.midium-reads]
    C --> G[Patch localStorage Methods]
    C --> H[Remove paywalled Blur Classes]
    
    E --> I[Paywall Function Reads localStorage]
    F --> J[Read count reset]
    G --> K[Bypass cannot be removed]
    H --> L[Paywalled content visible]
    
    I --> M{localStorage.midium-member === "true"?}
    M -->|Yes| N[Article Unlocked ✅]
    M -->|No| O[Paywall Applied ❌]
    
    D --> P{localStorage.midium-member === "true"?}
    P -->|Yes| N
    P -->|No| O
```

### Detailed Execution Flow

#### Phase 1: Content Script Injection

**Trigger:** Extension manifest specifies `run_at: "document_start"`

**Execution Order:**
1. Browser starts loading HTML document
2. `content-unlock.js` executes BEFORE page scripts
3. localStorage patching occurs immediately

**Lines 1-24 in content-unlock.js:**
```javascript
const PAYWALL_KEYS = {
  isMember: 'midium-member',
  alreadyReads: 'midium-reads',
};

// Immediately set localStorage before any page code runs
localStorage.setItem(PAYWALL_KEYS.isMember, 'true');
localStorage.removeItem(PAYWALL_KEYS.alreadyReads);
```

#### Phase 2: localStorage Monkey-Patch

**Purpose:** Prevent page code from removing the bypass

**Lines 26-53:**
```javascript
window.Storage.prototype.setItem = function (key, value) {
  if (key === MEMBER_KEY && value !== 'true') {
    // Any write to midium-member not "true" is overwritten
    return originalSetItem.call(this, key, 'true');
  }
  return originalSetItem.call(this, key, value);
};

window.Storage.prototype.removeItem = function (key) {
  if (key === MEMBER_KEY) {
    // Any removal attempt is immediately rewritten
    originalSetItem.call(this, key, 'true');
    return;
  }
  return originalRemoveItem.call(this, key);
};
```

#### Phase 3: Paywall Blur Removal

**Purpose:** Remove blur effects from already-rendered content

**Lines 56-67:**
```javascript
const observer = new MutationObserver(() => {
  document.querySelectorAll('.paywalled').forEach((el) => {
    el.classList.remove('paywalled');
  });
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
});
```

**MutationObserver ensures:**
- ✅ Catches dynamically added paywalled elements
- ✅ Removes blur as soon as they appear
- ✅ Works for lazy-loaded content

#### Phase 4: Checkout Overlay Prevention

**Purpose:** Stop payment modal from appearing

**Lines 70-81:**
```javascript
const close = () => {
  document.querySelectorAll('.pay-overlay, .pay-locked').forEach((el) => {
    el.style.transition = 'opacity .2s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  });
  document.body.classList.remove('pay-locked');
};
close(); // Close immediately on load
window.addEventListener('DOMContentLoaded', close);
```

**What this prevents:**
- ✅ Paywall checkout modal opens
- ✅ Body scroll lock removed
- ✅ Read-only mode bypassed

---

## 📊 Security Analysis

### Vulnerability Assessment

**Primary Vulnerability:** Client-side Paywall Bypass

**CVSS Score:** 9.1 (Critical)

**Attack Vector:** Network (AV:N)  
**Attack Complexity:** Low (AC:L)  
**Privileges Required:** None (PR:N)  
**User Interaction:** Required (UI:R)

---

### Why This is a Vulnerability

**Common Misconception:**
> "Isn't client-side validation a design choice?"

**Answer:** ❌ **NO**

**Critical Issues:**
1. **Revenue Loss** - Paywall completely bypassed
2. **Monetization Failure** - No payment verification
3. **Business Impact** - Direct threat to business model
4. **Industry Standard** - All legitimate platforms use server-side validation

---

### Comparison with Legitimate Platforms

| Platform | Validation Method | Our Platform |
|----------|-------------------|--------------|
| Medium | ✅ Server-side | ❌ Client-side |
| Substack | ✅ Server-side | ❌ Client-side |
| Patreon | ✅ Server-side | ❌ Client-side |
| **DRDO Blog** | ❌ Client-side | ❌ Client-side |

---

## 🔐 Ethical Guidelines

### Authorized Use Only

**⚠️ CRITICAL DISCLAIMER:**

This extension is **ONLY** for:
- ✅ Educational security research
- ✅ DRDO internship project demonstration
- ✅ Authorized vulnerability assessment

**This extension is NOT for:**
- ❌ Commercial exploitation
- ❌ Unauthorized access
- ❌ Illegal activity
- ❌ Bypassing legitimate security measures

---

### Ethical Principles

1. **Purpose Restriction**
   - ✅ Only for educational purposes
   - ✅ Only for authorized research
   - ✅ Only for demonstrating vulnerabilities

2. **Scope Limitation**
   - ✅ Only targets configured domain
   - ✅ Only fetches authorized content
   - ✅ Only modifies own browser environment

3. **Transparency**
   - ✅ Clear disclaimer in manifest
   - ✅ Educational logging enabled
   - ✅ Security headers include research metadata

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Paywall Bypass

**Steps:**
1. Navigate to article page (e.g., `/pages/article.html?id=123`)
2. Observe: Article content blurred, paywall checkout modal appears
3. Extension active: Console shows bypass injection message
4. Result: Article content fully visible without payment

**Expected Behavior:**
```
Console Output:
[DRDO Unlock] Paywall bypass injected — localStorage.midium-member = "true"
```

**Verification:**
```javascript
// In browser console
localStorage.getItem('midium-member'); // "true"
```

---

### Scenario 2: Multiple Article Access

**Steps:**
1. Read article #1 (unlocked)
2. Click through to article #2 (unlocked)
3. Click through to article #3 (unlocked)
4. Check all articles accessible

**Expected Behavior:**
- ✅ No paywall errors
- ✅ No blur effects
- ✅ No checkout prompts

---

### Scenario 3: Session Persistence

**Steps:**
1. Refresh page
2. Observe: Paywall bypass still active
3. Check localStorage persists

**Expected Behavior:**
```javascript
// After refresh
localStorage.getItem('midium-member'); // "true" (still set)
```

---

### Scenario 4: Checkout Prevention

**Steps:**
1. Try to click "Go Premium" button
2. Result: Button click ignored or overlay closed immediately

**Expected Behavior:**
- ✅ No overlay appears
- ✅ No redirect to payment
- ✅ No session expiration

---

## 🛡️ Mitigation Strategies

### Recommended Fixes

**For DRDO Blog Team:**

1. **Server-Side Paywall Validation** (CRITICAL)
   - Implement edge function to verify membership status
   - Check against database, NOT localStorage
   - Truncate article content for non-members

2. **Database Membership Tracking**
   - Add `user_memberships` table
   - Track paid subscriptions
   - Verify payment status server-side

3. **Remove Client-Side Validation**
   - Delete `isMember()` function
   - Remove localStorage checks
   - Rely only on server validation

4. **Secure Session Management**
   - Move sessions to HTTP-only cookies
   - Add CSRF protection
   - Implement token rotation

---

## 📈 Impact Analysis

### Business Impact

**Revenue Loss:**
- ✅ Complete monetization bypass
- ✅ No payment collection
- ✅ Unlimited free access
- ✅ Direct revenue zero

**User Exploitation:**
- ✅ Paying users exploited
- ✅ Non-paying users gain access
- ✅ Ethical concerns raised
- ✅ Reputation damage

### Technical Impact

**System Integrity:**
- ✅ No data breach
- ✅ No backend modification
- ✅ No user accounts compromised
- ✅ No malicious code injection

**Attack Vector:**
- ✅ Client-side manipulation only
- ✅ No network-level exploitation
- ✅ No server compromise
- ✅ Browser environment only

---

## 📚 Educational Value

### Learning Objectives

**For Students:**
1. Understanding client-side vs server-side security
2. How localStorage vulnerabilities can be exploited
3. Why business logic must be server-verified
4. Ethical hacking principles and guidelines

**For Researchers:**
1. Real-world paywall implementation analysis
2. Browser extension development with Manifest V3
3. Request interception and modification techniques
4. Educational security tool design

---

## 🎓 Related Concepts

### Client-Side Security

**Concept:** Validation on client side is never secure

**Reasoning:**
- ✅ Client code can be inspected
- ✅ Client code can be modified
- ✅ Client code runs on attacker's machine
- ✅ Client code cannot enforce security

**Best Practice:**
- ❌ Never trust client-side state
- ❌ Always verify on server
- ❌ Never rely on browser features for access control

---

### localStorage Attacks

**Types:**
1. **Persistence:** Data stored in browser
2. **Manipulation:** User can modify values
3. **Persistence:** Survives page refreshes
4. **Persistence:** Shared across tabs

**Attack Vectors:**
1. DevTools modification
2. Browser extension injection
3. XSS injection
4. Cookie theft

---

### Paywall Best Practices

**Industry Standards:**
1. ✅ Server-side validation
2. ✅ Payment gateway integration
3. ✅ Database tracking of subscriptions
4. ✅ Token-based authentication
5. ✅ Rate limiting
6. ✅ Session management

---

## 📝 References

**Technical Documentation:**
- [OWASP Client-Side Security](https://owasp.org/www-project-client-side-security/)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension Design Patterns](https://developer.chrome.com/docs/extensions/mv3/patterns/)

**Security Guidelines:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MITRE CWE](https://cwe.mitre.org/)
- [Ethical Hacking Principles](https://en.wikipedia.org/wiki/Ethical_hacking)

---

## ⚠️ Disclaimer

**Educational Purpose Only:**

This extension and documentation are provided **exclusively for educational and authorized security research purposes**:

- ✅ Designed to demonstrate client-side security vulnerabilities
- ✅ Designed to show how paywalls can be bypassed
- ✅ Designed to provide remediation guidance
- ✅ Designed for DRDO internship project

**NOT FOR:**
- ❌ Commercial exploitation
- ❌ Unauthorized access to any system
- ❌ Bypassing legitimate security measures
- ❌ Any illegal or unethical activity

**Authorized Use:**
- ⚠️ Only for authorized DRDO security research
- ⚠️ Only within the agreed-upon scope
- ⚠️ Do not use without proper authorization
- ⚠️ Respect all legal and ethical guidelines

---

## 🎯 Conclusion

**Medium-Unlock** successfully demonstrates a critical real-world vulnerability: client-side paywall bypass through localStorage manipulation. This educational tool:

1. ✅ Shows how client-side validation can be bypassed
2. ✅ Demonstrates exploitation techniques
3. ✅ Provides clear remediation guidance
4. ✅ Maintains ethical research boundaries
5. ✅ Serves DRDO internship project requirements

**Final Note:** The vulnerabilities demonstrated in this extension are **educational** and **should NOT be used for malicious purposes**. Always obtain proper authorization before testing any security system.

---

**Project Status:** ✅ Complete  
**Extension Version:** 1.0.0  
**Last Updated:** 2026-06-26  
**Author:** DRDO Security Research Team

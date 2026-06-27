// background.js - Extension background service worker (MV3)
const EXTENSION_ID = "drdo-midium-unlock";

// ── Configuration ──────────────────────────────────────────────────────────
const CONFIG = {
  targetDomain: "https://drdo-blogging-website.vercel.app",
  // Local proxy server
  proxyUrl: "http://localhost:3001",
  payloadKey: "midium-member", // localStorage key the site checks
  payloadValue: "true", // value that signals "premium / unlocked"
  debug: true,
};
// ────────────────────────────────────────────────────────────────────────────

if (CONFIG.debug) {
  console.log(
    "%c[DRDO Midium Unlock] Extension Loaded",
    "color: #4CAF50; font-weight: bold;",
  );
  console.log("%cTarget Domain:", "color: #2196F3", CONFIG.targetDomain);
  console.log("%cProxy Server:", "color: #2196F3", CONFIG.proxyUrl);
}

// Build a base-rule ID deterministically so we can find & remove it later
function makeRuleIds() {
  return { headerRuleId: 1001, redirectRuleId: 1002 };
}

// Initialize / re-initialise declarativeNetRequest rules
async function initializeRules() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const { headerRuleId, redirectRuleId } = makeRuleIds();
    const myIds = [headerRuleId, redirectRuleId];

    // Remove any old rules we previously added (handles re-init cleanly)
    const idsToRemove = existingRules
      .filter((rule) => myIds.includes(rule.id))
      .map((rule) => rule.id);

    if (idsToRemove.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: idsToRemove,
      });
    }

    const newRules = [
      // Rule 1001 – inject X-Midium-Unlock header on every site request
      {
        id: headerRuleId,
        priority: 100,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "X-Midium-Unlock",
              operation: "set",
              value: CONFIG.payloadValue,
            },
            {
              header: "X-Research-Purpose",
              operation: "set",
              value: "Educational Security Demonstration",
            },
            {
              header: "X-DRDO-Authorized",
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
      },
      // Rule 1002 – transparently proxy article API calls through our server
      // (useful when the site communicates via /api/ endpoints)
      {
        id: redirectRuleId,
        priority: 90,
        action: {
          type: "redirect",
          redirect: {
            // MV3 supports {_regexKey} substitutions in urlFilter-matched URLs
            url: `${CONFIG.proxyUrl}/proxy?target=<url>&bypass=true`,
          },
        },
        condition: {
          urlFilter: CONFIG.targetDomain.replace(/^https?:\/\//, "") + "/api/",
          resourceTypes: ["xmlhttprequest"],
        },
      },
    ];

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules,
    });

    console.log(
      "%c[DRDO Midium Unlock] Rules initialised successfully",
      "color: #4CAF50",
    );
  } catch (error) {
    console.error(
      "%c[DRDO Midium Unlock] Error initialising rules:",
      "color: #f44336",
      error,
    );
  }
}

// Handle extension install / update ──────────────────────────────────────────
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

// Handle toggle messages from popup / content scripts
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
    return true; // async sendResponse is safe
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

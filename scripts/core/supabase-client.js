/* Creates a single shared Supabase client for the whole app.
   Loaded AFTER the Supabase CDN script and AFTER config.js.
   In PREVIEW mode (keys not added yet) we skip creating the client so the
   UI still runs without network errors. Add real keys to go fully live. */

(function () {
  if (window.isSupabaseConfigured()) {
    const { createClient } = window.supabase; // UMD global from the CDN
    window.sb = createClient(
      window.APP_CONFIG.SUPABASE_URL,
      window.APP_CONFIG.SUPABASE_ANON_KEY
    );
  } else {
    window.sb = null; // preview mode
    console.warn(
      "%c[PREVIEW MODE] Supabase keys not set yet — edit scripts/config.js to enable real auth.",
      "color:#b45309;font-weight:bold;"
    );
  }
})();

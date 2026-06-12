/* =========================================================
   SESSION helper — shared by feed / write / article pages.
   In preview mode (no Supabase keys) everything is allowed and
   the author is a local "pen name". In live mode, pages that call
   requireAuth() bounce logged-out visitors to the login page.
   ========================================================= */

window.Session = (function () {
  const live = window.isSupabaseConfigured();

  // Wait for Supabase to finish reading the OAuth token from the URL.
  function waitForSession(timeoutMs) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (s) => { if (!done) { done = true; resolve(s); } };
      const sub = window.sb.auth.onAuthStateChange((_event, session) => {
        if (session) { try { sub.data.subscription.unsubscribe(); } catch (_) {} finish(session); }
      });
      setTimeout(async () => {
        const { data } = await window.sb.auth.getSession();
        finish(data.session || null);
      }, timeoutMs || 2500);
    });
  }

  async function get() {
    if (!live) return { preview: true, user: null };
    if (!window.sb) return { preview: false, user: null }; // client failed to init => logged out
    const { data } = await window.sb.auth.getSession();
    // Just landed from an OAuth redirect but the token is still being processed?
    // Wait for it instead of treating the user as logged out (which causes a bounce).
    if (!data.session && window.__cameFromOAuth) {
      const session = await waitForSession();
      return { preview: false, user: session ? session.user : null };
    }
    return { preview: false, user: data.session ? data.session.user : null };
  }

  function displayName(user) {
    if (user) {
      const m = user.user_metadata || {};
      return m.full_name || m.name || m.user_name || m.preferred_username || user.email || "Reader";
    }
    return localStorage.getItem("midium-penname") || "You";
  }

  // brand-new account? (first sign-in happened within seconds of creation)
  function isNewUser(user) {
    if (!user || !user.created_at || !user.last_sign_in_at) return false;
    return Math.abs(new Date(user.last_sign_in_at) - new Date(user.created_at)) < 8000;
  }

  // returns the session info, or redirects to login (live + signed out)
  async function requireAuth() {
    const s = await get();
    if (!s.preview && !s.user) {
      // remember a deep link (e.g. a shared article) so we can return after login
      try {
        if (!/\/(index\.html)?$/.test(location.pathname)) {
          sessionStorage.setItem("midium-redirect", location.pathname + location.search);
        }
      } catch (_) {}
      window.location.href = window.APP_CONFIG.LOGIN_PATH;
      return null; // page stays hidden by the auth-gate during the redirect
    }
    document.documentElement.classList.remove("auth-gate"); // reveal the page
    return s;
  }

  async function signOut() {
    if (live && window.sb) await window.sb.auth.signOut();
    if (window.Paywall) window.Paywall.clearState();
    window.location.href = window.APP_CONFIG.LOGIN_PATH;
  }

  return { live, get, displayName, isNewUser, requireAuth, signOut };
})();

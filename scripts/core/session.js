/* =========================================================
   SESSION helper — shared by feed / write / article pages.
   In preview mode (no Supabase keys) everything is allowed and
   the author is a local "pen name". In live mode, pages that call
   requireAuth() bounce logged-out visitors to the login page.
   ========================================================= */

window.Session = (function () {
  const live = window.isSupabaseConfigured();

  async function get() {
    if (!live) return { preview: true, user: null };
    const { data } = await window.sb.auth.getSession();
    return { preview: false, user: data.session ? data.session.user : null };
  }

  function displayName(user) {
    if (user) return (user.user_metadata && user.user_metadata.full_name) || user.email || "Reader";
    return localStorage.getItem("midium-penname") || "You";
  }

  // returns the session info, or redirects to login (live + signed out)
  async function requireAuth() {
    const s = await get();
    if (!s.preview && !s.user) {
      window.location.href = window.APP_CONFIG.LOGIN_PATH;
      return null;
    }
    return s;
  }

  async function signOut() {
    if (live && window.sb) await window.sb.auth.signOut();
    window.location.href = window.APP_CONFIG.LOGIN_PATH;
  }

  return { live, get, displayName, requireAuth, signOut };
})();

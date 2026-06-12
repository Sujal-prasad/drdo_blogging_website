/* =============================================================
   CONFIG  —  EDIT THIS FILE WITH YOUR OWN SUPABASE CREDENTIALS
   =============================================================

   HOW TO GET THESE (see README.md for the full walkthrough):
   1. Go to https://supabase.com  ->  create a free account & a new project.
   2. In the project, open:  Settings (gear icon) -> API
   3. Copy the "Project URL"  ->  paste into SUPABASE_URL below.
   4. Copy the "anon public" key  ->  paste into SUPABASE_ANON_KEY below.

   ⚠️  ONLY use the "anon public" key here. NEVER paste the
       "service_role" / secret key into frontend code — it can be
       read by anyone who visits the site.

   Until you replace these placeholders, the site runs in DEMO MODE:
   every button still plays the full animation flow so you can preview
   the UX, but no real account is created.
   ============================================================= */

window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY",

  // Where to send the user after a successful login/signup:
  HOME_PATH: "index.html",

  // Where to send a logged-out user who tries to open a protected page:
  LOGIN_PATH: "login.html"
};

/* Helper: are real credentials filled in yet? */
window.isSupabaseConfigured = function () {
  const c = window.APP_CONFIG;
  return (
    c.SUPABASE_URL &&
    c.SUPABASE_ANON_KEY &&
    !c.SUPABASE_URL.includes("YOUR-PROJECT-REF") &&
    !c.SUPABASE_ANON_KEY.includes("YOUR-ANON")
  );
};

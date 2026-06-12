/* =========================================================
   AUTH LOGIC
   - sign in / sign up toggle
   - Google / GitHub OAuth
   - email + password
   - session check + redirect (handles "already has an account")
   - confetti celebration on success
   - PREVIEW mode fallback when Supabase keys aren't set
   ========================================================= */

(function () {
  const CFG = window.APP_CONFIG;
  const live = window.isSupabaseConfigured();
  const sb = window.sb;

  let mode = "signin"; // 'signin' | 'signup'

  /* ---------- tiny helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const toastStack = $("toastStack");

  function toast(msg, type = "info", ms = 4000) {
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : "💬";
    t.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
    toastStack.appendChild(t);
    setTimeout(() => {
      t.style.transition = "opacity .3s, transform .3s";
      t.style.opacity = "0";
      t.style.transform = "translateY(10px)";
      setTimeout(() => t.remove(), 300);
    }, ms);
  }

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasConfetti = typeof confetti === "function";

  /* Full-screen success card shown briefly before redirect. */
  function showOverlay(title, subtitle, emoji, tint) {
    const ov = document.createElement("div");
    ov.className = "success-overlay";
    ov.innerHTML =
      `<div class="success-card">
         <div class="success-emoji" style="--tint:${tint}">${emoji}</div>
         <h3>${title}</h3>
         <p>${subtitle}</p>
       </div>`;
    document.body.appendChild(ov);
    return ov; // entrance animation is handled by CSS (works without GSAP)
  }

  /* ---- SIGN IN: elegant, understated "welcome back" ---- */
  function celebrateSignin(then) {
    showOverlay("Welcome back 👋", "Good to see you again.", "📖", "#1a8917");
    if (hasConfetti) {
      // a single soft, brand-coloured puff from the centre
      confetti({ particleCount: 70, spread: 55, startVelocity: 26, gravity: 0.9,
        scalar: 0.9, origin: { y: 0.5 }, colors: ["#1a8917", "#e0a800", "#ffffff"] });
    }
    // mascot does a happy little bounce
    if (hasGSAP) gsap.fromTo(".mascot", { y: 0 }, { y: -14, duration: 0.25, yoyo: true, repeat: 3, ease: "power1.inOut" });
    setTimeout(then, 1600);
  }

  /* ---- SIGN UP: grand celebration with emoji + side cannons ---- */
  function celebrateSignup(then) {
    showOverlay("Welcome to Midium! 🎉", "Your reading journey starts now.", "🎉", "#e0a800");
    if (hasConfetti) {
      // emoji-shaped confetti (falls back gracefully on older builds)
      let shapes;
      try {
        shapes = ["📖", "✨", "🎉", "💡"].map((t) => confetti.shapeFromText({ text: t, scalar: 2 }));
      } catch (_) { shapes = undefined; }

      confetti({ particleCount: 40, spread: 120, scalar: 2, shapes, origin: { y: 0.5 } });

      const end = Date.now() + 1400;
      (function frame() {
        confetti({ particleCount: 6, angle: 60,  spread: 80, startVelocity: 55, origin: { x: 0 }, colors: ["#1a8917", "#e0a800", "#14130f"] });
        confetti({ particleCount: 6, angle: 120, spread: 80, startVelocity: 55, origin: { x: 1 }, colors: ["#1a8917", "#e0a800", "#14130f"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
    setTimeout(then, 2300);
  }

  // pick the right celebration based on the current mode
  function celebrateFor(then) {
    (mode === "signup" ? celebrateSignup : celebrateSignin)(then);
  }

  function goHome() { window.location.href = CFG.HOME_PATH; }

  /* ---------- demo-mode banner ---------- */
  if (!live) {
    const b = document.createElement("div");
    b.className = "demo-banner";
    b.innerHTML = "🔌 Preview mode — the UI is fully functional. Connect Supabase in <strong>scripts/config.js</strong> to enable real accounts &amp; go live.";
    document.body.appendChild(b);
    // push the floating theme toggle below the banner so they don't overlap
    const tt = document.getElementById("themeToggle");
    if (tt) tt.style.top = "46px";
  }

  /* ---------- surface any OAuth error from the last attempt ---------- */
  try {
    const oerr = sessionStorage.getItem("midium-oauth-error");
    if (oerr) { toast("Sign-in failed: " + oerr, "error", 8000); sessionStorage.removeItem("midium-oauth-error"); }
  } catch (_) {}

  /* ---------- OAuth return + already-logged-in handling ---------- */
  // OAuth (Google/GitHub) redirects back HERE, so we handle the session on this
  // page using an event listener — which fires exactly when the session is ready.
  const cameFromOAuth =
    location.hash.indexOf("access_token") !== -1 || /[?&]code=/.test(location.search);

  function isNewUser(user) {
    if (!user || !user.created_at || !user.last_sign_in_at) return false;
    return Math.abs(new Date(user.last_sign_in_at) - new Date(user.created_at)) < 8000;
  }

  // resolves with the session the moment Supabase establishes it (no polling/race)
  // Set up listener BEFORE calling getSession to avoid race condition
  function waitForSession(timeoutMs) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (s) => { if (!done) { done = true; resolve(s); } };
      
      // Register listener first (this will fire if session changes)
      const sub = sb.auth.onAuthStateChange((_e, session) => { 
        if (session) {
          try { sub.data.subscription.unsubscribe(); } catch (_) {}
          finish(session);
        }
      });
      
      // Then check for existing session (catches already-loaded sessions)
      sb.auth.getSession().then(({ data }) => { 
        if (data.session) {
          try { sub.data.subscription.unsubscribe(); } catch (_) {}
          finish(data.session);
        }
      });
      
      // Timeout fallback
      setTimeout(() => finish(null), timeoutMs || 4000);
    });
  }

  async function handleEntry() {
    if (!live) return;

    // surface any provider error returned in the URL
    const errMatch = location.hash.match(/error_description=([^&]+)/) ||
                     location.search.match(/error_description=([^&]+)/);
    if (errMatch) toast("Sign-in failed: " + decodeURIComponent(errMatch[1].replace(/\+/g, " ")), "error", 8000);

    if (cameFromOAuth) {
      const session = await waitForSession();
      if (session) {
        (isNewUser(session.user) ? celebrateSignup : celebrateSignin)(goHome);
      } else if (!errMatch) {
        toast("Sign-in didn't complete. Please try again.", "error");
      }
      return;
    }

    // opened the login page while already signed in → go home
    // Use waitForSession to handle case where session is still being loaded from storage
    const session = await waitForSession(2000);
    if (session) {
      toast("You're already signed in — taking you home.", "success", 2500);
      setTimeout(goHome, 1200);
    }
  }
  handleEntry();

  /* =========================================================
     UI: sign in / sign up toggle
     ========================================================= */
  const seg = $("seg");
  const nameField = $("nameField");
  const formTitle = $("formTitle");
  const formSubtitle = $("formSubtitle");
  const emailSubmit = $("emailSubmit");
  const formFoot = $("formFoot");

  function applyMode() {
    const signup = mode === "signup";
    seg.classList.toggle("signup", signup);
    $("tabSignin").classList.toggle("active", !signup);
    $("tabSignup").classList.toggle("active", signup);
    nameField.classList.toggle("hidden", !signup);
    formTitle.textContent = signup ? "Create your account" : "Welcome back";
    formSubtitle.textContent = signup
      ? "Start reading and writing in seconds."
      : "Sign in to pick up where you left off.";
    emailSubmit.textContent = signup ? "Create account" : "Sign in";
    formFoot.innerHTML = signup
      ? `Already have an account? <button class="linkish" id="footSwitch" type="button">Sign in</button>`
      : `New here? <button class="linkish" id="footSwitch" type="button">Create an account</button>`;
    bindFootSwitch();
  }

  function bindFootSwitch() {
    const fs = $("footSwitch");
    if (fs) fs.addEventListener("click", () => { mode = mode === "signup" ? "signin" : "signup"; applyMode(); });
  }

  $("tabSignin").addEventListener("click", () => { mode = "signin"; applyMode(); });
  $("tabSignup").addEventListener("click", () => { mode = "signup"; applyMode(); });
  bindFootSwitch();

  const emailForm = $("emailForm");

  /* =========================================================
     OAuth (Google / GitHub)
     ========================================================= */
  document.querySelectorAll(".btn-oauth").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const provider = btn.dataset.provider;
      if (!live) {
        toast(`(Preview) Would open ${provider} sign-in…`, "info");
        celebrateFor(goHome);
        return;
      }
      btn.disabled = true;
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        // return to the feed (the URL already confirmed working in your allow-list)
        options: { redirectTo: window.location.origin + CFG.HOME_PATH }
      });
      if (error) { toast(error.message, "error"); btn.disabled = false; }
      // On success the browser is redirected by the provider automatically.
    });
  });

  /* =========================================================
     Email + password submit
     ========================================================= */
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("email").value.trim();
    const password = $("password").value;
    const name = $("name").value.trim();
    if (!email || !password) return toast("Please fill in your email and password.", "error");

    emailSubmit.disabled = true;
    const original = emailSubmit.textContent;
    emailSubmit.textContent = "Please wait…";

    if (!live) {
      toast(`(Preview) ${mode === "signup" ? "Account created" : "Signed in"}!`, "success");
      celebrateFor(goHome);
      emailSubmit.disabled = false; emailSubmit.textContent = original;
      return;
    }

    try {
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (error) {
          // Supabase signals an existing user in a few ways:
          if (/already|registered|exists/i.test(error.message)) {
            toast("Looks like you already have an account — switching you to sign in.", "info");
            mode = "signin"; applyMode();
          } else {
            toast(error.message, "error");
          }
        } else if (data.user && !data.session) {
          toast("Almost there! Check your inbox to confirm your email.", "success", 6000);
        } else {
          // Wait for the session to actually be established before celebrating/redirecting
          const session = await waitForSession(3000);
          if (session) {
            celebrateSignup(goHome);
          } else {
            toast("Account created but taking a moment to sync… redirecting now.", "info");
            setTimeout(goHome, 800);
          }
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          toast(error.message.includes("Invalid") ? "Wrong email or password. Try again?" : error.message, "error");
        } else {
          // Wait for the session to actually be established before celebrating/redirecting
          const session = await waitForSession(3000);
          if (session) {
            celebrateSignin(goHome);
          } else {
            toast("Session established but taking a moment to sync… redirecting now.", "info");
            setTimeout(goHome, 800);
          }
        }
      }
    } catch (err) {
      toast("Something went wrong: " + err.message, "error");
    } finally {
      emailSubmit.disabled = false; emailSubmit.textContent = original;
    }
  });

  // ensure mascot binds to password field that exists at load
  if (window.MascotEyes && window.MascotEyes.rebind) window.MascotEyes.rebind();
})();

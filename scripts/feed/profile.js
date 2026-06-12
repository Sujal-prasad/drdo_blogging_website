/* =========================================================
   PROFILE / SETTINGS
   - display name, appearance (theme), password, membership
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);

  function toast(msg, type = "success") {
    const stack = $("#toastStack"); if (!stack) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${type === "error" ? "⚠️" : "✅"}</span><span>${msg}</span>`;
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* ---- appearance ---- */
  function currentThemeChoice() {
    return localStorage.getItem("midium-theme") || "system";
  }
  function applyTheme(choice) {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (choice === "system") {
      localStorage.removeItem("midium-theme");
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      localStorage.setItem("midium-theme", choice);
      document.documentElement.setAttribute("data-theme", choice);
    }
    paintThemeSeg();
    // theme-toggle icon is handled by CSS (.theme-toggle::before)
  }
  function paintThemeSeg() {
    const cur = currentThemeChoice();
    $("#themeSeg").querySelectorAll("button").forEach((b) =>
      b.classList.toggle("active", b.dataset.themeChoice === cur));
  }
  $("#themeSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    applyTheme(b.dataset.themeChoice);
  });

  /* ---- membership ---- */
  function refreshMembership() {
    const member = Paywall.isMember();
    $("#memberStatus").textContent = member
      ? "★ You're a Midium member — unlimited reading."
      : `Free plan · ${Paywall.remainingFree()} of ${Paywall.FREE_LIMIT} free articles left.`;
    $("#cancelMember").hidden = !member;
    $("#joinMember").hidden = member;
  }
  $("#cancelMember").addEventListener("click", () => {
    UI.confirm({
      title: "Cancel membership?", emoji: "💔",
      body: "You'll lose unlimited access and return to the free plan (5 free articles).",
      confirmText: "Cancel membership", cancelText: "Keep membership", danger: true,
      onConfirm: () => { Paywall.cancel(); refreshMembership(); toast("Membership cancelled. You're back on the free plan."); }
    });
  });
  $("#joinMember").addEventListener("click", () => {
    Paywall.subscribe(() => { refreshMembership(); toast("Welcome — you're a Midium member! 🎉"); });
  });

  /* ---- password strength meter ---- */
  const PW_LEVELS = [
    { label: "Too short", color: "#c0392b", w: "12%" },
    { label: "Weak",      color: "#e67e22", w: "33%" },
    { label: "Okay",      color: "#e0a800", w: "58%" },
    { label: "Good",      color: "#3fae3b", w: "80%" },
    { label: "Strong",    color: "#1a8917", w: "100%" }
  ];
  function scorePw(v) {
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4);
  }
  (function () {
    const inp = $("#newPass"), box = $("#pwStrength");
    if (!inp || !box) return;
    const bar = box.querySelector("i"), label = box.querySelector(".pw-label");
    inp.addEventListener("input", () => {
      if (!inp.value) { box.classList.add("hidden"); return; }
      box.classList.remove("hidden");
      const lvl = PW_LEVELS[scorePw(inp.value)];
      bar.style.width = lvl.w; bar.style.background = lvl.color;
      label.textContent = lvl.label; label.style.color = lvl.color;
    });
  })();

  $("#signout").addEventListener("click", () => Session.signOut());

  /* ---- init ---- */
  async function init() {
    const s = await Session.requireAuth();
    if (!s) return;
    const user = s.user;
    const live = Session.live;

    const name = Session.displayName(user);
    const email = (user && user.email) || "";
    const provider = (user && user.app_metadata && user.app_metadata.provider) || (live ? "email" : "preview");
    const avatarUrl = user && user.user_metadata && user.user_metadata.avatar_url;

    $("#nameLabel").textContent = name;
    $("#emailLabel").textContent = email || "—";
    $("#providerLabel").textContent = "Signed in with " + provider;
    $("#displayName").value = (user && user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
      localStorage.getItem("midium-penname") || "";

    const avatar = $("#avatar");
    if (avatarUrl) { avatar.style.backgroundImage = `url('${avatarUrl}')`; avatar.classList.add("has-img"); }
    else avatar.textContent = (name.trim().charAt(0) || "?").toUpperCase();

    paintThemeSeg();
    refreshMembership();

    // password section copy adapts to provider
    if (provider !== "email") {
      $("#pwHeading").textContent = "Set a password";
      $("#pwNote").textContent = `You currently sign in with ${provider}. Set a password to also log in with email + ${email || "your address"}.`;
    } else {
      $("#pwNote").textContent = "Choose a new password for your account.";
    }

    /* save display name */
    $("#saveName").addEventListener("click", async () => {
      const newName = $("#displayName").value.trim();
      if (!newName) return toast("Name can't be empty.", "error");
      localStorage.setItem("midium-penname", newName);
      if (!live || !window.sb) { $("#nameLabel").textContent = newName; return toast("Name updated."); }
      const { error } = await window.sb.auth.updateUser({ data: { full_name: newName } });
      if (error) return toast(error.message, "error");
      $("#nameLabel").textContent = newName;
      toast("Name updated.");
    });

    /* update password */
    $("#savePass").addEventListener("click", async () => {
      const p = $("#newPass").value, c = $("#confirmPass").value;
      if (p.length < 6) return toast("Password must be at least 6 characters.", "error");
      if (p !== c) return toast("Passwords don't match.", "error");
      if (!live || !window.sb) return toast("Connect Supabase to change your password.", "error");
      $("#savePass").disabled = true;
      const { error } = await window.sb.auth.updateUser({ password: p });
      $("#savePass").disabled = false;
      if (error) return toast(error.message, "error");
      $("#newPass").value = ""; $("#confirmPass").value = "";
      toast("Password updated.");
    });
  }

  init();
})();

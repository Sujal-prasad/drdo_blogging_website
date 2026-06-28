/* =========================================================
   PAYWALL  (simulated — front-end only, no real charges)
   - first 5 articles are free, after that they're blurred
   - a checkout (Card / UPI / Net-banking) unlocks unlimited reading
   - membership + read-count persist in localStorage
   ========================================================= */

window.Paywall = (function () {
  const FREE_LIMIT = 5;
  const READS_KEY  = "midium-reads";
  const MEMBER_KEY = "midium-member";
  const PRICE = "₹199";

  const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---- state ---- */
  function getReads() { try { return JSON.parse(localStorage.getItem(READS_KEY)) || []; } catch (_) { return []; } }
  function saveReads(a) { localStorage.setItem(READS_KEY, JSON.stringify(a)); }
  function isMember() { return localStorage.getItem(MEMBER_KEY) === "true"; }
  function setMember(v) { localStorage.setItem(MEMBER_KEY, v ? "true" : "false"); }
  // cancel membership and reset the free-article allowance back to a fresh 5
  function cancel() { setMember(false); localStorage.removeItem(READS_KEY); }
  // used on sign out: drop membership, but KEEP the free-read tally so logging
  // out and back in (or refreshing) can't hand out a fresh batch of free reads.
  function clearState() { setMember(false); }
  function remainingFree() { return Math.max(0, FREE_LIMIT - getReads().length); }
  function recordRead(id) { const r = getReads(); if (!r.includes(id)) { r.push(id); saveReads(r); } }

  // would this article be locked? (no side effects — used for badges on the feed/reels)
  function isLocked(article) {
    if (isMember() || article.userPost) return false;
    const reads = getReads();
    if (reads.includes(article.id)) return false;
    return reads.length >= FREE_LIMIT;
  }

  /* ---- gate decision ----
     returns true if the article is locked (blurred + checkout shown).      */
  function gate(article, opts) {
    opts = opts || {};
    const blurTarget = opts.blurTarget;

    // members, and your own posts, are always free
    if (isMember() || article.userPost) return false;

    const reads = getReads();
    if (reads.includes(article.id)) return false;       // already counted
    if (reads.length < FREE_LIMIT) { recordRead(article.id); return false; } // still free

    if (blurTarget) blurTarget.classList.add("paywalled");
    openCheckout(article, blurTarget, opts.onUnlock);
    return true;
  }

  // open the checkout voluntarily (e.g. from a "Go Premium" button)
  function subscribe(onSuccess) {
    openCheckout(null, null, onSuccess, {
      heading: "Become a Midium member",
      sub: "Unlimited access to every story — read without limits."
    });
  }

  /* ---- the checkout modal ---- */
  function openCheckout(article, blurTarget, onUnlock, opts) {
    opts = opts || {};
    const heading = opts.heading || "You've reached your free limit";
    const sub = opts.sub || `You've read your ${FREE_LIMIT} free articles. Become a member for unlimited access to every story.`;
    const ov = document.createElement("div");
    ov.className = "pay-overlay";
    ov.innerHTML = `
      <div class="pay-card" role="dialog" aria-modal="true">
        <div class="pay-brand">⚡ RazorPlay</div>
        <div class="pay-head">
          <span class="pay-kicker">Midium Membership</span>
          <h2>${heading}</h2>
          <p>${sub}</p>
        </div>

        <div class="pay-plan">
          <div>
            <strong>Monthly membership</strong>
            <span>Unlimited articles · cancel anytime</span>
          </div>
          <div class="pay-price">${PRICE}<small>/mo</small></div>
        </div>

        <div class="pay-tabs">
          <button class="pay-tab active" data-pane="card">Card</button>
          <button class="pay-tab" data-pane="upi">UPI</button>
          <button class="pay-tab" data-pane="netbanking">Net banking</button>
        </div>

        <div class="pay-pane" data-pane="card">
          <label>Card number<input id="pf-card" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="19"></label>
          <div class="pay-row">
            <label>Expiry<input id="pf-exp" placeholder="MM/YY" maxlength="5"></label>
            <label>CVV<input id="pf-cvv" inputmode="numeric" placeholder="123" maxlength="4"></label>
          </div>
          <label>Name on card<input id="pf-name" placeholder="Full name"></label>
        </div>

        <div class="pay-pane hidden" data-pane="upi">
          <label>UPI ID<input id="pf-upi" placeholder="yourname@bank"></label>
          <p class="pay-hint">A (simulated) collect request will be sent to your UPI app.</p>
        </div>

        <div class="pay-pane hidden" data-pane="netbanking">
          <label>Bank<select id="pf-bank">
            <option value="">Select your bank</option>
            <option>HDFC Bank</option><option>State Bank of India</option>
            <option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option>
          </select></label>
        </div>

        <p class="pay-error" id="pf-error"></p>

        <button class="pay-pay" id="pf-pay">Pay ${PRICE}</button>
        <button class="pay-later" id="pf-later">Maybe later</button>
        <p class="pay-secure">🔒 Secured by RazorPlay™ — simulated checkout, no real payment is taken.</p>
      </div>`;
    document.body.appendChild(ov);
    document.body.classList.add("pay-locked"); // lock scroll so the article can't be read behind it

    let method = "card";

    // tab switching
    ov.querySelectorAll(".pay-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        method = tab.dataset.pane;
        ov.querySelectorAll(".pay-tab").forEach((t) => t.classList.toggle("active", t === tab));
        ov.querySelectorAll(".pay-pane").forEach((p) => p.classList.toggle("hidden", p.dataset.pane !== method));
        setError("");
      });
    });

    // light card-number formatting (groups of 4)
    const cardInput = ov.querySelector("#pf-card");
    cardInput.addEventListener("input", () => {
      const digits = cardInput.value.replace(/\D/g, "").slice(0, 16);
      cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });
    const expInput = ov.querySelector("#pf-exp");
    expInput.addEventListener("input", () => {
      let d = expInput.value.replace(/\D/g, "").slice(0, 4);
      if (d.length >= 3) d = d.slice(0, 2) + "/" + d.slice(2);
      expInput.value = d;
    });

    const errEl = ov.querySelector("#pf-error");
    function setError(msg) { errEl.textContent = msg; }

    function validate() {
      if (method === "card") {
        const num = ov.querySelector("#pf-card").value.replace(/\s/g, "");
        const exp = ov.querySelector("#pf-exp").value;
        const cvv = ov.querySelector("#pf-cvv").value;
        const name = ov.querySelector("#pf-name").value.trim();
        if (num.length < 12) return "Enter a valid card number.";
        if (!/^\d{2}\/\d{2}$/.test(exp)) return "Enter expiry as MM/YY.";
        if (!/^\d{3,4}$/.test(cvv)) return "Enter a valid CVV.";
        if (!name) return "Enter the name on the card.";
      } else if (method === "upi") {
        const upi = ov.querySelector("#pf-upi").value.trim();
        if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) return "Enter a valid UPI ID (e.g. name@bank).";
      } else {
        if (!ov.querySelector("#pf-bank").value) return "Please choose your bank.";
      }
      return "";
    }

    // shared success step
    function completePayment() {
      setMember(true);
      if (article) recordRead(article.id);
      if (blurTarget) blurTarget.classList.remove("paywalled");
      ov.querySelector(".pay-card").innerHTML = `
        <div class="pay-success">
          <div class="success-emoji">🎉</div>
          <h2>You're a member!</h2>
          <p>Enjoy unlimited reading. Welcome aboard.</p>
        </div>`;
      if (typeof confetti === "function") confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } });
      setTimeout(() => {
        ov.style.transition = "opacity .4s ease";
        ov.style.opacity = "0";
        setTimeout(() => { ov.remove(); document.body.classList.remove("pay-locked"); if (onUnlock) onUnlock(); }, 400);
      }, 1500);
    }

    // simulated net-banking: a mock bank portal (login -> confirm -> pay)
    function showBankPage(bank) {
      const card = ov.querySelector(".pay-card");
      card.classList.add("bank-mode");
      card.innerHTML = `
        <div class="bank-head">
          <span class="bank-name">🏦 ${esc(bank)}</span>
          <span class="bank-secure">🔒 Secure NetBanking</span>
        </div>
        <div class="bank-body">
          <h3>Log in to your account</h3>
          <label>Customer / User ID<input id="bk-user" placeholder="Enter your user ID"></label>
          <label>Password<input id="bk-pass" type="password" placeholder="Enter your password"></label>
          <p class="pay-error" id="bk-err"></p>
          <button class="pay-pay" id="bk-login">Log in</button>
          <button class="pay-later" id="bk-back">Cancel</button>
          <p class="pay-secure">Simulated bank page — type anything; no real login happens.</p>
        </div>`;
      card.querySelector("#bk-back").addEventListener("click", () => { window.location.href = "/index.html"; });
      card.querySelector("#bk-login").addEventListener("click", () => {
        const u = card.querySelector("#bk-user").value.trim();
        const p = card.querySelector("#bk-pass").value.trim();
        if (!u || !p) { card.querySelector("#bk-err").textContent = "Enter your user ID and password."; return; }
        const acct = Math.floor(1000 + Math.random() * 9000);
        card.querySelector(".bank-body").outerHTML = `
          <div class="bank-body">
            <h3>Confirm payment</h3>
            <div class="bank-confirm">
              <div><span>Paying to</span><strong>Midium · RazorPlay</strong></div>
              <div><span>Amount</span><strong>${PRICE}</strong></div>
              <div><span>Account</span><strong>${esc(bank)} ••••${acct}</strong></div>
            </div>
            <button class="pay-pay" id="bk-confirm">Pay ${PRICE}</button>
            <button class="pay-later" id="bk-cancel">Cancel</button>
          </div>`;
        card.querySelector("#bk-cancel").addEventListener("click", () => { window.location.href = "/index.html"; });
        card.querySelector("#bk-confirm").addEventListener("click", () => {
          const b = card.querySelector("#bk-confirm");
          b.disabled = true; b.innerHTML = `<span class="pay-spinner"></span> Authorising…`;
          setTimeout(completePayment, 1500);
        });
      });
    }

    // pay
    const payBtn = ov.querySelector("#pf-pay");
    payBtn.addEventListener("click", () => {
      const err = validate();
      if (err) { setError(err); return; }
      setError("");
      if (method === "netbanking") { showBankPage(ov.querySelector("#pf-bank").value); return; }
      payBtn.disabled = true;
      payBtn.innerHTML = `<span class="pay-spinner"></span> Processing…`;
      setTimeout(completePayment, 1600);
    });

    ov.querySelector("#pf-later").addEventListener("click", () => {
      window.location.href = "/index.html";
    });
  }

  return { FREE_LIMIT, PRICE, isMember, setMember, cancel, clearState, subscribe, remainingFree, getReads, recordRead, isLocked, gate };
})();

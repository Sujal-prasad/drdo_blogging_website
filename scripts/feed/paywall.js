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

  /* ---- state ---- */
  function getReads() { try { return JSON.parse(localStorage.getItem(READS_KEY)) || []; } catch (_) { return []; } }
  function saveReads(a) { localStorage.setItem(READS_KEY, JSON.stringify(a)); }
  function isMember() { return localStorage.getItem(MEMBER_KEY) === "true"; }
  function setMember(v) { localStorage.setItem(MEMBER_KEY, v ? "true" : "false"); }
  function remainingFree() { return Math.max(0, FREE_LIMIT - getReads().length); }
  function recordRead(id) { const r = getReads(); if (!r.includes(id)) { r.push(id); saveReads(r); } }

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

  /* ---- the checkout modal ---- */
  function openCheckout(article, blurTarget, onUnlock) {
    const ov = document.createElement("div");
    ov.className = "pay-overlay";
    ov.innerHTML = `
      <div class="pay-card" role="dialog" aria-modal="true">
        <div class="pay-head">
          <span class="pay-kicker">Midium Membership</span>
          <h2>You've reached your free limit</h2>
          <p>You've read your ${FREE_LIMIT} free articles. Become a member for unlimited access to every story.</p>
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
        <p class="pay-secure">🔒 This is a simulated checkout — no real payment is taken.</p>
      </div>`;
    document.body.appendChild(ov);

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

    // pay
    const payBtn = ov.querySelector("#pf-pay");
    payBtn.addEventListener("click", () => {
      const err = validate();
      if (err) { setError(err); return; }
      setError("");
      payBtn.disabled = true;
      payBtn.innerHTML = `<span class="pay-spinner"></span> Processing…`;

      setTimeout(() => {
        // success
        setMember(true);
        recordRead(article.id);
        if (blurTarget) blurTarget.classList.remove("paywalled");

        ov.querySelector(".pay-card").innerHTML = `
          <div class="pay-success">
            <div class="success-emoji">🎉</div>
            <h2>You're a member!</h2>
            <p>Enjoy unlimited reading. Welcome aboard.</p>
          </div>`;
        if (typeof confetti === "function") {
          confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } });
        }
        setTimeout(() => {
          ov.style.transition = "opacity .4s ease";
          ov.style.opacity = "0";
          setTimeout(() => { ov.remove(); if (onUnlock) onUnlock(); }, 400);
        }, 1500);
      }, 1600);
    });

    ov.querySelector("#pf-later").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  return { FREE_LIMIT, PRICE, isMember, setMember, remainingFree, getReads, recordRead, gate };
})();

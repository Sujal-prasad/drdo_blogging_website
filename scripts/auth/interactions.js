/* =========================================================
   POLISH / MICRO-INTERACTIONS  (login page only)
   - GSAP staggered entrance
   - password: reveal toggle, caps-lock hint, live strength meter
   - rotating editorial ticker
   ========================================================= */

(function () {
  const $ = (id) => document.getElementById(id);
  const hasGSAP = typeof window.gsap !== "undefined";

  /* ---------- 1. Entrance animation ---------- */
  if (hasGSAP) {
    gsap.set(".brand-logo, .mascot, .brand-copy h1, .brand-copy p, .ticker", { opacity: 0, y: 18 });
    gsap.set(".form-card > *", { opacity: 0, y: 16 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
    tl.to(".brand-logo", { opacity: 1, y: 0 }, 0.1)
      .to(".mascot", { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.5)" }, 0.2)
      .to(".brand-copy h1", { opacity: 1, y: 0 }, 0.35)
      .to(".brand-copy p", { opacity: 1, y: 0 }, 0.45)
      .to(".ticker", { opacity: 1, y: 0 }, 0.55)
      .to(".form-card > *", { opacity: 1, y: 0, stagger: 0.07 }, 0.3);
  }

  /* ---------- 2. Password reveal toggle ---------- */
  const pwd = $("password");
  const reveal = $("revealPwd");
  if (reveal && pwd) {
    // keep focus in the input so the mascot stays "covering" while peeking
    reveal.addEventListener("mousedown", (e) => e.preventDefault());
    reveal.addEventListener("click", () => {
      const show = pwd.type === "password";
      pwd.type = show ? "text" : "password";
      reveal.textContent = show ? "🙈" : "👁️";
      reveal.setAttribute("aria-label", show ? "Hide password" : "Show password");
      pwd.focus();
    });
  }

  /* ---------- 3. Caps-lock hint ---------- */
  const capsHint = $("capsHint");
  if (pwd && capsHint) {
    const check = (e) => {
      const on = e.getModifierState && e.getModifierState("CapsLock");
      capsHint.classList.toggle("hidden", !on);
    };
    pwd.addEventListener("keydown", check);
    pwd.addEventListener("keyup", check);
    pwd.addEventListener("blur", () => capsHint.classList.add("hidden"));
  }

  /* ---------- 4. Live strength meter (signup only) ---------- */
  const strength = $("strength");
  const nameField = $("nameField"); // visible only in signup mode
  function scorePassword(v) {
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4); // 0..4
  }
  const LEVELS = [
    { label: "Too short", color: "#c0392b", w: "12%" },
    { label: "Weak",      color: "#e67e22", w: "33%" },
    { label: "Okay",      color: "#e0a800", w: "58%" },
    { label: "Good",      color: "#3fae3b", w: "80%" },
    { label: "Strong",    color: "#1a8917", w: "100%" }
  ];
  if (pwd && strength) {
    const bar = strength.querySelector("i");
    const label = strength.querySelector(".strength-label");
    pwd.addEventListener("input", () => {
      const signup = nameField && !nameField.classList.contains("hidden");
      if (!signup || !pwd.value) { strength.classList.add("hidden"); return; }
      strength.classList.remove("hidden");
      const lvl = LEVELS[scorePassword(pwd.value)];
      bar.style.width = lvl.w;
      bar.style.background = lvl.color;
      label.textContent = lvl.label;
      label.style.color = lvl.color;
    });
  }

  /* ---------- 5. Rotating editorial ticker ---------- */
  const tickerText = $("tickerText");
  if (tickerText) {
    const lines = [
      // hustle / startups
      "“How I Made $0 Following My Passion.”",
      "“I Quit My 9-to-5 to Pursue My 24/7.”",
      "“My Startup Has No Product, No Revenue, and 400k LinkedIn Followers.”",
      "“We're Not a Company, We're a Family That Doesn't Pay Overtime.”",
      "“Fail Fast, Fail Often, Fail in a Mansion.”",
      // crypto / finance
      "“I Put My Life Savings Into a Coin Named After My Dog.”",
      "“Passive Income Changed My Life. My Dad's Income, Specifically.”",
      "“I Lost Everything and Gained a Podcast.”",
      // tech / AI
      "“I Replaced My Therapist With a Chatbot. Now We're Both Confused.”",
      "“I Asked AI to Fix My Life. It Said: Turn Me Off and On Again.”",
      "“My Smart Fridge Joined a Union.”",
      "“Web4 Is Here and It's Just Web3 Wearing a Hat.”",
      // wellness / self-help
      "“I Drank Only Water for 30 Days. Doctors Call It 'Being Alive.'”",
      "“Manifest Your Dreams: I Manifested Rent. It Did Not Arrive.”",
      "“I Did 75 Hard and All I Got Was This Personality.”",
      "“Dopamine Detox: Day 1 Was Also Day Last.”",
      // fitness
      "“I Ran a Marathon to Avoid a Conversation.”",
      "“My Trainer Ghosted Me. Honestly, That's the Cardio.”",
      // dating
      "“I Found Love on a Productivity App.”",
      "“Situationship Update: We're Now Legally Strangers.”",
      "“Red Flags Are Just Spicy Personality Traits, Apparently.”",
      // social media
      "“How I Got 1M Followers by Having Nothing to Say.”",
      "“Going Viral Ruined My Life and My Group Chat.”",
      // corporate
      "“We're 'Pivoting' — Latin for 'We Have No Idea.'”",
      "“My Boss Said Think Outside the Box, So I Left the Building.”",
      "“Return to Office: A Love Story Nobody Wanted.”",
      "“I Got Promoted to a Title With No Salary Change.”",
      // real estate / economy
      "“How I Bought a House: A Work of Fiction.”",
      "“Avocado Toast Update: Still Cheaper Than a Mortgage.”",
      // politics-lite / society
      "“Local Man Solves Geopolitics in Comment Section, Awaits Nobel.”",
      "“I Read One Article and I'm Now a Foreign Policy Expert.”",
      "“Both Sides Agree: The Other Side Is the Problem.”",
      // food
      "“I Tried the Viral Recipe. The Fire Department Was Not Impressed.”",
      "“Is Cereal a Soup? An Investigation Nobody Requested.”",
      "“I Spent $19 on a Latte to Feel Something.”",
      // parenting / travel / celebrity
      "“My Toddler Negotiates Better Than My Agent.”",
      "“Digital Nomad Diaries: I Have Wi-Fi but No Purpose.”",
      "“I Took 14 Flights to a Climate Conference.”",
      "“Celebrity Launches Skincare Line, Solves Nothing.”",
      // more, by popular demand
      "“My Houseplant Died, So Naturally I Started a Grief Newsletter.”",
      "“I Networked So Hard I Forgot to Get a Job.”",
      "“Quiet Quitting? I Never Started.”",
      "“I Bought a Standing Desk to Lie Down Near.”",
      "“My Vision Board Manifested a Second Vision Board.”",
      "“I Started a Side Hustle to Fund My Other Failing Side Hustle.”",
      "“Billionaire Reveals Secret: He Woke Up Already Rich.”",
      "“I Took a Digital Detox and Live-Blogged the Whole Thing.”",
      "“My Sourdough Starter Has More Followers Than I Do.”",
      "“I Read the Terms and Conditions. I Am Now Legally a Toaster.”",
      "“I Tried Minimalism. Now I Own Nothing and Mention It Constantly.”",
      "“CEO Steps Down to Spend More Time Avoiding the Family Office.”",
      "“Man Wins Argument in Head, Celebrates Alone in Car.”",
      "“I Joined a Book Club. We Discuss the Wine.”",
      // a bit unhinged
      "“I Achieved Inbox Zero by Throwing My Laptop Into the Sea.”",
      "“Local Man Declares War on a Single Pigeon, Loses.”",
      "“I Replaced Sleep With Ambition and Now I Can See Sounds.”",
      "“My Manifestation Coach Was a Raccoon the Whole Time.”",
      "“I Achieved Work-Life Balance by Eliminating Both.”",
      "“Scientists Confirm Mondays Are a Government Construct.”",
      "“I Trained My Cat to Answer Emails. It Says No to Everything.”",
      "“I Optimized My Morning Routine Down to a Single Scream.”",
      "“Breaking: Man Who Said 'Per My Last Email' Found Smiling.”",
      "“I Married My Houseplant for the Tax Benefits.”",
      "“I Hustled So Hard I Looped Back Around to Unemployed.”",
      "“Area Man Still Not Over Something That Happened in 2009.”",
      "“I Quit Caffeine. Authorities Are Monitoring the Situation.”",
      "“I Found Inner Peace in a Parking Lot. It's $4 an Hour.”",
      "“I Now Communicate Exclusively in Sighs and Spreadsheets.”"
    ];
    // shuffle so the rotation is different every visit
    for (let k = lines.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [lines[k], lines[j]] = [lines[j], lines[k]];
    }
    let i = 0;
    setInterval(() => {
      i = (i + 1) % lines.length;
      tickerText.style.opacity = "0";
      setTimeout(() => {
        tickerText.textContent = lines[i];
        tickerText.style.opacity = "1";
      }, 350);
    }, 6000);
  }
})();

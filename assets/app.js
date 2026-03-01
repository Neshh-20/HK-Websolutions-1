// ---------- Helpers ----------
function playInAnimation() {
  // restart animation safely (also for BFCache)
  document.body.classList.remove("animate-out");
  document.body.classList.remove("animate-in");
  requestAnimationFrame(() => {
    document.body.classList.add("animate-in");
  });
}

// ---------- Always show page on load & back/forward ----------
document.addEventListener("DOMContentLoaded", () => {
  playInAnimation();

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Preselect package on Anfrage page
  const params = new URLSearchParams(window.location.search);
  const paket = params.get("paket");
  const interestSelect = document.querySelector("#interestSelect");
  if (paket && interestSelect) {
    interestSelect.value = paket;
  }
});

// BFCache fix: triggers on back/forward navigation too
window.addEventListener("pageshow", () => {
  playInAnimation();
});

// ---------- Mobile nav ----------
const burger = document.querySelector(".burger");
const mobileNav = document.querySelector("#mobileNav");

function closeMobileNav() {
  burger?.setAttribute("aria-expanded", "false");
  mobileNav?.classList.remove("open");
}

burger?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(isOpen));
});

mobileNav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", closeMobileNav);
});

// ---------- Animated navigation (no new bugs) ----------
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;

  const href = a.getAttribute("href");
  if (!href) return;

  // allow normal behavior for anchors, external, mailto, tel, downloads, new tab
  const isAnchor = href.startsWith("#");
  const isMailOrTel = href.startsWith("mailto:") || href.startsWith("tel:");
  const isExternal = href.startsWith("http");
  const isDownload = a.hasAttribute("download");
  const newTab = a.getAttribute("target") === "_blank";
  if (isAnchor || isMailOrTel || isExternal || isDownload || newTab) return;

  // If same page link (rare), do nothing
  const current = window.location.pathname.split("/").pop() || "index.html";
  if (href === current) return;

  // animated out, then navigate
  e.preventDefault();
  closeMobileNav();

  document.body.classList.remove("animate-in");
  document.body.classList.add("animate-out");

  setTimeout(() => {
    window.location.href = href;
  }, 200);
});

// ---------- Netlify form async submit + status ----------
const form = document.querySelector("#offerForm");
const statusEl = document.querySelector("#formStatus");
const submitBtn = document.querySelector("#submitBtn");

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (statusEl) statusEl.textContent = "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Sende…";
  }

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode(data),
    });

    if (!res.ok) throw new Error("Network response was not ok");

    form.reset();
    if (statusEl) {
      statusEl.textContent = "✅ Anfrage gesendet";
      statusEl.style.color = "rgba(74,222,128,.95)";
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = "❌ Konnte nicht gesendet werden. Bitte später erneut versuchen.";
      statusEl.style.color = "rgba(239,68,68,.95)";
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Anfrage senden";
    }
  }
});

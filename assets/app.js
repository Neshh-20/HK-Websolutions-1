// ===== Page transition (fade/slide in/out) =====
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-in");
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

// Intercept internal nav links for animated page transitions
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;

  const href = a.getAttribute("href");
  if (!href) return;

  // ignore anchor links, mailto, tel, external
  const isExternal = href.startsWith("http");
  const isAnchor = href.startsWith("#");
  const isMailOrTel = href.startsWith("mailto:") || href.startsWith("tel:");
  if (isExternal || isAnchor || isMailOrTel) return;

  e.preventDefault();
  document.body.classList.remove("page-in");
  document.body.classList.add("page-out");

  setTimeout(() => {
    window.location.href = href;
  }, 220);
});

// ===== Mobile nav =====
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

// ===== Netlify form async submit + "Anfrage gesendet" =====
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

  if (!statusEl || !submitBtn) return;

  statusEl.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sende…";

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Netlify needs POST to root path
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode(data),
    });

    if (!res.ok) throw new Error("Network response was not ok");

    form.reset();
    statusEl.textContent = "✅ Anfrage gesendet";
    statusEl.style.color = "rgba(34,197,94,.95)";
  } catch (err) {
    statusEl.textContent = "❌ Konnte nicht gesendet werden. Bitte später erneut versuchen.";
    statusEl.style.color = "rgba(239,68,68,.95)";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Anfrage senden";
  }
});

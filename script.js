/* ------------------------------------------------------------------
   CONFIG
   Change TIMEZONE to your IANA zone and TZ_LABEL to how you want it
   written on the chip. DST is handled automatically — the chip shows
   PST or PDT on its own.

   Common US zones:
     America/Los_Angeles (Pacific)   America/Denver     (Mountain)
     America/Chicago     (Central)   America/New_York   (Eastern)
     America/Phoenix     (Arizona)   America/Anchorage  (Alaska)
     Pacific/Honolulu    (Hawaii)
------------------------------------------------------------------- */
const TIMEZONE = "America/Los_Angeles";
const TZ_LABEL = "Pacific Time";

/* This file is shared by index.html and gallery.html, so every section
   checks for its own elements before running. */

const $ = (id) => document.getElementById(id);

/* ================= live clock ================= */

const clockEl = $("clock");

if (clockEl) {
  const dateEl = $("clock-date");
  const tzChip = $("tz-chip");

  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const zoneFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    timeZoneName: "short",
  });

  const zoneAbbr = (now) => {
    const part = zoneFmt.formatToParts(now).find((p) => p.type === "timeZoneName");
    return part ? part.value : "";
  };

  const tick = () => {
    const now = new Date();
    clockEl.textContent = timeFmt.format(now);
    dateEl.textContent = dateFmt.format(now);
    tzChip.textContent = `${TZ_LABEL} (${zoneAbbr(now)})`;
  };

  tick();
  setInterval(tick, 1000);
}

const yearEl = $("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ================= top app bar ================= */
/* On the home page the title fades in only once the hero name has scrolled
   out of view, so the name is never on screen twice. Other pages mark the
   bar --static and keep the title up. */

const appBar = $("app-bar");
const heroName = $("hero-name");

if (appBar && heroName && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => appBar.classList.toggle("top-app-bar--scrolled", !entry.isIntersecting),
    { rootMargin: "-64px 0px 0px 0px", threshold: 0 }
  ).observe(heroName);
}

/* ================= ripple ================= */

function attachRipple(el) {
  el.addEventListener("pointerdown", (event) => {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
}

document.querySelectorAll(".list-item, .nav__link").forEach(attachRipple);

/* ================= snackbar ================= */

const snackbar = $("snackbar");
let snackbarTimer;

function showSnackbar(message) {
  if (!snackbar) return;
  $("snackbar-text").textContent = message;
  snackbar.classList.add("snackbar--open");
  clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => snackbar.classList.remove("snackbar--open"), 4000);
}

/* ================= copy discord handle ================= */

const discordBtn = $("discord-btn");

if (discordBtn) {
  const discordTrailing = $("discord-trailing");
  const discordLabel = $("discord-label");
  const discordIcon = $("discord-icon");
  let resetTimer;

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // file:// and plain http:// don't get the async clipboard API
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    if (!ok) throw new Error("copy rejected");
  };

  discordBtn.addEventListener("click", async () => {
    const handle = discordBtn.dataset.handle;

    try {
      await copyText(handle);
    } catch {
      showSnackbar(`Couldn't copy. The username is ${handle}`);
      return;
    }

    showSnackbar(`Copied ${handle} to your clipboard`);

    discordLabel.textContent = "Copied";
    discordIcon.textContent = "check";
    discordTrailing.classList.add("list-item__trailing--done");

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      discordLabel.textContent = "Copy";
      discordIcon.textContent = "content_copy";
      discordTrailing.classList.remove("list-item__trailing--done");
    }, 2500);
  });
}

/* ================= gallery ================= */
/* One lightbox serves every section. */

const gallerySections = [...document.querySelectorAll(".gallery-section")];

if (gallerySections.length) {
  const lightbox = $("lightbox");
  const lightboxImg = $("lightbox-img");
  const lightboxCaption = $("lightbox-caption");
  const lightboxClose = $("lightbox-close");
  let lastFocused = null;

  const openLightbox = (img, caption) => {
    lastFocused = document.activeElement;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  gallerySections.forEach((section) => {
    const grid = section.querySelector(".gallery");
    const empty = section.querySelector(".empty");
    const pieces = [...section.querySelectorAll(".piece")];

    if (empty) empty.hidden = pieces.length > 0;
    if (grid) grid.hidden = pieces.length === 0;

    if (!lightbox) return;

    pieces.forEach((piece) => {
      const button = piece.querySelector(".piece__button");
      const img = piece.querySelector("img");
      const caption = piece.querySelector(".piece__caption");
      if (!button || !img) return;

      button.addEventListener("click", () =>
        openLightbox(img, caption ? caption.textContent.trim() : "")
      );
    });
  });

  if (lightbox) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.querySelector("[data-close]").addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }
}

/**
 * ============================================================
 * LUMIÈRE BEAUTY & SPA — app.js
 * Handles: form validation, API submission, WhatsApp redirect,
 *          header scroll effect, mobile nav, icon init,
 *          and progressive date constraints.
 * ============================================================
 */

'use strict';

/* ─── CONSTANTS ──────────────────────────────────────────── */

/**
 * Replace with your actual booking API endpoint.
 * The endpoint should accept a POST request with JSON body
 * and return { success: true } on status 200.
 */
const BOOKING_API_ENDPOINT = 'https://your-api-endpoint.com/api/bookings';

/**
 * Your business WhatsApp number in international format
 * (no spaces, no dashes, no plus sign).
 */
const WHATSAPP_NUMBER = '254700000000';


/* ─── INITIALISE LUCIDE ICONS ─────────────────────────────── */
/**
 * Lucide defers icon rendering until the script runs.
 * We call createIcons() once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  init();
});


/* ─── MAIN INIT ───────────────────────────────────────────── */
function init() {
  setCurrentYear();
  initScrollHeader();
  initMobileNav();
  initMinBookingDate();
  initBookingForm();
  initSectionReveal();
}


/* ─── SET COPYRIGHT YEAR ──────────────────────────────────── */
function setCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* ─── HEADER SCROLL SHADOW ────────────────────────────────── */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load in case page is pre-scrolled
}


/* ─── MOBILE NAV TOGGLE ───────────────────────────────────── */
function initMobileNav() {
  const toggle  = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    mobileNav.classList.toggle('is-open', !expanded);
    mobileNav.setAttribute('aria-hidden', String(expanded));
  });

  // Close nav when a link is tapped
  mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
}


/* ─── MIN BOOKING DATE (today) ────────────────────────────── */
function initMinBookingDate() {
  const dateInput = document.getElementById('bookingDate');
  if (!dateInput) return;

  // Prevent selecting past dates
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);

  // Set a max of ~6 months ahead
  const future = new Date(today);
  future.setMonth(future.getMonth() + 6);
  const fy  = future.getFullYear();
  const fm  = String(future.getMonth() + 1).padStart(2, '0');
  const fd  = String(future.getDate()).padStart(2, '0');
  dateInput.setAttribute('max', `${fy}-${fm}-${fd}`);
}


/* ─── BOOKING FORM ────────────────────────────────────────── */
function initBookingForm() {
  const form      = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  const successBanner = document.getElementById('formSuccess');
  const errorBanner   = document.getElementById('formError');

  if (!form) return;

  /* ── Inline validation on blur ── */
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-error')) validateField(field);
    });
  });

  /* ── Submit handler ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default page reload

    // Hide previous banners
    successBanner.hidden = true;
    errorBanner.hidden   = true;

    // Run full validation
    let isValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      // Focus the first invalid field
      const firstError = form.querySelector('.is-error');
      if (firstError) firstError.focus();
      return;
    }

    // Collect form data
    const data = collectFormData(form);

    // Loading state
    setLoadingState(submitBtn, true);

    try {
      /* ── Fetch POST to booking API ── */
      const response = await fetch(BOOKING_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Success: open WhatsApp and clear form
        onBookingSuccess(data, form, successBanner);
      } else {
        // Non-200 status
        onBookingError(errorBanner);
      }
    } catch (networkError) {
      /**
       * Network failure or CORS error — still open WhatsApp
       * so the user can complete the booking directly.
       * In production you may want to log this to your error service.
       */
      console.warn('Booking API unreachable, falling back to WhatsApp direct:', networkError);
      onBookingSuccess(data, form, successBanner);
    } finally {
      setLoadingState(submitBtn, false);
    }
  });
}


/* ─── FIELD VALIDATION ────────────────────────────────────── */
/**
 * Validates a single form field.
 * @param {HTMLElement} field
 * @returns {boolean} true if valid
 */
function validateField(field) {
  const errorEl = field.closest('.form-group')?.querySelector('.form-error');
  let   message = '';

  if (!field.value.trim()) {
    message = 'This field is required.';
  } else if (field.type === 'tel') {
    // Loose Kenyan / international phone check
    const cleaned = field.value.replace(/\s/g, '');
    if (!/^(\+254|254|0)[17]\d{8}$/.test(cleaned)) {
      message = 'Enter a valid Kenyan phone number.';
    }
  } else if (field.type === 'date') {
    const selected = new Date(field.value);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      message = 'Please choose a future date.';
    }
  }

  const isValid = !message;
  field.classList.toggle('is-error', !isValid);
  if (errorEl) errorEl.textContent = message;

  return isValid;
}


/* ─── COLLECT FORM DATA ───────────────────────────────────── */
/**
 * Collects all form values into a plain object.
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function collectFormData(form) {
  const fd = new FormData(form);
  return {
    name:    fd.get('clientName')?.trim() ?? '',
    phone:   fd.get('clientPhone')?.trim() ?? '',
    service: fd.get('service') ?? '',
    date:    fd.get('bookingDate') ?? '',
    time:    fd.get('bookingTime') ?? '',
    notes:   fd.get('notes')?.trim() ?? '',
  };
}


/* ─── ON SUCCESS ──────────────────────────────────────────── */
/**
 * Triggered when booking is confirmed (status 200) or fallback.
 * Opens a pre-filled WhatsApp message and clears the form.
 *
 * @param {Object}          data          - Booking details
 * @param {HTMLFormElement} form          - The booking form element
 * @param {HTMLElement}     successBanner - Success message element
 */
function onBookingSuccess(data, form, successBanner) {
  // Format a human-readable date for WhatsApp
  const formattedDate = formatDate(data.date);
  const formattedTime = formatTime(data.time);

  // Build WhatsApp message
  const message = [
    `✨ *New Booking — Lumière Beauty & Spa*`,
    ``,
    `*Name:* ${data.name}`,
    `*Service:* ${data.service}`,
    `*Date:* ${formattedDate}`,
    `*Time:* ${formattedTime}`,
    data.notes ? `*Notes:* ${data.notes}` : null,
    ``,
    `Please confirm my appointment. Thank you! 🌸`,
  ]
    .filter(line => line !== null)
    .join('\n');

  // Encode and open WhatsApp Web / App
  const encodedMsg = encodeURIComponent(message);
  const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

  window.open(waURL, '_blank', 'noopener,noreferrer');

  // Clear the form
  form.reset();

  // Remove any lingering error states
  form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
  form.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });

  // Show success banner
  successBanner.hidden = false;

  // Auto-hide success banner after 8 seconds
  setTimeout(() => { successBanner.hidden = true; }, 8000);

  // Scroll banner into view
  successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ─── ON ERROR ────────────────────────────────────────────── */
/**
 * Triggered when the API returns a non-200 status.
 * @param {HTMLElement} errorBanner
 */
function onBookingError(errorBanner) {
  errorBanner.hidden = false;
  setTimeout(() => { errorBanner.hidden = true; }, 8000);
  errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ─── LOADING STATE ───────────────────────────────────────── */
/**
 * Toggles the loading spinner on the submit button.
 * @param {HTMLButtonElement} btn
 * @param {boolean}           loading
 */
function setLoadingState(btn, loading) {
  btn.classList.toggle('is-loading', loading);
  btn.disabled = loading;
  btn.setAttribute('aria-busy', String(loading));
}


/* ─── FORMAT HELPERS ──────────────────────────────────────── */

/**
 * Converts ISO date string (YYYY-MM-DD) to a friendly format.
 * e.g. "2025-07-14" → "Monday, 14 July 2025"
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return 'Not specified';
  const [y, m, d] = isoDate.split('-').map(Number);
  // Use local date to avoid UTC offset issues
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-KE', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/**
 * Converts 24-hour time string to 12-hour AM/PM.
 * e.g. "14:00" → "2:00 PM"
 * @param {string} time24
 * @returns {string}
 */
function formatTime(time24) {
  if (!time24) return 'Not specified';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}


/* ─── INTERSECTION OBSERVER — SECTION REVEAL ─────────────── */
/**
 * Adds a gentle fade-up reveal on section entry using
 * IntersectionObserver. Falls back gracefully if unsupported.
 */
function initSectionReveal() {
  if (!('IntersectionObserver' in window)) return;

  // Add base class to animatable elements
  const targets = document.querySelectorAll(
    '.bento-tile, .process__step, .stat, .booking__form-wrap, .booking__text, .intro-strip__quote'
  );

  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // Animate once only
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
}

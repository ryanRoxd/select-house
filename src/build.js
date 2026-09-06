/* Generează paginile .html din rădăcină folosind conținutul din src/data.js.
   Rulează cu:  npm run build
   Paginile rezultate sunt fișiere statice obișnuite — nu au nevoie de Node
   pentru a fi servite. Vercel le publică așa cum sunt. */

const fs = require("fs");
const path = require("path");
const D = require("./data");

const ROOT = path.join(__dirname, "..");
const SITE_URL = "https://select-house-sibiu.vercel.app";

const MAP_HOME = "https://www.openstreetmap.org/export/embed.html?bbox=24.1440%2C45.7885%2C24.1650%2C45.7985&layer=mapnik&marker=45.79320%2C24.15450";
const MAP_PAGE = "https://www.openstreetmap.org/export/embed.html?bbox=24.1400%2C45.7860%2C24.1700%2C45.8010&layer=mapnik&marker=45.79320%2C24.15450";

/* ------------------------------------------------------------------ */
/* Ajutoare                                                            */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const attr = esc;

const monogram = (w, h, stroke, width) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 52 62" fill="none" aria-hidden="true">`
  + `<path d="M2 60V26C2 12.7 12.7 2 26 2s24 10.7 24 24v34" stroke="${stroke}" stroke-width="${width || 2.6}"/></svg>`;

const ICON_PHONE = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h3l2 5-2.4 1.4a11 11 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const ICON_CAL = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" stroke="#261B17" stroke-width="1.3"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="#261B17" stroke-width="1.3"/></svg>';
const ICON_GUEST = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.6" stroke="#261B17" stroke-width="1.3"/><path d="M4.5 20.5c0-4 3.4-6 7.5-6s7.5 2 7.5 6" stroke="#261B17" stroke-width="1.3"/></svg>';
const ICON_BED = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 18V9.5h13.5A4.5 4.5 0 0 1 21 14v4M3 13h18M6.5 9.5V7h6v2.5" stroke="#261B17" stroke-width="1.3"/></svg>';

/* ------------------------------------------------------------------ */
/* Cap de pagină                                                       */
/* ------------------------------------------------------------------ */

function head({ title, description, page, image }) {
  const canonical = SITE_URL + "/" + (page === "index" ? "" : page + ".html");
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${attr(canonical)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Select House Sibiu">
<meta property="og:locale" content="ro_RO">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(SITE_URL + "/" + (image || "assets/p01-camera-deluxe.jpg"))}">
<meta name="twitter:card" content="summary_large_image">

<meta name="theme-color" content="#571F2B">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 62"><rect width="52" height="62" fill="#261B17"/><path d="M8 56V28c0-9.9 8.1-18 18-18s18 8.1 18 18v28" stroke="#B59660" stroke-width="4" fill="none"/></svg>'
  )}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
<script>
/* Pornește sistemul de mișcare doar dacă browserul îl poate duce. Fără JS,
   fără IntersectionObserver sau cu mișcare redusă, pagina rămâne vizibilă. */
(function () {
  var w = window;
  if (!("IntersectionObserver" in w)) return;
  if (w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.className += " js-motion";
})();
</script>
</head>
<body>
<a class="skip-link" href="#continut">Sari la conținut</a>`;
}

const preloader = `
<div class="preloader" aria-hidden="true">
  <div class="preloader__inner">
    <svg width="58" height="68" viewBox="0 0 52 62" fill="none"><path d="M2 60V26C2 12.7 12.7 2 26 2s24 10.7 24 24v34" stroke="#B59660" stroke-width="1.6"/></svg>
    <span class="preloader__word"><span>SELECT HOUSE</span></span>
    <span class="preloader__rule"><span></span></span>
  </div>
</div>`;

/* ------------------------------------------------------------------ */
/* Antet, meniu, subsol                                                */
/* ------------------------------------------------------------------ */

function header(current, opts) {
  // Doar pagina principală are hero, deci doar acolo antetul pornește
  // transparent. Pe restul paginilor ar sta text crem pe fundal ivory.
  const ghost = !!(opts && opts.ghost);

  const links = D.nav.map((n) => {
    const active = n.id === current ? ' aria-current="page"' : "";
    return `<a href="${attr(n.href)}"${active}>${esc(n.label)}</a>`;
  }).join("\n      ");

  const menuLinks = D.nav.map((n, i) => {
    const active = n.id === current ? ' aria-current="page"' : "";
    return `<a href="${attr(n.href)}"${active}>${esc(n.label)}<span>0${i + 1}</span></a>`;
  }).join("\n      ");

  return `
<header class="header${ghost ? " header--ghost" : ""}">
  <a class="header__brand" href="index.html" aria-label="Select House Sibiu, acasă">
    ${monogram(26, 31, "currentColor")}
    <span class="header__word">SELECT HOUSE</span>
  </a>

  <nav class="header__nav" aria-label="Navigare principală">
      ${links}
  </nav>

  <div class="header__actions">
    <div class="lang" role="group" aria-label="Limbă">
      <b aria-current="true">RO</b><i>/</i>
      <button type="button" disabled title="Versiunea în engleză este în pregătire">EN</button>
    </div>
    <a class="btn btn--primary" href="contact.html#formular-rezervare" style="min-height:46px;font-size:12.5px">Verifică disponibilitatea</a>
  </div>

  <div class="header__mobile">
    <a class="header__icon" href="${D.site.phoneHref}" aria-label="Sună la ${attr(D.site.phone)}">${ICON_PHONE}</a>
    <button class="header__icon header__burger" type="button" aria-expanded="false"
            aria-controls="meniu-mobil" aria-label="Deschide meniul">
      <span><span></span><span></span><span></span></span>
    </button>
  </div>
</header>

<div class="menu" id="meniu-mobil" role="dialog" aria-modal="true" aria-label="Meniu" hidden>
  <div class="menu__top">
    <span class="menu__brand">${monogram(22, 26, "#B59660", 2.8)}<span>SELECT HOUSE</span></span>
    <button class="menu__close" type="button" aria-label="Închide meniul">×</button>
  </div>
  <nav aria-label="Navigare">
      ${menuLinks}
  </nav>
  <div class="menu__foot">
    <a class="btn btn--primary" href="contact.html#formular-rezervare">Verifică disponibilitatea</a>
    <a class="btn btn--ghost" href="${D.site.phoneHref}">${esc(D.site.phone)}</a>
    <div class="menu__lang"><b>RO</b><span>/</span><s>EN</s><em>engleza este în pregătire</em></div>
  </div>
</div>`;
}

function footer() {
  const links = D.navFooter.map((n) =>
    `<a href="${attr(n.href)}">${esc(n.label)}</a>`).join("\n          ");

  return `
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <div class="footer__brand">${monogram(24, 29, "#B59660", 2.4)}<span>SELECT HOUSE</span></div>
        <p class="footer__about">${esc(D.site.tagline)}</p>
        <div class="footer__cert">${esc(D.site.classification)}</div>
      </div>
      <div>
        <h2>Contact</h2>
        <div class="footer__col">
          <a href="${D.site.phoneHref}">${esc(D.site.phone)}</a>
          <a href="mailto:${D.site.email}">${esc(D.site.email)}</a>
          <span>${esc(D.site.street)}<br>${esc(D.site.city)} ${esc(D.site.postal)}, ${esc(D.site.country)}</span>
          <a href="${attr(D.site.facebook)}" target="_blank" rel="noopener">Facebook</a>
        </div>
        <a class="btn btn--primary footer__cta" href="contact.html#formular-rezervare">Verifică disponibilitatea</a>
      </div>
      <div>
        <h2>Navigare</h2>
        <div class="footer__col">
          ${links}
        </div>
      </div>
      <div>
        <h2>Informații</h2>
        <div class="footer__col">
          <a href="confidentialitate.html">Politica de confidențialitate</a>
          <a href="confidentialitate.html#cookies">Politica de cookies</a>
          <a href="confidentialitate.html#termeni">Termeni și condiții</a>
        </div>
        <div class="footer__hours">Check-in ${esc(D.site.checkIn)}<br>Check-out ${esc(D.site.checkOut)}</div>
      </div>
    </div>
    <div class="footer__bar">
      <span>© <span data-year>2025</span> Select House Sibiu. Toate drepturile rezervate.</span>
      <span>Camere pentru nefumători · Animalele de companie nu sunt acceptate</span>
      <button class="to-top" type="button" data-to-top>Înapoi sus</button>
    </div>
  </div>
</footer>`;
}

/* ------------------------------------------------------------------ */
/* Bara fixă de jos și panoul glisant (telefon)                        */
/* ------------------------------------------------------------------ */

function dock() {
  const guests = D.guestOptions.map((g) =>
    `<option${g === "2 oaspeți" ? " selected" : ""}>${esc(g)}</option>`).join("");
  const types = ["Orice cameră"].concat(D.rooms.map((r) => r.name))
    .map((n) => `<option>${esc(n)}</option>`).join("");

  return `
<div class="dock-spacer" aria-hidden="true"></div>
<div class="dock">
  <a class="dock__call" href="${D.site.phoneHref}" aria-label="Sună la ${attr(D.site.phone)}">${ICON_PHONE}</a>
  <button class="btn btn--primary dock__main" type="button" data-open-sheet>Verifică disponibilitatea</button>
</div>

<div class="sheet-backdrop" id="panou-disponibilitate" hidden>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-titlu">
    <div class="sheet__grip"><span></span></div>
    <div class="sheet__head">
      <div>
        <h2 id="sheet-titlu">Verifică disponibilitatea</h2>
        <p>Completează datele, iar gazda confirmă disponibilitatea.</p>
      </div>
      <button class="icon-btn" type="button" data-sheet-close aria-label="Închide">×</button>
    </div>
    <form id="formular-panou">
      <div class="sheet__body">
        <label class="field"><span>Sosire</span><input type="date" data-bq-in></label>
        <label class="field"><span>Plecare</span><input type="date" data-bq-out></label>
        <label class="field"><span>Oaspeți</span><select data-bq-guests>${guests}</select></label>
        <label class="field"><span>Tip cameră</span><select data-bq-type>${types}</select></label>
        <p class="form-alert" role="alert" data-bq-error hidden></p>
        <p class="form-fine" style="margin-top:0">Cererea nu reprezintă o rezervare confirmată. Gazda te contactează pentru disponibilitate și tarif.</p>
      </div>
      <div class="sheet__foot">
        <button class="btn btn--deep" type="submit">Caută o cameră</button>
        <a class="btn btn--quiet" href="${D.site.phoneHref}">Prefer să discut direct</a>
      </div>
    </form>
  </div>
</div>`;
}

/* ------------------------------------------------------------------ */
/* Straturi: fereastra camerei și lightbox                             */
/* ------------------------------------------------------------------ */

const roomModal = `
<div class="modal" id="room-modal" role="dialog" aria-modal="true" aria-labelledby="room-modal-name" hidden>
  <div class="modal__panel">
    <div class="modal__inner">
      <div class="modal__media">
        <div class="modal__stage" id="room-modal-stage">
          <img id="room-modal-img" src="" alt="">
          <div class="modal__pager">
            <button type="button" data-photo-prev aria-label="Fotografia anterioară">‹</button>
            <span id="room-modal-counter"></span>
            <button type="button" data-photo-next aria-label="Fotografia următoare">›</button>
          </div>
        </div>
        <div class="modal__thumbs" id="room-modal-thumbs"></div>
      </div>
      <div class="modal__body">
        <div class="modal__head">
          <div>
            <span class="eyebrow">Cameră</span>
            <h2 id="room-modal-name"></h2>
          </div>
          <button class="icon-btn" type="button" id="room-modal-close" data-room-close aria-label="Închide">×</button>
        </div>
        <dl class="specs">
          <div><dt>Suprafață</dt><dd id="room-modal-area"></dd></div>
          <div><dt>Capacitate</dt><dd id="room-modal-cap"></dd></div>
          <div><dt>Vedere</dt><dd id="room-modal-view"></dd></div>
          <div><dt>Paturi</dt><dd id="room-modal-beds"></dd></div>
        </dl>
        <div style="margin-top:20px">
          <div class="label-sm">În cameră</div>
          <div class="modal__amenities" id="room-modal-amenities"></div>
        </div>
        <div class="modal__foot">
          <button class="btn btn--deep" type="button" id="room-modal-request" data-request-room="">Solicită disponibilitatea</button>
          <a class="btn btn--quiet" href="${D.site.phoneHref}">Sună · ${esc(D.site.phone)}</a>
          <p>Tariful se comunică la cerere, în funcție de perioadă. Cererea nu reprezintă o rezervare confirmată.</p>
        </div>
      </div>
    </div>
  </div>
</div>`;

const lightbox = `
<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Galerie foto" hidden>
  <div class="lightbox__bar">
    <span id="lightbox-count"></span>
    <button class="round-btn round-btn--square" type="button" id="lightbox-close" data-lb-close aria-label="Închide galeria">×</button>
  </div>
  <div class="lightbox__stage">
    <button class="round-btn" type="button" data-lb-prev aria-label="Fotografia anterioară">‹</button>
    <div><img id="lightbox-img" src="" alt=""></div>
    <button class="round-btn" type="button" data-lb-next aria-label="Fotografia următoare">›</button>
  </div>
  <div class="lightbox__foot">
    <p id="lightbox-cap"></p>
    <div class="lightbox__mobile-nav">
      <button type="button" data-lb-prev aria-label="Fotografia anterioară">‹</button>
      <button type="button" data-lb-next aria-label="Fotografia următoare">›</button>
    </div>
  </div>
</div>`;

/* ------------------------------------------------------------------ */
/* Scripturi și date structurate                                       */
/* ------------------------------------------------------------------ */

function scripts({ withRooms, lightboxGroups, withForm }) {
  let out = "";
  if (withRooms) {
    const map = {};
    D.rooms.forEach((r) => {
      map[r.id] = {
        id: r.id, name: r.name, area: r.area, cap: r.cap, view: r.view,
        beds: r.beds, img: r.img, alt: r.alt, gal: r.gal, am: r.am
      };
    });
    out += `\n<script>window.SH_ROOMS=${JSON.stringify(map)};</script>`;
  }
  if (lightboxGroups && Object.keys(lightboxGroups).length) {
    out += `\n<script>window.SH_LIGHTBOX=${JSON.stringify(lightboxGroups)};</script>`;
  }
  out += `\n<script src="js/site.js" defer></script>`;
  if (withForm) out += `\n<script src="js/form.js" defer></script>`;
  return out;
}

function schema() {
  return `
<script type="application/ld+json">
${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BedAndBreakfast",
    name: "Select House Sibiu",
    description: D.site.tagline,
    url: SITE_URL,
    telephone: D.site.phone,
    email: D.site.email,
    image: D.gallery.slice(0, 5).map((g) => SITE_URL + "/" + g.src),
    priceRange: "$$",
    starRating: { "@type": "Rating", ratingValue: "3" },
    address: {
      "@type": "PostalAddress",
      streetAddress: D.site.street,
      addressLocality: D.site.city,
      postalCode: D.site.postal,
      addressCountry: "RO"
    },
    geo: { "@type": "GeoCoordinates", latitude: D.site.lat, longitude: D.site.lon },
    checkinTime: "16:00",
    checkoutTime: "11:00",
    numberOfRooms: D.rooms.length,
    petsAllowed: false,
    smokingAllowed: false,
    amenityFeature: D.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification", name: a, value: true
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "9.7", bestRating: "10", reviewCount: D.site.reviewCount
    },
    sameAs: [D.site.facebook, D.site.booking]
  })}
</script>`;
}

function faqSchema() {
  return `
<script type="application/ld+json">
${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: D.faqs.map((f) => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  })}
</script>`;
}

/* ------------------------------------------------------------------ */
/* Blocuri reutilizabile                                               */
/* ------------------------------------------------------------------ */

function roomCard(room, full) {
  const tags = room.tags.map((t) => `<span>${esc(t)}</span>`).join("");
  const H = full ? "h2" : "h3";
  return `
        <article class="room">
          <button class="room__media" type="button" data-open-room="${attr(room.id)}"
                  aria-label="Vezi detaliile pentru ${attr(room.name)}">
            <img src="${attr(room.img)}" alt="${attr(room.alt)}" loading="lazy" decoding="async" width="800" height="600">
            <span aria-hidden="true">VEZI DETALIILE</span>
          </button>
          <div class="room__body">
            <div class="room__top">
              <${H}>${esc(room.name)}</${H}>
              <span class="room__area">${esc(room.area)}</span>
            </div>
            <p class="room__meta">${esc(room.cap)} · ${esc(room.view)}</p>
            ${full ? `<p class="room__beds">${esc(room.beds)}</p>` : ""}
            <div class="tags">${tags}</div>
            ${full ? "" : '<span class="room__underline" aria-hidden="true"></span>'}
            <div class="room__actions">
              <button class="btn btn--dark" type="button" data-open-room="${attr(room.id)}">Vezi camera</button>
              <button class="btn btn--outline" type="button" data-request-room="${attr(room.id)}">Solicită</button>
            </div>
          </div>
        </article>`;
}

function faqBlock() {
  return D.faqs.map((f, i) => `
          <div class="faq">
            <button class="faq__q" type="button" id="faq-btn-${i}" aria-expanded="false" aria-controls="faq-panel-${i}">
              <span>${esc(f.q)}</span>
              <span class="faq__sign" aria-hidden="true"></span>
            </button>
            <div class="faq__a" id="faq-panel-${i}" role="region" aria-labelledby="faq-btn-${i}" hidden>
              <p>${esc(f.a)}</p>
            </div>
          </div>`).join("");
}

function bookingForm({ dark }) {
  const roomOptions = ["Fără preferință"].concat(D.rooms.map((r) => r.name))
    .map((n) => `<option>${esc(n)}</option>`).join("");
  const persOptions = D.personOptions.map((n) => `<option${n === "2" ? " selected" : ""}>${esc(n)}</option>`).join("");

  return `
      <div class="form-panel${dark ? " form-panel--dark" : ""}">
        <div class="form-success" hidden>
          <div class="form-success__mark"><span></span></div>
          <h2>Cererea a fost trimisă</h2>
          <p>Mulțumim, <span data-success-name></span>. Gazda revine cu un răspuns în cel mai scurt timp, de obicei în aceeași zi.</p>
          <dl class="form-summary">
            <dt>Datele trimise</dt>
            <dd data-success-summary></dd>
          </dl>
          <p class="fine">Cererea nu reprezintă o rezervare confirmată. Gazda te va contacta pentru confirmarea disponibilității și a tarifului.</p>
          <p class="fine" data-demo-note hidden><strong>Notă pentru prezentare:</strong> site-ul nu are încă o cheie de trimitere configurată, deci această cerere nu a plecat pe email. Pentru o rezervare reală, sună la <a href="${D.site.phoneHref}">${esc(D.site.phone)}</a>.</p>
          <button class="btn btn--quiet" type="button" data-form-reset>Trimite o altă cerere</button>
        </div>

        <form id="formular-rezervare" novalidate>
          <div class="form-body">
            <h2>Cerere de rezervare</h2>
            <div class="form-grid">
              <label class="field field--wide">
                <span>Nume și prenume *</span>
                <input id="f-nume" name="nume" type="text" autocomplete="name" placeholder="Numele tău" required>
                <span class="field__err" id="err-nume" hidden>Te rugăm să completezi numele.</span>
              </label>
              <label class="field">
                <span>Telefon *</span>
                <input id="f-tel" name="telefon" type="tel" autocomplete="tel" placeholder="07xx xxx xxx" required>
                <span class="field__err" id="err-tel" hidden>Adaugă un număr de telefon valid.</span>
              </label>
              <label class="field">
                <span>Email *</span>
                <input id="f-email" name="email" type="email" autocomplete="email" placeholder="nume@email.com" required>
                <span class="field__err" id="err-email" hidden>Adresa de email nu pare corectă.</span>
              </label>
              <label class="field">
                <span>Sosire</span>
                <input id="f-in" name="sosire" type="date">
              </label>
              <label class="field">
                <span>Plecare</span>
                <input id="f-out" name="plecare" type="date">
                <span class="field__err" id="err-out" hidden>Adaugă și data de plecare.</span>
              </label>
              <label class="field">
                <span>Persoane</span>
                <select id="f-pers" name="persoane">${persOptions}</select>
              </label>
              <label class="field">
                <span>Cameră preferată</span>
                <select id="f-room" name="camera">${roomOptions}</select>
              </label>
              <label class="field field--wide">
                <span>Mesaj</span>
                <textarea id="f-msg" name="mesaj" rows="3" placeholder="Ora estimată de sosire, întrebări despre parcare, alte solicitări."></textarea>
              </label>
            </div>

            <label class="field" style="position:absolute;left:-9999px" aria-hidden="true" tabindex="-1">
              <span>Nu completa acest câmp</span>
              <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
            </label>

            <label class="consent">
              <input id="f-gdpr" type="checkbox" required>
              <span>Sunt de acord cu prelucrarea datelor mele pentru a primi un răspuns la această cerere.
                <a href="confidentialitate.html">Politica de confidențialitate</a></span>
            </label>
            <span class="field__err" id="err-gdpr" style="display:block;margin-top:8px" hidden>Este necesar acordul pentru a trimite cererea.</span>

            <button class="btn btn--deep btn--block" type="submit" style="margin-top:22px;min-height:52px">Trimite cererea</button>
            <p class="form-fine">Cererea nu reprezintă o rezervare confirmată. Gazda te va contacta pentru confirmarea disponibilității și a tarifului.</p>
          </div>

          <div class="form-error" hidden>
            Cererea nu a putut fi trimisă. Verifică legătura la internet și încearcă din nou,
            sau sună direct la <a href="${D.site.phoneHref}">${esc(D.site.phone)}</a>.
          </div>
        </form>
      </div>`;
}

function bookingSection() {
  return `
  <section class="booking" id="rezervare">
    <div class="wrap booking__grid">
      <div>
        <span class="eyebrow" data-rv="text">Rezervare directă</span>
        <h2 class="h-major" data-rv="title">Pregătit pentru câteva zile în Sibiu?</h2>
        <p class="booking__lede" data-rv="text">Scrie-ne datele și camera preferată. Îți răspundem cu disponibilitatea și tariful exact.</p>
        <dl class="contact-list">
          <div><dt>Telefon</dt><dd class="big"><a href="${D.site.phoneHref}">${esc(D.site.phone)}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${D.site.email}">${esc(D.site.email)}</a></dd></div>
          <div><dt>Adresă</dt><dd>${esc(D.site.street)}, ${esc(D.site.city)} ${esc(D.site.postal)}</dd></div>
          <div><dt>Program</dt><dd>Check-in ${esc(D.site.checkIn)} · Check-out ${esc(D.site.checkOut)}</dd></div>
        </dl>
      </div>
      ${bookingForm({ dark: false })}
    </div>
  </section>`;
}

function mapBlock({ src, title, className }) {
  return `<div class="${className}" data-lazymap="${attr(src)}" data-map-title="${attr(title)}">
        <div class="map-pending">SE ÎNCARCĂ HARTA</div>
      </div>`;
}

const mapButtons = `
    <div class="btn-row">
      <a class="btn btn--dark" href="${attr(D.site.maps)}" target="_blank" rel="noopener">Deschide în Google Maps</a>
      <a class="btn btn--quiet" href="${D.site.phoneHref}">Sună pentru indicații</a>
    </div>`;

/* ------------------------------------------------------------------ */
/* Pagina principală                                                   */
/* ------------------------------------------------------------------ */

function pageHome() {
  const guests = D.guestOptions.map((g) =>
    `<option${g === "2 oaspeți" ? " selected" : ""}>${esc(g)}</option>`).join("");
  const types = ["Orice cameră"].concat(D.rooms.map((r) => r.name))
    .map((n) => `<option>${esc(n)}</option>`).join("");

  const landmarkRows = D.landmarks.map((l) => `
          <div class="rowlist__item"><span>${esc(l.name)}</span><span>${esc(l.dist)}</span></div>`).join("");

  const groups = D.amenityGroups.map((g) => `
            <div data-rv="stagger">
              <div class="amenity-group__head">
                <span aria-hidden="true"><span class="amenity-group__mark amenity-group__mark--${g.shape}"></span></span>
                <span>${esc(g.title)}</span>
              </div>
              ${g.items.map((a) => `<div class="amenity-group__item"><span>${esc(a)}</span></div>`).join("\n              ")}
            </div>`).join("");

  const mosaic = D.galleryHome.map((g, i) => {
    const item = D.gallery[g.i];
    return `
        <button class="shot" type="button" data-lb-group="home" data-lb-index="${i}"
                style="grid-column:${g.xl[0]};grid-row:${g.xl[1]}"
                aria-label="Deschide fotografia: ${attr(item.cap)}">
          <img src="${attr(item.src)}" alt="${attr(item.alt)}" loading="lazy" decoding="async" width="800" height="600">
          <span class="shot__label" aria-hidden="true">${esc(item.short)}</span>
        </button>`;
  }).join("");

  const quotes = D.reviews.map((r) => `
            <blockquote><p>${esc(r.q)}</p><cite>${esc(r.k)}</cite></blockquote>`).join("");
  const dots = D.reviews.map((r, i) =>
    `<span${i === 0 ? ' class="is-on"' : ""}></span>`).join("");

  const guideCards = D.guide.map((g) => `
        <article>
          <div class="guide__n"><b>${esc(g.n)}</b><i aria-hidden="true"></i></div>
          <h3>${esc(g.name)}</h3>
          <p>${esc(g.text)}</p>
          <div class="guide__dist">${esc(g.dist)}</div>
        </article>`).join("");

  const lbHome = D.galleryHome.map((g) => D.gallery[g.i]);

  return head({
    page: "index",
    title: "Select House Sibiu — pensiune de 3 stele în centrul istoric",
    description: "Pensiune de 3 stele cu 8 camere pe Strada Nouă, la 7–10 minute pe jos de Piața Mare. Curte interioară, parcare gratuită, rezervare directă."
  })
    + preloader
    + header("acasa", { ghost: true })
    + `
<main id="continut">
  <section class="hero">
    <div class="hero__layer" data-parallax="10">
      <img class="hero__img" src="assets/p01-camera-deluxe.jpg" fetchpriority="high" decoding="async"
           alt="Cameră Deluxe cu candelabru, mobilier din lemn închis și textile vișinii">
    </div>
    <div class="hero__scrim" aria-hidden="true"></div>
    <div class="hero__inner">
      <span class="eyebrow hero__eyebrow">Pensiune de 3 stele · Centrul istoric Sibiu</span>
      <h1 class="h-hero">
        <span><span>Sibiul vechi, aproape.</span></span>
        <span><span>Liniștea, chiar aici.</span></span>
      </h1>
      <p class="hero__lede">Camere primitoare, o curte liniștită și centrul istoric la câteva minute de mers pe jos.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#rezervare">Verifică disponibilitatea</a>
        <a class="btn btn--ghost" href="camere.html">Vezi camerele</a>
        <a class="hero__textlink" href="camere.html">Vezi camerele</a>
      </div>
      <div class="hero__stats">
        <div>
          <div class="hero__stat-n" data-count-to="9.7">9,7</div>
          <div class="hero__stat-l"><span class="long">Booking.com · peste ${D.site.reviewCount} de recenzii</span><span class="short">Booking.com</span></div>
        </div>
        <div class="hero__rule" aria-hidden="true"></div>
        <div>
          <div class="hero__stat-n">8</div>
          <div class="hero__stat-l"><span class="long">Camere, atenție directă</span><span class="short">Camere</span></div>
        </div>
        <div class="hero__rule" aria-hidden="true"></div>
        <div>
          <div class="hero__stat-n hero__stat-n--sm">7–10 min</div>
          <div class="hero__stat-l"><span class="long">Pe jos până în Piața Mare</span><span class="short">Piața Mare</span></div>
        </div>
      </div>
    </div>
    <div class="scroll-hint" aria-hidden="true"><span>DERULEAZĂ<i></i></span></div>
  </section>

  <section class="availability" aria-label="Verificare disponibilitate">
    <form class="availability__box" id="bara-disponibilitate">
      <label class="field-line">
        <span>Sosire</span>
        <span class="field-line__control">${ICON_CAL}<input type="date" data-bq-in></span>
      </label>
      <label class="field-line">
        <span>Plecare</span>
        <span class="field-line__control">${ICON_CAL}<input type="date" data-bq-out></span>
      </label>
      <label class="field-line">
        <span>Oaspeți</span>
        <span class="field-line__control">${ICON_GUEST}<select data-bq-guests>${guests}</select></span>
      </label>
      <label class="field-line">
        <span>Tip cameră</span>
        <span class="field-line__control">${ICON_BED}<select data-bq-type>${types}</select></span>
      </label>
      <button class="btn btn--deep" type="submit">Caută o cameră</button>
      <p class="form-alert" role="alert" data-bq-error style="grid-column:1/-1" hidden></p>
    </form>
    <div class="availability__meta">
      <p>Formularul trimite o cerere către gazdă. Disponibilitatea se confirmă telefonic sau prin email.</p>
      <a href="${D.site.phoneHref}">Prefer să discut direct · ${esc(D.site.phone)}</a>
    </div>
  </section>

  <section class="wrap section split">
    <div class="figure-card">
      <div class="figure-card__frame" data-rv="img">
        <img src="assets/p02-curte.jpg" loading="lazy" decoding="async" data-parallax="8" width="900" height="700"
             alt="Curtea interioară pavată, cu ziduri de piatră, plante și mobilier exterior">
      </div>
      <div class="figure-card__tag">
        <h3>Curtea interioară</h3>
        <p>Terasă la soare, mobilier exterior și liniște, la doi pași de forfota centrului.</p>
      </div>
    </div>
    <div>
      <span class="eyebrow" data-rv="text">Poziționare</span>
      <h2 class="h-major" data-rv="title" style="margin-top:18px;max-width:20ch">Aproape de centrul vechi. Departe de agitație.</h2>
      <span class="rule-gold" data-rv="line" aria-hidden="true"></span>
      <p class="lede" data-rv="text" style="margin-top:22px;max-width:48ch">Select House se află pe Strada Nouă, într-o zonă liniștită, la aproximativ 7–10 minute de Piața Mare, Podul Minciunilor și Turnul Sfatului.</p>
      <div class="rowlist" data-rv="stagger">${landmarkRows}
      </div>
      <p class="note">Distanțele sunt orientative, măsurate pe traseu pietonal.</p>
    </div>
  </section>

  <section class="wrap section" id="camere" style="scroll-margin-top:90px">
    <div class="section-head section-head--ruled">
      <div>
        <span class="eyebrow" data-rv="text">Camere</span>
        <h2 class="h-sect" data-rv="title">Opt camere, fiecare cu personalitatea ei.</h2>
      </div>
      <a class="link-more" href="camere.html">Toate cele 8 camere</a>
    </div>
    <div class="rooms-grid" data-rv="stagger">${D.rooms.slice(0, 3).map((r) => roomCard(r, false)).join("")}
    </div>
  </section>

  <section class="band" id="facilitati" style="scroll-margin-top:80px">
    <div class="wrap">
      <div class="facilities">
        <div>
          <span class="eyebrow" data-rv="text">Facilități</span>
          <h2 class="h-sect" data-rv="title" style="margin-top:16px">Tot ce ai nevoie, fără lucruri de care nu ai nevoie.</h2>
          <div class="callout callout--light" data-rv="text" style="margin-top:24px">
            Bucătărie comună pentru cafea și preparate simple. Nu este disponibil aragaz sau plită.
          </div>
          <p data-rv="text" style="margin-top:18px;font-size:14px;line-height:1.65;color:var(--ink-62)">Nu există restaurant propriu și nu se servește mic dejun. Parcare gratuită disponibilă — confirmă detaliile la rezervare.</p>
        </div>
        <div class="amenity-groups">${groups}
        </div>
      </div>
    </div>
  </section>

  <section class="wrap section">
    <div class="section-head">
      <div>
        <span class="eyebrow" data-rv="text">Galerie</span>
        <h2 class="h-sect" data-rv="title">Casa, în detaliile ei.</h2>
      </div>
      <a class="link-more" href="galerie.html">Toată galeria</a>
    </div>
    <div class="mosaic" data-rv="stagger">${mosaic}
    </div>
  </section>

  <section class="band band--dark">
    <div class="wrap">
      <div class="reviews">
        <div>
          <span class="eyebrow" data-rv="text">Recenzii</span>
          <div class="reviews__score"><b data-count-to="9.7">9,7</b><span>din 10</span></div>
          <p data-rv="text" style="margin-top:18px;font-size:15px;line-height:1.7;color:var(--cream-74);max-width:34ch">Peste ${D.site.reviewCount} de oaspeți au evaluat locația cu 9,8 și curățenia cu 9,8 din 10.</p>
          <a class="badge" href="${attr(D.site.booking)}" target="_blank" rel="noopener">Recenzii verificate pe Booking.com</a>
        </div>
        <div>
          <div class="quotes">${quotes}
          </div>
          <div class="dots" aria-hidden="true">${dots}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="wrap section">
    <span class="eyebrow" data-rv="text">Experiența în Sibiu</span>
    <h2 class="h-major" data-rv="title" style="margin-top:16px;max-width:24ch">Sibiul începe la câteva minute de cameră.</h2>
    <div class="guide" data-rv="stagger">${guideCards}
    </div>
    <p class="swipe-hint">Derulează lateral pentru toate reperele</p>
  </section>

  <section class="wrap section">
    <div class="map-split">
      ${mapBlock({ src: MAP_HOME, title: "Harta locației Select House Sibiu, Strada Nouă 46", className: "map-frame" })}
      <div class="map-split__body">
        <span class="eyebrow" data-rv="text">Locație</span>
        <h2 class="h-sub" data-rv="title" style="margin-top:16px">Strada Nouă 46, Sibiu</h2>
        <p data-rv="text" style="margin-top:14px;font-size:15px;line-height:1.7;color:var(--ink-76)">Zonă rezidențială liniștită, la est de centrul istoric. Traseul pietonal spre Piața Mare durează aproximativ 7–10 minute.</p>
        <div class="rowlist" style="margin-top:24px">
          <div class="rowlist__item"><span>Gara Sibiu</span><span>aprox. 850 m</span></div>
          <div class="rowlist__item"><span>Aeroportul Internațional Sibiu</span><span>aprox. 4,6 km</span></div>
        </div>
        ${mapButtons}
      </div>
    </div>
  </section>

  <section class="wrap section">
    <div class="faq-split">
      <div class="faq-split__head">
        <span class="eyebrow" data-rv="text">Întrebări frecvente</span>
        <h2 class="h-sub" data-rv="title" style="margin-top:16px;font-size:clamp(26px,2.8vw,36px)">Ce e bine de știut înainte de sosire.</h2>
      </div>
      <div>${faqBlock()}
      </div>
    </div>
  </section>

${bookingSection()}
</main>`
    + footer() + dock() + roomModal + lightbox
    + schema() + faqSchema()
    + scripts({ withRooms: true, withForm: true, lightboxGroups: { home: lbHome } })
    + `\n</body>\n</html>\n`;
}

/* ------------------------------------------------------------------ */
/* Camere                                                              */
/* ------------------------------------------------------------------ */

function pageRooms() {
  return head({
    page: "camere",
    title: "Camere — Select House Sibiu",
    description: "Opt camere de la 17 la 41 m², toate cu baie proprie, aer condiționat și Wi-Fi gratuit. Unele cu șemineu decorativ, intrare separată sau bucătărie proprie.",
    image: "assets/p05-studio-king.jpg"
  })
    + header("camere")
    + `
<main id="continut" style="padding-top:var(--header-h)">
  <section class="wrap" style="padding-top:clamp(34px,6vw,78px)">
    <span class="eyebrow">Camere</span>
    <h1 class="h-page" style="margin-top:16px;max-width:22ch">Opt camere, de la 17 la 41 m².</h1>
    <p class="lede">Toate camerele au baie proprie, aer condiționat, frigider, TV și Wi-Fi gratuit. Unele au șemineu decorativ, intrare separată sau bucătărie proprie.</p>
    <div class="rooms-grid rooms-grid--full" data-rv="stagger">${D.rooms.map((r) => roomCard(r, true)).join("")}
    </div>
    <p class="note" style="margin-top:30px;font-size:13px">Tarifele se comunică la cerere, în funcție de perioadă și durata șederii. Pat suplimentar disponibil la cerere, cu confirmarea gazdei.</p>
  </section>

${bookingSection()}
</main>`
    + footer() + dock() + roomModal + lightbox
    + schema()
    + scripts({ withRooms: true, withForm: true, lightboxGroups: {} })
    + `\n</body>\n</html>\n`;
}

/* ------------------------------------------------------------------ */
/* Galerie                                                             */
/* ------------------------------------------------------------------ */

function pageGallery() {
  const VISIBLE = 12;
  const items = D.gallery.map((g, i) => `
        <button class="shot" type="button" data-lb-group="all" data-lb-index="${i}"
                aria-label="Deschide fotografia: ${attr(g.cap)}"${i >= VISIBLE ? " hidden" : ""}>
          <span class="shot__frame"><img src="${attr(g.src)}" alt="${attr(g.alt)}" loading="lazy" decoding="async" width="800" height="600"></span>
          <span class="shot__cap">${esc(g.cap)}</span>
        </button>`).join("");

  return head({
    page: "galerie",
    title: "Galerie foto — Select House Sibiu",
    description: "Fotografii reale ale camerelor, băilor, șemineelor, bucătăriei comune și curții interioare de la Select House Sibiu.",
    image: "assets/p02-curte.jpg"
  })
    + header("galerie")
    + `
<main id="continut" style="padding-top:var(--header-h)">
  <section class="wrap" style="padding-top:clamp(34px,6vw,78px)">
    <span class="eyebrow">Galerie</span>
    <h1 class="h-page" style="margin-top:16px;max-width:20ch">Fotografii reale, făcute în casă.</h1>
    <p class="lede" style="max-width:52ch">Camere, băi, șeminee, bucătăria comună și curtea interioară. Apasă pe orice fotografie pentru a o vedea pe tot ecranul.</p>
    <div class="gallery-grid" data-rv="stagger">${items}
    </div>
    <div class="gallery-more">
      <button class="btn btn--quiet" type="button" data-gallery-more>Vezi mai multe fotografii · ${D.gallery.length - VISIBLE}</button>
    </div>
  </section>
</main>`
    + footer() + dock() + lightbox
    + schema()
    + scripts({ withRooms: false, withForm: false, lightboxGroups: { all: D.gallery } })
    + `\n</body>\n</html>\n`;
}

/* ------------------------------------------------------------------ */
/* Locație                                                             */
/* ------------------------------------------------------------------ */

function pageLocation() {
  const walkRows = D.walk.map((w) => `
            <div style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--line)">
              <span style="font-family:var(--serif);font-size:16px;color:var(--gold-ink);width:22px;flex:none">${esc(w.n)}</span>
              <div style="min-width:0">
                <div style="font-size:15px;font-weight:500">${esc(w.name)}</div>
                <div style="margin-top:4px;font-size:13.5px;line-height:1.55;color:rgba(38,27,23,.64)">${esc(w.text)}</div>
              </div>
            </div>`).join("");

  const distRows = D.distances.map((d) => `
            <div class="rowlist__item"><span>${esc(d.name)}</span><span>${esc(d.dist)}</span></div>`).join("");

  return head({
    page: "locatie",
    title: "Locație — Strada Nouă 46, Sibiu | Select House",
    description: "Select House se află pe Strada Nouă 46, la 7–10 minute pe jos de Piața Mare, Podul Minciunilor și Turnul Sfatului. Parcare gratuită disponibilă.",
    image: "assets/p02-curte.jpg"
  })
    + header("locatie")
    + `
<main id="continut" style="padding-top:var(--header-h)">
  <section class="wrap" style="padding-top:clamp(34px,6vw,78px)">
    <span class="eyebrow">Locație</span>
    <h1 class="h-page" style="margin-top:16px;max-width:20ch">Strada Nouă 46, la marginea centrului vechi.</h1>

    ${mapBlock({ src: MAP_PAGE, title: "Harta locației Select House Sibiu", className: "map-tall" })}
    ${mapButtons}

    <div class="split split--top" style="margin-top:clamp(44px,7vw,70px)">
      <div>
        <h2 class="h-sub">Traseul pietonal spre Piața Mare</h2>
        <div data-rv="stagger" style="margin-top:22px;display:flex;flex-direction:column">${walkRows}
        </div>
        <p class="note">Distanțele și duratele sunt orientative.</p>
      </div>
      <div>
        <h2 class="h-sub">Distanțe utile</h2>
        <div class="rowlist" data-rv="stagger" style="margin-top:22px">${distRows}
        </div>
        <div class="callout" style="margin-top:26px">Parcare gratuită disponibilă. Confirmă detaliile și disponibilitatea la rezervare.</div>
      </div>
    </div>
  </section>

${bookingSection()}
</main>`
    + footer() + dock()
    + schema()
    + scripts({ withRooms: false, withForm: true, lightboxGroups: {} })
    + `\n</body>\n</html>\n`;
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

function pageContact() {
  const chips = D.payments.map((p) => `<span>${esc(p)}</span>`).join("");

  return head({
    page: "contact",
    title: "Contact și rezervare — Select House Sibiu",
    description: "Trimite o cerere de rezervare sau sună direct la +40 770 644 990. Check-in 16:00–00:00, check-out până la 11:00.",
    image: "assets/p06-semineu.jpg"
  })
    + header("contact")
    + `
<main id="continut" style="padding-top:var(--header-h)">
  <section class="wrap" style="padding-top:clamp(34px,6vw,78px)">
    <span class="eyebrow">Contact și rezervare</span>
    <h1 class="h-page" style="margin-top:16px;max-width:20ch">Scrie-ne sau sună direct.</h1>

    <div class="split split--top" style="margin-top:clamp(30px,5vw,50px)">
      <div class="contact-card">
        <h2>Date de contact</h2>
        <dl>
          <div><dt>Telefon</dt><dd class="big"><a href="${D.site.phoneHref}">${esc(D.site.phone)}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${D.site.email}">${esc(D.site.email)}</a></dd></div>
          <div><dt>Adresă</dt><dd>${esc(D.site.street)}, ${esc(D.site.city)} ${esc(D.site.postal)}</dd></div>
          <div><dt>Facebook</dt><dd style="font-size:16px"><a href="${attr(D.site.facebook)}" target="_blank" rel="noopener">Select House Sibiu</a></dd></div>
        </dl>
        <div class="facts">
          <div><span>Check-in</span><span>${esc(D.site.checkIn)}</span></div>
          <div><span>Check-out</span><span>${esc(D.site.checkOut)}</span></div>
          <div><span>Limbi vorbite</span><span>română, engleză</span></div>
          <div><span>Animale de companie</span><span>nu sunt acceptate</span></div>
        </div>
        <div style="margin-top:26px">
          <div class="label-sm">Modalități de plată</div>
          <div class="chips">${chips}</div>
        </div>
      </div>

${bookingForm({ dark: true })}
    </div>
  </section>
</main>`
    + footer() + dock()
    + schema()
    + scripts({ withRooms: true, withForm: true, lightboxGroups: {} })
    + `\n</body>\n</html>\n`;
}

/* ------------------------------------------------------------------ */
/* Confidențialitate                                                   */
/* ------------------------------------------------------------------ */

function pagePrivacy() {
  return head({
    page: "confidentialitate",
    title: "Politica de confidențialitate — Select House Sibiu",
    description: "Cum sunt folosite datele trimise prin formularul de cerere de rezervare de pe site-ul Select House Sibiu."
  })
    + header("")
    + `
<main id="continut" style="padding-top:var(--header-h)">
  <section class="wrap" style="padding-top:clamp(34px,6vw,78px)">
    <span class="eyebrow">Informații</span>
    <h1 class="h-page" style="margin-top:16px;max-width:22ch">Politica de confidențialitate</h1>

    <div class="prose">
      <p><strong>Notă:</strong> acest text este o variantă de pornire, redactată pentru structura site-ului.
      Înainte de publicarea finală, proprietarul trebuie să îl completeze cu datele firmei
      (denumire, CUI, sediu) și să îl verifice cu un consultant juridic.</p>

      <h2>Cine prelucrează datele</h2>
      <p>Datele sunt prelucrate de proprietarul pensiunii Select House, cu sediul în ${esc(D.site.street)},
      ${esc(D.site.city)} ${esc(D.site.postal)}, ${esc(D.site.country)}. Pentru orice întrebare legată de datele tale,
      scrie la <a href="mailto:${D.site.email}">${esc(D.site.email)}</a> sau sună la
      <a href="${D.site.phoneHref}">${esc(D.site.phone)}</a>.</p>

      <h2>Ce date colectăm</h2>
      <p>Prin formularul de cerere de rezervare colectăm doar datele pe care le completezi tu:</p>
      <ul>
        <li>nume și prenume;</li>
        <li>număr de telefon;</li>
        <li>adresă de email;</li>
        <li>datele de sosire și plecare, numărul de persoane și camera preferată;</li>
        <li>mesajul opțional scris de tine.</li>
      </ul>

      <h2 id="cookies">Cookie-uri</h2>
      <p>Site-ul nu folosește cookie-uri de urmărire, nu are conturi de utilizator și nu rulează
      instrumente de analiză a traficului. Singurele resurse încărcate de la alți furnizori sunt
      fonturile Google Fonts și harta OpenStreetMap, iar harta se încarcă doar când ajungi cu
      derularea în dreptul ei.</p>

      <h2>De ce folosim datele</h2>
      <p>Folosim aceste date exclusiv pentru a-ți răspunde la cerere: pentru a verifica disponibilitatea,
      pentru a-ți comunica tariful și pentru a confirma rezervarea. Temeiul prelucrării este consimțământul
      tău, exprimat prin bifarea căsuței din formular.</p>

      <h2>Cine le mai vede</h2>
      <p>Cererile ajung pe adresa de email a proprietății printr-un serviciu de trimitere a formularelor.
      Datele nu sunt vândute, închiriate sau transmise altor terți în scopuri de marketing.</p>

      <h2>Cât timp le păstrăm</h2>
      <p>Păstrăm mesajele primite atât cât este necesar pentru a răspunde cererii și pentru evidența
      rezervărilor. Poți cere oricând ștergerea lor.</p>

      <h2>Drepturile tale</h2>
      <p>Conform Regulamentului General privind Protecția Datelor (GDPR), ai dreptul de acces la datele tale,
      de rectificare, de ștergere, de restricționare a prelucrării, de portabilitate și de a-ți retrage
      consimțământul în orice moment. Poți face oricare dintre aceste cereri scriind la
      <a href="mailto:${D.site.email}">${esc(D.site.email)}</a>. Ai de asemenea dreptul de a depune o plângere
      la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
      (<a href="https://www.dataprotection.ro" target="_blank" rel="noopener">dataprotection.ro</a>).</p>

      <h2 id="termeni">Termeni și condiții</h2>
      <p>Formularul de pe acest site trimite o <strong>cerere de rezervare</strong>, nu o rezervare
      confirmată. Disponibilitatea și tariful se confirmă de către gazdă, telefonic sau prin email.
      Tarifele variază în funcție de perioadă și de durata șederii și se comunică la cerere.</p>
      <p>Check-in-ul se face între ${esc(D.site.checkIn)}, iar check-out-ul ${esc(D.site.checkOut)}.
      Camerele sunt pentru nefumători. Animalele de companie nu sunt acceptate. Paturile suplimentare
      și pătuțurile se solicită în avans și se confirmă de proprietate.</p>
      <p>Condițiile de anulare se stabilesc la confirmarea rezervării. Pentru rezervările făcute prin
      alte platforme se aplică condițiile platformei respective.</p>
    </div>
  </section>
</main>`
    + footer() + dock()
    + scripts({ withRooms: false, withForm: false, lightboxGroups: {} })
    + `\n</body>\n</html>\n`;
}

/* ------------------------------------------------------------------ */
/* Fișiere auxiliare                                                   */
/* ------------------------------------------------------------------ */

function sitemap() {
  const pages = ["", "camere.html", "galerie.html", "locatie.html", "contact.html", "confidentialitate.html"];
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url>
    <loc>${SITE_URL}/${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p === "" ? "1.0" : "0.7"}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

/* ------------------------------------------------------------------ */
/* Scriere                                                             */
/* ------------------------------------------------------------------ */

const outputs = {
  "index.html": pageHome(),
  "camere.html": pageRooms(),
  "galerie.html": pageGallery(),
  "locatie.html": pageLocation(),
  "contact.html": pageContact(),
  "confidentialitate.html": pagePrivacy(),
  "sitemap.xml": sitemap(),
  "robots.txt": robots
};

let written = 0;
for (const [name, content] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(ROOT, name), content, "utf8");
  const kb = (Buffer.byteLength(content, "utf8") / 1024).toFixed(1);
  console.log(`  ${name.padEnd(26)} ${kb.padStart(7)} KB`);
  written++;
}
console.log(`\n${written} fișiere generate.`);

/* Select House Sibiu — interacțiuni.
   Fără dependențe. Fiecare bloc verifică întâi dacă elementele există,
   pentru că același fișier este încărcat pe toate paginile. */

(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var reduceMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Antet: fundal solid după derulare
     ---------------------------------------------------------------------- */

  var header = $(".header");
  // Paginile fără hero au antetul opac tot timpul — nu au ce comuta.
  var headerAlwaysSolid = header && header.hasAttribute("data-header-solid");
  if (header && !headerAlwaysSolid) {
    var solid = false;
    var onScroll = function () {
      var next = window.scrollY > 90;
      if (next !== solid) {
        solid = next;
        header.classList.toggle("is-solid", solid);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Meniul mobil
     ---------------------------------------------------------------------- */

  var burger = $(".header__burger");
  var mobileNav = $("#meniu-mobil");
  if (burger && mobileNav) {
    var setNav = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
      document.body.classList.toggle("is-locked", open);
      if (open) header.classList.add("is-solid");
      else if (!headerAlwaysSolid && window.scrollY <= 90) header.classList.remove("is-solid");
    };
    burger.addEventListener("click", function () {
      setNav(burger.getAttribute("aria-expanded") !== "true");
    });
    $$("a", mobileNav).forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") setNav(false);
    });
  }

  /* ----------------------------------------------------------------------
     Dezvăluire la derulare
     ---------------------------------------------------------------------- */

  var revealables = $$(".reveal");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.06 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ----------------------------------------------------------------------
     Numărătoarea ratingului
     ---------------------------------------------------------------------- */

  var counters = $$("[data-count-to]");
  if (counters.length) {
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var show = function (v) { el.textContent = v.toFixed(1).replace(".", ","); };
      if (reduceMotion) { show(target); return; }

      var run = function () {
        var value = target - 1.5;
        var tick = setInterval(function () {
          value = Math.min(target, value + 0.11);
          show(value);
          if (value >= target) clearInterval(tick);
        }, 34);
      };

      if (!("IntersectionObserver" in window)) { run(); return; }
      var seen = false;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seen) return;
          seen = true;
          run();
          obs.disconnect();
        });
      }, { threshold: 0.4 });
      show(target - 1.5);
      obs.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     Întrebări frecvente
     ---------------------------------------------------------------------- */

  $$(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";

      // O singură întrebare deschisă odată, ca în prototip.
      $$(".faq__q").forEach(function (other) {
        if (other === btn) return;
        var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        other.setAttribute("aria-expanded", "false");
        var sign = $(".faq__sign", other);
        if (sign) sign.textContent = "+";
        if (otherPanel) otherPanel.hidden = true;
      });

      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      var sign = $(".faq__sign", btn);
      if (sign) sign.textContent = open ? "+" : "−";
    });
  });

  /* ----------------------------------------------------------------------
     Capcană de focus pentru straturile modale
     ---------------------------------------------------------------------- */

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, event) {
    var items = $$(FOCUSABLE, container).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  var lastFocused = null;

  /* ----------------------------------------------------------------------
     Lightbox
     ---------------------------------------------------------------------- */

  var lb = $("#lightbox");
  var lbImg = lb && $("#lightbox-img");
  var lbCap = lb && $("#lightbox-cap");
  var lbCount = lb && $("#lightbox-count");
  var lbSet = [];
  var lbIndex = -1;

  function lbRender() {
    var item = lbSet[lbIndex];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.alt || "Fotografie Select House Sibiu";
    lbCap.textContent = item.cap || "";
    lbCount.textContent = (lbIndex + 1) + " / " + lbSet.length;
  }

  function lbOpen(set, index) {
    if (!lb || !set || !set.length) return;
    lastFocused = document.activeElement;
    lbSet = set;
    lbIndex = index;
    lbRender();
    lb.hidden = false;
    document.body.classList.add("is-locked");
    var close = $("#lightbox-close", lb);
    if (close) close.focus();
  }

  function lbClose() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbIndex = -1;
    if (!$(".modal:not([hidden])")) document.body.classList.remove("is-locked");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function lbStep(delta) {
    if (lbIndex < 0 || !lbSet.length) return;
    lbIndex = (lbIndex + delta + lbSet.length) % lbSet.length;
    lbRender();
  }

  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest("[data-lb-close]")) lbClose();
    });
    var prevBtn = $("[data-lb-prev]", lb);
    var nextBtn = $("[data-lb-next]", lb);
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); lbStep(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); lbStep(1); });
  }

  // Deschidere din galeriile din pagină
  $$("[data-lb-group]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.getAttribute("data-lb-group");
      var set = (window.SH_LIGHTBOX || {})[group];
      if (!set) return;
      lbOpen(set, parseInt(btn.getAttribute("data-lb-index"), 10) || 0);
    });
  });

  /* ----------------------------------------------------------------------
     Fereastra camerei
     ---------------------------------------------------------------------- */

  var modal = $("#room-modal");
  var rooms = window.SH_ROOMS || {};

  function fillModal(room) {
    $("#room-modal-name").textContent = room.name;
    var hero = $("#room-modal-img");
    hero.src = room.img;
    hero.alt = room.alt;

    $("#room-modal-area").textContent = room.area;
    $("#room-modal-cap").textContent = room.cap;
    $("#room-modal-view").textContent = room.view;
    $("#room-modal-beds").textContent = room.beds;

    // Miniaturi
    var thumbs = $("#room-modal-thumbs");
    thumbs.innerHTML = "";
    var lightboxSet = [{ src: room.img, alt: room.alt, cap: room.name }].concat(
      room.gal.map(function (src, i) {
        return { src: src, alt: room.name + " — fotografie " + (i + 2), cap: room.name };
      })
    );
    room.gal.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shot";
      btn.innerHTML = '<img src="' + src + '" alt="' + room.name
        + ' — fotografie ' + (i + 2) + '" loading="lazy">';
      btn.addEventListener("click", function () { lbOpen(lightboxSet, i + 1); });
      thumbs.appendChild(btn);
    });

    var heroBtn = $("#room-modal-hero-btn");
    if (heroBtn) heroBtn.onclick = function () { lbOpen(lightboxSet, 0); };

    // Dotări
    var list = $("#room-modal-amenities");
    list.innerHTML = "";
    room.am.forEach(function (item) {
      var row = document.createElement("div");
      row.innerHTML = '<span class="diamond"></span><span></span>';
      row.lastChild.textContent = item;
      list.appendChild(row);
    });

    var request = $("#room-modal-request");
    if (request) request.setAttribute("data-request-room", room.id);
  }

  function openRoom(id) {
    var room = rooms[id];
    if (!room || !modal) return;
    lastFocused = document.activeElement;
    fillModal(room);
    modal.hidden = false;
    document.body.classList.add("is-locked");
    var close = $("#room-modal-close", modal);
    if (close) close.focus();
  }

  function closeRoom() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    if (!lb || lb.hidden) document.body.classList.remove("is-locked");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-room-close]")) closeRoom();
    });
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-room]");
    if (opener) {
      e.preventDefault();
      openRoom(opener.getAttribute("data-open-room"));
    }
  });

  /* ----------------------------------------------------------------------
     „Solicită disponibilitatea” — duce la formular cu camera precompletată
     ---------------------------------------------------------------------- */

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-request-room]");
    if (!btn) return;
    var id = btn.getAttribute("data-request-room");
    var room = rooms[id];
    var name = room ? room.name : "";

    var select = $("#f-room");
    if (!select) {
      // Nu există formular pe pagina curentă — trimite spre contact.
      window.location.href = "contact.html" + (name ? "?camera=" + encodeURIComponent(name) : "");
      return;
    }

    e.preventDefault();
    closeRoom();
    if (name) select.value = name;
    var form = $("#formular-rezervare");
    if (form) {
      form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      window.setTimeout(function () {
        var first = $("#f-nume");
        if (first) first.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 520);
    }
  });

  // Camera preselectată din adresa paginii (?camera=…)
  (function () {
    var select = $("#f-room");
    if (!select || !window.location.search) return;
    var match = /[?&]camera=([^&]+)/.exec(window.location.search);
    if (!match) return;
    var wanted = decodeURIComponent(match[1].replace(/\+/g, " "));
    $$("option", select).forEach(function (opt) {
      if (opt.value === wanted) select.value = wanted;
    });
  })();

  /* ----------------------------------------------------------------------
     Taste globale
     ---------------------------------------------------------------------- */

  window.addEventListener("keydown", function (e) {
    var lbOpenNow = lb && !lb.hidden;
    var modalOpenNow = modal && !modal.hidden;

    if (e.key === "Escape") {
      if (lbOpenNow) { lbClose(); return; }
      if (modalOpenNow) closeRoom();
      return;
    }
    if (lbOpenNow) {
      if (e.key === "ArrowRight") lbStep(1);
      if (e.key === "ArrowLeft") lbStep(-1);
      if (e.key === "Tab") trapFocus(lb, e);
      return;
    }
    if (modalOpenNow && e.key === "Tab") trapFocus(modal, e);
  });

  /* ----------------------------------------------------------------------
     Bara de disponibilitate
     ---------------------------------------------------------------------- */

  var availability = $("#bara-disponibilitate");
  if (availability) {
    var inEl = $("#bq-in");
    var outEl = $("#bq-out");
    var guestsEl = $("#bq-guests");
    var typeEl = $("#bq-type");
    var result = $("#bq-result");
    var summary = $("#bq-summary");

    // Nu se pot alege date din trecut, iar plecarea vine după sosire.
    var today = new Date().toISOString().slice(0, 10);
    if (inEl) inEl.min = today;
    if (outEl) outEl.min = today;
    if (inEl && outEl) {
      inEl.addEventListener("change", function () {
        outEl.min = inEl.value || today;
        if (outEl.value && outEl.value < outEl.min) outEl.value = "";
      });
    }

    var roDate = function (value) {
      if (!value) return "";
      var parts = value.split("-");
      return parts[2] + "." + parts[1] + "." + parts[0];
    };

    availability.addEventListener("submit", function (e) {
      e.preventDefault();
      var bits = [];
      if (inEl.value && outEl.value) bits.push("Perioada " + roDate(inEl.value) + " – " + roDate(outEl.value));
      else if (inEl.value) bits.push("Sosire " + roDate(inEl.value));
      bits.push(guestsEl.value);
      if (typeEl.value !== "Orice cameră") bits.push(typeEl.value);

      summary.textContent = bits.join(", ")
        + ". Trimite datele de contact în formularul de rezervare sau sună direct.";
      result.hidden = false;

      // Trece datele în formularul de rezervare de pe aceeași pagină.
      var fIn = $("#f-in"), fOut = $("#f-out"), fRoom = $("#f-room"), fPers = $("#f-pers");
      if (fIn && inEl.value) fIn.value = inEl.value;
      if (fOut && outEl.value) fOut.value = outEl.value;
      if (fRoom && typeEl.value !== "Orice cameră") fRoom.value = typeEl.value;
      if (fPers) {
        var digits = guestsEl.value.match(/^\d/);
        if (guestsEl.value.indexOf("copil") > -1) fPers.value = "2 adulți și 1 copil";
        else if (digits) fPers.value = digits[0];
      }
      result.setAttribute("tabindex", "-1");
      result.focus({ preventScroll: true });
    });
  }

  /* ----------------------------------------------------------------------
     Anul curent în subsol
     ---------------------------------------------------------------------- */

  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

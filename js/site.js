/* Select House Sibiu — interacțiuni.
   Fără dependențe. Fiecare bloc verifică întâi dacă elementele există,
   pentru că același fișier este încărcat pe toate paginile. */

(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var reduced = function () {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  };
  var isTouch = function () {
    return !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
  };
  var vw = function () {
    return window.innerWidth || document.documentElement.clientWidth || 1280;
  };

  var lastFocused = null;

  /* ======================================================================
     Preîncărcare
     ====================================================================== */

  var preloader = $(".preloader");
  if (preloader) {
    if (reduced()) {
      preloader.hidden = true;
    } else {
      var closePreloader = function () {
        if (preloader.classList.contains("is-done")) return;
        preloader.classList.add("is-done");
        window.setTimeout(function () { preloader.hidden = true; }, 700);
      };
      // Se închide când pagina e gata, dar niciodată mai târziu de 1,6 s.
      if (document.readyState === "complete") window.setTimeout(closePreloader, 620);
      else window.addEventListener("load", function () { window.setTimeout(closePreloader, 420); });
      window.setTimeout(closePreloader, 1600);
    }
  }

  /* ======================================================================
     Antet
     ====================================================================== */

  var header = $(".header");
  if (header && header.classList.contains("header--ghost")) {
    var scrolled = false;
    var onScroll = function () {
      var next = window.scrollY > 80;
      if (next !== scrolled) {
        scrolled = next;
        header.classList.toggle("is-scrolled", scrolled);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ======================================================================
     Meniul pe tot ecranul
     ====================================================================== */

  var burger = $(".header__burger");
  var menu = $("#meniu-mobil");

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Închide meniul" : "Deschide meniul");
    menu.hidden = !open;
    lockScroll(open);
    if (open) {
      lastFocused = document.activeElement;
      var close = $(".menu__close", menu);
      if (close) close.focus();
    } else if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    var menuClose = $(".menu__close", menu);
    if (menuClose) menuClose.addEventListener("click", function () { setMenu(false); });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ======================================================================
     Blocarea derulării când un strat acoperă pagina
     ====================================================================== */

  var lockCount = 0;
  function lockScroll(on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.body.classList.toggle("is-locked", lockCount > 0);
  }
  function anyOverlayOpen() {
    return $$(".menu, .modal, .lightbox, .sheet-backdrop").some(function (el) { return !el.hidden; });
  }

  /* ======================================================================
     Dezvăluire la derulare
     ====================================================================== */

  var revealables = $$("[data-rv]");
  if (revealables.length) {
    var revealAll = function () {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    };
    if (reduced() || !("IntersectionObserver" in window)
        || !document.documentElement.classList.contains("js-motion")) {
      revealAll();
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          if (el.dataset.rv === "stagger") {
            Array.prototype.forEach.call(el.children, function (child, i) {
              child.style.transitionDelay = Math.min(i * 70, 560) + "ms";
            });
          }
          el.classList.add("is-in");
          revealObserver.unobserve(el);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
      revealables.forEach(function (el) { revealObserver.observe(el); });

      // Plasă de siguranță: dacă observatorul nu livrează (filă în fundal,
      // browser care limitează animațiile), conținutul apare oricum.
      window.setTimeout(revealAll, 3000);
    }
  }

  /* ======================================================================
     Parallax — doar pe desktop cu mouse
     ====================================================================== */

  var pxEls = $$("[data-parallax]");
  if (pxEls.length) {
    var pxCache = null;

    var buildCache = function () {
      pxCache = pxEls.map(function (el) {
        var host = el.parentNode;
        var box = host.getBoundingClientRect();
        return {
          el: el,
          top: box.top + window.scrollY,
          h: box.height,
          max: parseFloat(el.getAttribute("data-parallax")) || 8
        };
      });
    };

    var runParallax = function () {
      if (reduced() || vw() < 1024 || isTouch()) {
        pxEls.forEach(function (el) { el.style.transform = "none"; });
        pxCache = null;
        return;
      }
      if (!pxCache) buildCache();
      var y0 = window.scrollY;
      var vh = window.innerHeight;
      pxCache.forEach(function (p) {
        var mid = (p.top - y0 + p.h / 2 - vh / 2) / vh;
        if (mid < -1.6 || mid > 1.6) return;
        var y = Math.max(-p.max, Math.min(p.max, -mid * p.max * 1.6));
        p.el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
      });
    };

    var pxTick = 0;
    window.addEventListener("scroll", function () {
      if (pxTick) return;
      pxTick = requestAnimationFrame(function () { pxTick = 0; runParallax(); });
    }, { passive: true });
    window.addEventListener("resize", function () { pxCache = null; runParallax(); });
    runParallax();
  }

  /* ======================================================================
     Numărătoarea ratingului
     ====================================================================== */

  $$("[data-count-to]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var show = function (v) { el.textContent = v.toFixed(1).replace(".", ","); };
    if (reduced()) { show(target); return; }

    var run = function () {
      var value = target - 1.5;
      var tick = setInterval(function () {
        value = Math.min(target, value + 0.11);
        show(value);
        if (value >= target) clearInterval(tick);
      }, 34);
    };

    if (!("IntersectionObserver" in window)) { run(); return; }
    show(target - 1.5);
    var started = false;
    var start = function () {
      if (started) return;
      started = true;
      run();
    };
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        start();
        obs.disconnect();
      });
    }, { threshold: 0.4 });
    obs.observe(el);
    // Dacă observatorul nu livrează, cifra nu are voie să rămână blocată.
    window.setTimeout(function () { if (!started) { obs.disconnect(); show(target); } }, 3000);
  });

  /* ======================================================================
     Hărți încărcate doar când ajung pe ecran
     ====================================================================== */

  $$("[data-lazymap]").forEach(function (host) {
    var src = host.getAttribute("data-lazymap");
    var pending = $(".map-pending", host);

    var load = function () {
      if (host.dataset.loaded) return;
      host.dataset.loaded = "1";
      var frame = document.createElement("iframe");
      frame.title = host.getAttribute("data-map-title") || "Harta locației Select House Sibiu";
      frame.loading = "lazy";
      frame.src = src;
      frame.addEventListener("load", function () { if (pending) pending.hidden = true; });
      host.appendChild(frame);
    };

    if (!("IntersectionObserver" in window)) { load(); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        load();
        obs.disconnect();
      });
    }, { rootMargin: "300px" });
    obs.observe(host);

    // Plasă de siguranță pentru cazul în care observatorul nu livrează:
    // verificăm poziția direct, la derulare, fără a încărca harta degeaba.
    var check = function () {
      if (host.dataset.loaded) return;
      var box = host.getBoundingClientRect();
      if (box.top < window.innerHeight + 300 && box.bottom > -300) {
        obs.disconnect();
        load();
        window.removeEventListener("scroll", check);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    window.setTimeout(check, 2500);
  });

  /* ======================================================================
     Întrebări frecvente
     ====================================================================== */

  $$(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";

      // O singură întrebare deschisă odată, ca în prototip.
      $$(".faq__q").forEach(function (other) {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        if (otherPanel) otherPanel.hidden = true;
      });

      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  /* ======================================================================
     Recenzii — indicatori pentru carusel
     ====================================================================== */

  var quotes = $(".quotes");
  var dots = $(".dots");
  if (quotes && dots) {
    quotes.addEventListener("scroll", function () {
      var i = Math.round(quotes.scrollLeft / (quotes.clientWidth * 0.78));
      i = Math.max(0, Math.min(dots.children.length - 1, i));
      Array.prototype.forEach.call(dots.children, function (dot, j) {
        dot.classList.toggle("is-on", j === i);
      });
    }, { passive: true });
  }

  /* ======================================================================
     Galerie — „vezi mai multe fotografii”
     ====================================================================== */

  var moreBtn = $("[data-gallery-more]");
  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      var hidden = $$(".gallery-grid .shot[hidden]");
      hidden.forEach(function (el) { el.hidden = false; });
      $(".gallery-more").hidden = true;
      if (hidden.length) hidden[0].focus();
    });
  }

  /* ======================================================================
     Capcană de focus
     ====================================================================== */

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

  /* ======================================================================
     Gesturi de glisare
     ====================================================================== */

  function onSwipe(el, handler) {
    if (!el) return;
    var x0 = null, y0 = null;
    el.addEventListener("touchstart", function (e) {
      var t = e.changedTouches[0];
      x0 = t.clientX; y0 = t.clientY;
    }, { passive: true });
    el.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0;
      var dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) handler(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ======================================================================
     Lightbox
     ====================================================================== */

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
    if (lb.hidden) { lastFocused = document.activeElement; lockScroll(true); }
    lbSet = set;
    lbIndex = index;
    lbRender();
    lb.hidden = false;
    var close = $("#lightbox-close", lb);
    if (close) close.focus();
  }

  function lbClose() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbIndex = -1;
    lockScroll(false);
    if (lastFocused && lastFocused.focus && !anyOverlayOpen()) lastFocused.focus();
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
    var stage = $(".lightbox__stage", lb);
    if (stage) stage.addEventListener("click", function (e) { e.stopPropagation(); });
    $$("[data-lb-prev]", lb).forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); lbStep(-1); });
    });
    $$("[data-lb-next]", lb).forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); lbStep(1); });
    });
    onSwipe(stage, lbStep);
  }

  $$("[data-lb-group]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var set = (window.SH_LIGHTBOX || {})[btn.getAttribute("data-lb-group")];
      if (!set) return;
      lbOpen(set, parseInt(btn.getAttribute("data-lb-index"), 10) || 0);
    });
  });

  /* ======================================================================
     Fereastra camerei
     ====================================================================== */

  var modal = $("#room-modal");
  var rooms = window.SH_ROOMS || {};
  var currentRoom = null;
  var photoIndex = 0;

  function roomPhotos(room) {
    return [{ src: room.img, alt: room.alt, cap: room.name }].concat(
      room.gal.map(function (src, i) {
        return { src: src, alt: room.name + " — fotografie " + (i + 2), cap: room.name };
      })
    );
  }

  function renderPhoto() {
    if (!currentRoom) return;
    var photos = roomPhotos(currentRoom);
    var item = photos[photoIndex % photos.length];
    var img = $("#room-modal-img");
    img.src = item.src;
    img.alt = item.alt;
    $("#room-modal-counter").textContent = ((photoIndex % photos.length) + 1) + " / " + photos.length + " · glisează";
  }

  function stepPhoto(delta) {
    if (!currentRoom) return;
    var total = roomPhotos(currentRoom).length;
    photoIndex = (photoIndex + delta + total) % total;
    renderPhoto();
  }

  function fillModal(room) {
    currentRoom = room;
    photoIndex = 0;

    $("#room-modal-name").textContent = room.name;
    $("#room-modal-area").textContent = room.area;
    $("#room-modal-cap").textContent = room.cap;
    $("#room-modal-view").textContent = room.view;
    $("#room-modal-beds").textContent = room.beds;
    renderPhoto();

    var photos = roomPhotos(room);

    // Miniaturi (doar pe desktop, ascunse prin CSS mai jos de 1024)
    var thumbs = $("#room-modal-thumbs");
    thumbs.innerHTML = "";
    room.gal.forEach(function (src, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shot";
      btn.setAttribute("aria-label", "Deschide fotografia " + (i + 2) + " pentru " + room.name);
      var img = document.createElement("img");
      img.src = src;
      img.alt = room.name + " — fotografie " + (i + 2);
      img.loading = "lazy";
      btn.appendChild(img);
      btn.addEventListener("click", function () { lbOpen(photos, i + 1); });
      thumbs.appendChild(btn);
    });

    var stage = $("#room-modal-stage");
    if (stage) stage.onclick = function (e) {
      if (e.target.closest("button")) return;
      lbOpen(photos, photoIndex % photos.length);
    };

    var list = $("#room-modal-amenities");
    list.innerHTML = "";
    room.am.forEach(function (item) {
      var row = document.createElement("div");
      var span = document.createElement("span");
      span.textContent = item;
      row.appendChild(span);
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
    lockScroll(true);
    var close = $("#room-modal-close", modal);
    if (close) close.focus();
  }

  function closeRoom() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    currentRoom = null;
    lockScroll(false);
    if (lastFocused && lastFocused.focus && !anyOverlayOpen()) lastFocused.focus();
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-room-close]")) closeRoom();
    });
    var prevPhoto = $("[data-photo-prev]", modal);
    var nextPhoto = $("[data-photo-next]", modal);
    if (prevPhoto) prevPhoto.addEventListener("click", function (e) { e.stopPropagation(); stepPhoto(-1); });
    if (nextPhoto) nextPhoto.addEventListener("click", function (e) { e.stopPropagation(); stepPhoto(1); });
    onSwipe($("#room-modal-stage"), stepPhoto);
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-room]");
    if (!opener) return;
    e.preventDefault();
    openRoom(opener.getAttribute("data-open-room"));
  });

  /* ======================================================================
     „Solicită disponibilitatea”
     ====================================================================== */

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-request-room]");
    if (!btn) return;
    var room = rooms[btn.getAttribute("data-request-room")];
    var name = room ? room.name : "";

    var select = $("#f-room");
    if (!select) {
      window.location.href = "contact.html" + (name ? "?camera=" + encodeURIComponent(name) : "");
      return;
    }

    e.preventDefault();
    closeRoom();
    if (name) select.value = name;
    var form = $("#formular-rezervare");
    if (form) {
      form.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      window.setTimeout(function () {
        var first = $("#f-nume");
        if (first) first.focus({ preventScroll: true });
      }, reduced() ? 0 : 520);
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

  /* ======================================================================
     Panoul glisant de disponibilitate (telefon)
     ====================================================================== */

  var sheet = $("#panou-disponibilitate");

  function setSheet(open) {
    if (!sheet) return;
    if (open) lastFocused = document.activeElement;
    sheet.hidden = !open;
    lockScroll(open);
    if (open) {
      var first = $(".sheet__body input", sheet);
      if (first) first.focus();
    } else if (lastFocused && lastFocused.focus && !anyOverlayOpen()) {
      lastFocused.focus();
    }
  }

  $$("[data-open-sheet]").forEach(function (btn) {
    btn.addEventListener("click", function () { setSheet(true); });
  });

  if (sheet) {
    sheet.addEventListener("click", function (e) {
      if (e.target === sheet || e.target.closest("[data-sheet-close]")) setSheet(false);
    });
  }

  /* ======================================================================
     Verificarea disponibilității
     ====================================================================== */

  function today() { return new Date().toISOString().slice(0, 10); }

  function wireAvailability(form) {
    if (!form) return;
    var inEl = $("[data-bq-in]", form);
    var outEl = $("[data-bq-out]", form);
    var guestsEl = $("[data-bq-guests]", form);
    var typeEl = $("[data-bq-type]", form);
    var err = $("[data-bq-error]", form);

    if (inEl) inEl.min = today();
    if (outEl) outEl.min = today();
    if (inEl && outEl) {
      inEl.addEventListener("change", function () {
        outEl.min = inEl.value || today();
        if (outEl.value && outEl.value < outEl.min) outEl.value = "";
      });
    }

    var fail = function (message) {
      if (!err) return;
      err.textContent = message;
      err.hidden = false;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.hidden = true;

      if (!inEl.value || !outEl.value) return fail("Alege data de sosire și data de plecare.");
      if (inEl.value < today()) return fail("Data de sosire nu poate fi în trecut.");
      if (outEl.value <= inEl.value) return fail("Data de plecare trebuie să fie după data de sosire.");

      var guests = guestsEl.value;
      var pers = guests === "1 oaspete" ? "1"
        : guests === "3 oaspeți" ? "3"
        : guests === "2 adulți și 1 copil" ? "2 adulți și 1 copil"
        : "2";
      var room = typeEl.value === "Orice cameră" ? "Fără preferință" : typeEl.value;

      // Pe pagina principală formularul e pe aceeași pagină; altfel mergem la contact.
      var fIn = $("#f-in");
      if (!fIn) {
        window.location.href = "contact.html?sosire=" + encodeURIComponent(inEl.value)
          + "&plecare=" + encodeURIComponent(outEl.value)
          + "&persoane=" + encodeURIComponent(pers)
          + "&camera=" + encodeURIComponent(room);
        return;
      }

      fIn.value = inEl.value;
      $("#f-out").value = outEl.value;
      $("#f-pers").value = pers;
      $("#f-room").value = room;

      setSheet(false);
      var target = $("#formular-rezervare");
      if (target) {
        target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        window.setTimeout(function () {
          var first = $("#f-nume");
          if (first) first.focus({ preventScroll: true });
        }, reduced() ? 0 : 520);
      }
    });
  }

  wireAvailability($("#bara-disponibilitate"));
  wireAvailability($("#formular-panou"));

  // Datele venite din bara de disponibilitate a altei pagini
  (function () {
    if (!window.location.search || !$("#f-in")) return;
    var read = function (key) {
      var m = new RegExp("[?&]" + key + "=([^&]+)").exec(window.location.search);
      return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
    };
    var map = { sosire: "#f-in", plecare: "#f-out", persoane: "#f-pers" };
    Object.keys(map).forEach(function (key) {
      var value = read(key);
      var el = $(map[key]);
      if (value && el) el.value = value;
    });
  })();

  /* ======================================================================
     Taste globale
     ====================================================================== */

  window.addEventListener("keydown", function (e) {
    var lbOpenNow = lb && !lb.hidden;
    var modalOpenNow = modal && !modal.hidden;
    var sheetOpenNow = sheet && !sheet.hidden;
    var menuOpenNow = menu && !menu.hidden;

    if (e.key === "Escape") {
      if (lbOpenNow) return lbClose();
      if (modalOpenNow) return closeRoom();
      if (sheetOpenNow) return setSheet(false);
      if (menuOpenNow) return setMenu(false);
      return;
    }

    if (lbOpenNow) {
      if (e.key === "ArrowRight") lbStep(1);
      if (e.key === "ArrowLeft") lbStep(-1);
      if (e.key === "Tab") trapFocus(lb, e);
      return;
    }
    if (modalOpenNow) {
      if (e.key === "ArrowRight") stepPhoto(1);
      if (e.key === "ArrowLeft") stepPhoto(-1);
      if (e.key === "Tab") trapFocus(modal, e);
      return;
    }
    if (sheetOpenNow && e.key === "Tab") trapFocus(sheet, e);
    else if (menuOpenNow && e.key === "Tab") trapFocus(menu, e);
  });

  /* ======================================================================
     Mărunțișuri
     ====================================================================== */

  $$("[data-to-top]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    });
  });

  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

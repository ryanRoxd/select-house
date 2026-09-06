/* Select House Sibiu — formularul de cerere de rezervare.

   ┌──────────────────────────────────────────────────────────────────────┐
   │  CUM SE ACTIVEAZĂ TRIMITEREA PE EMAIL                                │
   │                                                                      │
   │  1. Intră pe https://web3forms.com și introdu adresa                 │
   │     sibiusky@gmail.com. Cheia de acces vine pe email, gratuit.       │
   │  2. Înlocuiește textul de mai jos cu cheia primită.                  │
   │  3. Salvează și publică. Gata — cererile ajung pe email.             │
   │                                                                      │
   │  Cât timp cheia lipsește, site-ul rulează în modul de prezentare:    │
   │  formularul validează și confirmă, dar spune vizibil că cererea      │
   │  nu a fost trimisă și afișează numărul de telefon.                   │
   └──────────────────────────────────────────────────────────────────────┘ */

var WEB3FORMS_ACCESS_KEY = "PUNE-CHEIA-AICI";

(function () {
  "use strict";

  var ENDPOINT = "https://api.web3forms.com/submit";
  var PHONE = "+40 770 644 990";
  var isLive = WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY.indexOf("PUNE-CHEIA") === -1;

  var form = document.getElementById("formular-rezervare");
  if (!form) return;

  var panel = form.closest(".form-panel") || form.parentNode;
  var body = form.querySelector(".form-body");
  var success = panel.querySelector(".form-success");
  var successName = panel.querySelector("[data-success-name]");
  var demoNote = panel.querySelector("[data-demo-note]");
  var errorBox = form.querySelector(".form-error");
  var submitBtn = form.querySelector('button[type="submit"]');

  var fields = {
    nume: document.getElementById("f-nume"),
    tel: document.getElementById("f-tel"),
    email: document.getElementById("f-email")
  };

  var reduceMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- */
  /* Validare                                                          */
  /* ---------------------------------------------------------------- */

  // Acceptă formatele româneşti uzuale şi cele internaţionale:
  // 0770 644 990, +40 770 644 990, 0040770644990.
  function validPhone(value) {
    var digits = value.replace(/[^\d+]/g, "");
    return /^(\+?\d{10,15})$/.test(digits);
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
  }

  function setError(name, hasError) {
    var input = fields[name] || document.getElementById("f-" + name);
    var msg = document.getElementById("err-" + name);
    if (msg) msg.hidden = !hasError;
    if (input) {
      if (hasError) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
    return hasError;
  }

  function validate() {
    var gdpr = document.getElementById("f-gdpr");
    var problems = [];

    if (setError("nume", fields.nume.value.trim().length < 2)) problems.push(fields.nume);
    if (setError("tel", !validPhone(fields.tel.value))) problems.push(fields.tel);
    if (setError("email", !validEmail(fields.email.value))) problems.push(fields.email);
    if (setError("gdpr", !gdpr.checked)) problems.push(gdpr);

    return problems;
  }

  // Ascunde eroarea imediat ce omul corectează câmpul.
  Object.keys(fields).forEach(function (name) {
    if (!fields[name]) return;
    fields[name].addEventListener("input", function () {
      var msg = document.getElementById("err-" + name);
      if (msg && !msg.hidden) setError(name, false);
    });
  });
  var gdprBox = document.getElementById("f-gdpr");
  if (gdprBox) {
    gdprBox.addEventListener("change", function () {
      if (gdprBox.checked) setError("gdpr", false);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Trimitere                                                         */
  /* ---------------------------------------------------------------- */

  function roDate(value) {
    if (!value) return "nespecificat";
    var p = value.split("-");
    return p[2] + "." + p[1] + "." + p[0];
  }

  function buildPayload() {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };
    return {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: "Cerere de rezervare — " + get("f-nume"),
      from_name: "Site Select House Sibiu",
      Nume: get("f-nume"),
      Telefon: get("f-tel"),
      Email: get("f-email"),
      Sosire: roDate(get("f-in")),
      Plecare: roDate(get("f-out")),
      Persoane: get("f-pers"),
      Camera: get("f-room"),
      Mesaj: get("f-msg") || "—",
      Acord_GDPR: "Da",
      botcheck: get("f-website")
    };
  }

  function showSuccess(name) {
    if (successName) successName.textContent = name;
    if (demoNote) demoNote.hidden = isLive;
    if (body) body.hidden = true;
    if (errorBox) errorBox.hidden = true;
    if (success) {
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.focus({ preventScroll: true });
      success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
  }

  function showFailure() {
    if (!errorBox) return;
    errorBox.hidden = false;
    errorBox.setAttribute("tabindex", "-1");
    errorBox.focus({ preventScroll: true });
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Se trimite…" : "Trimite cererea";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Capcană pentru roboți: dacă acest câmp ascuns e completat, nu e om.
    var honeypot = document.getElementById("f-website");
    if (honeypot && honeypot.value) return;

    var problems = validate();
    if (problems.length) {
      problems[0].focus();
      return;
    }

    var name = fields.nume.value.trim().split(/\s+/)[0];
    setLoading(true);
    if (errorBox) errorBox.hidden = true;

    if (!isLive) {
      // Modul de prezentare — nu există cheie, deci nu se trimite nimic.
      window.setTimeout(function () {
        setLoading(false);
        showSuccess(name);
      }, 700);
      return;
    }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildPayload())
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setLoading(false);
        if (data && data.success) showSuccess(name);
        else showFailure();
      })
      .catch(function () {
        setLoading(false);
        showFailure();
      });
  });

  /* ---------------------------------------------------------------- */
  /* „Trimite o altă cerere”                                           */
  /* ---------------------------------------------------------------- */

  var again = panel.querySelector("[data-form-reset]");
  if (again) {
    again.addEventListener("click", function () {
      form.reset();
      Object.keys(fields).forEach(function (n) { setError(n, false); });
      setError("gdpr", false);
      if (success) success.hidden = true;
      if (body) body.hidden = false;
      if (fields.nume) fields.nume.focus();
    });
  }

  if (!isLive && window.console && console.info) {
    console.info(
      "Select House Sibiu — formularul rulează în modul de prezentare. "
      + "Pune cheia Web3Forms în js/form.js pentru a primi cererile pe email. Telefon: " + PHONE
    );
  }
})();

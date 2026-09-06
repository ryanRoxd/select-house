# Select House Sibiu

Site de prezentare pentru pensiunea Select House, Strada Nouă 46, Sibiu.
HTML static, fără framework și fără dependențe — se publică oriunde.

Construit pe baza prototipului de design `Select House Sibiu v1.dc.html`.

---

## Pornire rapidă

```bash
npm run dev
```

Generează paginile și pornește un server local pe <http://localhost:4173>.
Nu se instalează nimic — folosește doar Node (v18+).

Pentru a genera paginile fără server:

```bash
npm run build
```

---

## Cum e organizat

```
src/data.js        ← TOT conținutul: camere, galerie, întrebări, distanțe, contact
src/build.js       ← generează paginile .html din datele de mai sus
css/site.css       ← stilurile întregului site
js/site.js         ← meniu, ferestre cu camere, galerie pe tot ecranul, întrebări frecvente
js/form.js         ← validarea și trimiterea cererii de rezervare
assets/            ← cele 18 fotografii ale proprietății

index.html  camere.html  galerie.html  locatie.html  contact.html
confidentialitate.html  sitemap.xml  robots.txt      ← GENERATE, nu le edita direct
```

> **Important:** fișierele `.html` din rădăcină sunt generate.
> Orice modificare făcută direct în ele se pierde la următorul `npm run build`.
> Textele se schimbă în `src/data.js`, structura paginilor în `src/build.js`.

### Exemplu: schimbarea unei camere

Deschide `src/data.js`, găsește camera în lista `rooms`, modifică ce vrei
(`name`, `area`, `beds`, `tags`…), apoi rulează `npm run build`. Camera se
actualizează simultan pe pagina principală, pe pagina de camere, în fereastra
de detalii și în lista derulantă din formular.

---

## Formularul de rezervare

În acest moment site-ul rulează în **modul de prezentare**: formularul
validează datele și afișează confirmarea, dar spune vizibil că cererea nu a
plecat pe email și afișează numărul de telefon.

### Ca să ajungă cererile pe email

1. Intră pe <https://web3forms.com> și introdu adresa `sibiusky@gmail.com`.
   Primești o cheie de acces pe email, gratuit, fără cont.
2. Deschide `js/form.js` și înlocuiește prima linie de cod:

   ```js
   var WEB3FORMS_ACCESS_KEY = "PUNE-CHEIA-AICI";
   ```

   cu cheia primită.
3. Salvează și publică. Din acel moment fiecare cerere ajunge pe email, iar
   nota de prezentare dispare automat.

Formularul are și o capcană ascunsă pentru roboți, ca să reducă mesajele
nedorite.

---

## Publicare pe Vercel

Site-ul e complet static — Vercel nu trebuie să ruleze nimic.

1. Urcă proiectul pe GitHub.
2. Pe <https://vercel.com/new>, importă depozitul.
3. La *Framework Preset* alege **Other**. Lasă *Build Command* gol și
   *Output Directory* gol (rădăcina).
4. Apasă **Deploy**.

`vercel.json` este deja configurat: adrese fără `.html`, memorare în cache a
fotografiilor timp de un an și câteva anteturi de securitate.

După publicare, înlocuiește `SITE_URL` din `src/build.js` cu adresa reală și
rulează din nou `npm run build`, ca adresele canonice și `sitemap.xml` să fie
corecte.

---

## De verificat înainte de lansarea publică

Trei lucruri țin de proprietar, nu de cod:

1. **Drepturile asupra fotografiilor.** Imaginile din `assets/` au fost
   preluate de pe site-ul public existent, pentru prototip. Înainte de
   publicare, cere proprietarei confirmarea dreptului de folosire și, ideal,
   fișierele originale la rezoluție mare.
2. **Ratingul și numărul de recenzii.** Valorile 9,7 și „peste 390 de recenzii"
   sunt preluate de pe Booking.com și se schimbă în timp. Se actualizează în
   `src/data.js` (`site.rating`, `site.reviewCount`).
3. **Politica de confidențialitate.** Textul din `confidentialitate.html` este
   o variantă de pornire. Trebuie completat cu datele firmei (denumire, CUI,
   sediu) și verificat juridic.

---

## Verificarea fotografiilor

```bash
npm run check-images
```

Confirmă că fiecare fotografie are marcajul de final de fișier — fișierele
importate prin API-ul de design veneau uneori trunchiate.

---

## Fișierele prototipului

`Select House Sibiu v1.dc.html`, `Formular Rezervare.dc.html`, `support.js`,
`uploads/` și `contact-sheet.png` sunt sursele de design. Sunt excluse din
depozit prin `.gitignore`, ca să nu ajungă publice odată cu site-ul. Rămân pe
disc; dacă vrei să le păstrezi și în depozit, șterge liniile corespunzătoare
din `.gitignore`.

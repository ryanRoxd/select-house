// Singura sursă de adevăr pentru conținutul site-ului.
// După orice modificare aici rulează:  npm run build
// (paginile .html din rădăcină sunt generate din acest fișier)

const A = "assets/";

const BASE = [
  "Baie proprie", "Aer condiționat", "Wi-Fi gratuit", "TV cu ecran plat",
  "Frigider", "Fierbător", "Uscător de păr", "Articole de toaletă",
  "Izolare fonică", "Papuci", "Fier de călcat", "Plasă de țânțari"
];

const site = {
  name: "Select House Sibiu",
  tagline: "Pensiune de 3 stele cu 8 camere, pe Strada Nouă, la câteva minute de centrul istoric al Sibiului.",
  phone: "+40 770 644 990",
  phoneHref: "tel:+40770644990",
  email: "sibiusky@gmail.com",
  street: "Strada Nouă nr. 46",
  city: "Sibiu",
  postal: "550257",
  country: "România",
  lat: 45.79320,
  lon: 24.15450,
  facebook: "https://www.facebook.com/p/Select-House-Sibiu-100063453376600/",
  maps: "https://www.google.com/maps/search/?api=1&query=Strada+Nou%C4%83+46%2C+Sibiu+550257",
  booking: "https://www.booking.com/hotel/ro/casa-hader-sibiu.ro.html",
  classification: "Certificat de clasificare nr. 21137",
  checkIn: "16:00 – 00:00",
  checkOut: "până la 11:00",
  rating: "9,7",
  reviewCount: 390,
  // Ratingul și numărul de recenzii sunt preluate de pe Booking.com. Verifică-le
  // periodic — se schimbă în timp.
  ratingChecked: "septembrie 2025"
};

const rooms = [
  {
    id: "tripla", name: "Cameră triplă", area: "24 m²", cap: "până la 3 persoane",
    view: "Stradă liniștită", beds: "Pat matrimonial și pat individual",
    img: A + "p17-tripla-paturi.jpg",
    alt: "Cameră triplă cu două paturi și textile verzi",
    tags: ["Baie proprie", "Aer condiționat", "Wi-Fi"],
    gal: [A + "p15-tripla.jpg", A + "p10-baie.jpg"],
    am: BASE.concat(["Intrare separată", "Umerașe"])
  },
  {
    id: "tripla-deluxe", name: "Cameră triplă Deluxe", area: "26 m²", cap: "până la 3 persoane",
    view: "Curte interioară", beds: "Pat matrimonial, pat individual și fotoliu extensibil",
    img: A + "p07-tripla-deluxe.jpg",
    alt: "Cameră triplă Deluxe cu canapea, pat din lemn sculptat și covor moale",
    tags: ["Șemineu decorativ", "Baie proprie", "Wi-Fi"],
    gal: [A + "p14-detaliu-semineu.jpg", A + "p10-baie.jpg"],
    am: BASE.concat(["Șemineu electric", "Intrare separată", "Aparat de cafea sau ceai"])
  },
  {
    id: "queen", name: "Cameră Queen standard", area: "17 m²", cap: "2 persoane",
    view: "Curte interioară", beds: "Pat matrimonial",
    img: A + "p13-queen-standard.jpg",
    alt: "Cameră Queen cu pat alb și tapet cu dungi",
    tags: ["Baie proprie", "Aer condiționat", "Wi-Fi"],
    gal: [A + "p12-detaliu-pat.jpg", A + "p10-baie.jpg"],
    am: BASE.slice()
  },
  {
    id: "studio-king", name: "Studio King Deluxe", area: "41 m²",
    cap: "2 persoane, pat suplimentar la cerere", view: "Curte interioară",
    beds: "Pat king, living separat și bucătărie proprie",
    img: A + "p05-studio-king.jpg",
    alt: "Studio King Deluxe cu canapea albastră, șemineu decorativ și TV",
    tags: ["Bucătărie proprie", "Șemineu decorativ", "Living"],
    gal: [A + "p06-semineu.jpg", A + "p03-cafea.jpg"],
    am: BASE.concat(["Bucătărie proprie", "Cuptor cu microunde", "Ustensile de bucătărie", "Șemineu electric", "Intrare separată"])
  },
  {
    id: "dubla", name: "Cameră dublă standard", area: "17 m²", cap: "2 persoane",
    view: "Curte interioară", beds: "Pat matrimonial",
    img: A + "p18-dubla-standard.jpg",
    alt: "Cameră dublă standard cu pat alb și cuvertură verde-albastru",
    tags: ["Baie proprie", "Aer condiționat", "Wi-Fi"],
    gal: [A + "p04-detaliu-camera.jpg", A + "p10-baie.jpg"],
    am: BASE.slice()
  },
  {
    id: "queen-deluxe", name: "Cameră Queen Deluxe", area: "20 m²", cap: "2 persoane",
    view: "Curte interioară", beds: "Pat matrimonial",
    img: A + "p09-queen-deluxe.jpg",
    alt: "Cameră Queen Deluxe cu masă, două fotolii și TV",
    tags: ["Zonă de stat", "Baie proprie", "Wi-Fi"],
    gal: [A + "p16-camera-canapea.jpg", A + "p10-baie.jpg"],
    am: BASE.concat(["Mobilier exterior", "Aparat de cafea sau ceai"])
  },
  {
    id: "dubla-superioara", name: "Cameră dublă superioară", area: "25 m²", cap: "2 persoane",
    view: "Stradă liniștită", beds: "Pat matrimonial extra-lung",
    img: A + "p11-dubla-superioara.jpg",
    alt: "Cameră dublă superioară în mansardă, cu șemineu decorativ",
    tags: ["Șemineu decorativ", "Pat extra-lung", "Wi-Fi"],
    gal: [A + "p06-semineu.jpg", A + "p10-baie.jpg"],
    am: BASE.concat(["Șemineu electric", "Paturi extra-lungi"])
  },
  {
    id: "deluxe", name: "Cameră Deluxe", area: "30 m²", cap: "2 adulți și 1 copil",
    view: "Curte interioară", beds: "Pat matrimonial și fotoliu extensibil",
    img: A + "p01-camera-deluxe.jpg",
    alt: "Cameră Deluxe cu candelabru, fotolii și covor burgundy",
    tags: ["Candelabru", "Șemineu decorativ", "Fotolii"],
    gal: [A + "p12-detaliu-pat.jpg", A + "p14-detaliu-semineu.jpg"],
    am: BASE.concat(["Șemineu electric", "Cuptor cu microunde", "Aparat de cafea sau ceai"])
  }
];

const gallery = [
  { src: A + "p01-camera-deluxe.jpg", short: "CAMERĂ DELUXE", cap: "Cameră Deluxe · candelabru și fotolii", alt: "Cameră Deluxe cu candelabru, mobilier din lemn închis și covor burgundy" },
  { src: A + "p02-curte.jpg", short: "CURTEA INTERIOARĂ", cap: "Curtea interioară · intrarea", alt: "Curte interioară pavată cu zid de piatră, plante și uși din lemn" },
  { src: A + "p07-tripla-deluxe.jpg", short: "TRIPLĂ DELUXE", cap: "Cameră triplă Deluxe", alt: "Cameră cu canapea, pat sculptat din lemn și covor moale" },
  { src: A + "p05-studio-king.jpg", short: "STUDIO KING", cap: "Studio King Deluxe · living", alt: "Living cu canapea albastră, șemineu decorativ și televizor" },
  { src: A + "p06-semineu.jpg", short: "ȘEMINEU", cap: "Șemineu decorativ și fotoliu", alt: "Șemineu decorativ din piatră, fotoliu de piele și șifonier din lemn" },
  { src: A + "p14-detaliu-semineu.jpg", short: "DETALIU", cap: "Detaliu de primire", alt: "Prosoape aranjate în formă de lebede, în fața șemineului" },
  { src: A + "p12-detaliu-pat.jpg", short: "TĂBLIE SCULPTATĂ", cap: "Tăblie sculptată", alt: "Pat cu tăblie sculptată din lemn închis și lenjerie cu model floral" },
  { src: A + "p09-queen-deluxe.jpg", short: "QUEEN DELUXE", cap: "Cameră Queen Deluxe", alt: "Cameră cu masă rotundă, două fotolii albe și pat matrimonial" },
  { src: A + "p11-dubla-superioara.jpg", short: "DUBLĂ SUPERIOARĂ", cap: "Cameră dublă superioară", alt: "Cameră în mansardă cu șemineu decorativ și cuvertură galbenă" },
  { src: A + "p13-queen-standard.jpg", short: "QUEEN STANDARD", cap: "Cameră Queen standard", alt: "Pat alb în stil sanie, pe fundal de tapet cu dungi" },
  { src: A + "p18-dubla-standard.jpg", short: "DUBLĂ STANDARD", cap: "Cameră dublă standard", alt: "Cameră dublă cu pat alb și cuvertură verde-albastru" },
  { src: A + "p17-tripla-paturi.jpg", short: "CAMERĂ TRIPLĂ", cap: "Cameră triplă · două paturi", alt: "Două paturi albe cu cuverturi verzi și noptiere din lemn" },
  { src: A + "p15-tripla.jpg", short: "ZONĂ DE LUCRU", cap: "Cameră triplă · zonă de lucru", alt: "Cameră cu pat, birou și accente galbene" },
  { src: A + "p16-camera-canapea.jpg", short: "ZONĂ DE STAT", cap: "Zonă de stat în cameră", alt: "Cameră cu canapea, pat din lemn închis și covor deschis" },
  { src: A + "p08-camera-lemn.jpg", short: "MOBILIER", cap: "Mobilier din lemn închis", alt: "Cameră cu pat sculptat, canapea și parchet din lemn" },
  { src: A + "p04-detaliu-camera.jpg", short: "PREGĂTIT", cap: "Pregătit pentru sosire", alt: "Pat pregătit cu prosoape aranjate și petale, lângă fereastră" },
  { src: A + "p10-baie.jpg", short: "BAIE PROPRIE", cap: "Baie proprie", alt: "Baie cu tapet floral, oglindă și lămpi calde" },
  { src: A + "p03-cafea.jpg", short: "CAFEA ȘI CEAI", cap: "Bucătăria comună · cafea și ceai", alt: "Ceașcă de cafea și cutie cu plicuri de ceai și cafea" }
];

// Mozaicul de pe pagina principală: șapte fotografii, cu dimensiuni diferite
// în funcție de lățimea ecranului (telefon / tabletă / desktop).
const galleryHome = [
  { i: 0,  xl: ["span 2", "span 2"], md: ["span 2", "span 2"], sm: ["span 2", "span 2"] },
  { i: 1,  xl: ["span 1", "span 1"], md: ["span 1", "span 1"], sm: ["span 1", "span 1"] },
  { i: 4,  xl: ["span 1", "span 1"], md: ["span 1", "span 1"], sm: ["span 1", "span 1"] },
  { i: 16, xl: ["span 1", "span 1"], md: ["span 1", "span 1"], sm: ["span 1", "span 1"] },
  { i: 17, xl: ["span 1", "span 1"], md: ["span 1", "span 1"], sm: ["span 1", "span 1"] },
  { i: 3,  xl: ["span 2", "span 1"], md: ["span 1", "span 1"], sm: ["span 2", "span 1"] },
  { i: 6,  xl: ["span 1", "span 1"], md: ["span 1", "span 1"], sm: ["span 1", "span 1"] }
];


// Facilitățile, grupate pe trei categorii. `shape` alege forma marcajului:
// pătrat, cerc sau romb.
const amenityGroups = [
  {
    title: "În cameră", shape: "square",
    items: ["Baie proprie", "Aer condiționat", "TV cu ecran plat", "Frigider",
            "Fierbător", "Uscător de păr", "Articole de toaletă", "Izolare fonică"]
  },
  {
    title: "Spații comune", shape: "circle",
    items: ["Bucătărie comună", "Cafea și ceai", "Lounge comun", "Terasă",
            "Curte interioară", "Mobilier exterior"]
  },
  {
    title: "Confort și acces", shape: "diamond",
    items: ["Wi-Fi gratuit", "Parcare gratuită disponibilă", "Intrare separată",
            "Check-in independent disponibil", "Camere pentru nefumători"]
  }
];

// Lista plată, folosită doar pentru datele structurate schema.org.
const amenities = [
  "Wi-Fi gratuit", "Aer condiționat", "Baie proprie", "Intrare separată",
  "TV cu ecran plat", "Frigider", "Uscător de păr", "Articole de toaletă",
  "Bucătărie comună", "Cafea și ceai", "Terasă", "Curte interioară",
  "Mobilier exterior", "Lounge comun", "Parcare gratuită disponibilă",
  "Camere pentru nefumători", "Check-in independent disponibil"
];

const landmarks = [
  { name: "Piața Mică", dist: "aprox. 500 m" },
  { name: "Podul Minciunilor", dist: "aprox. 550 m" },
  { name: "Turnul Sfatului", dist: "aprox. 550–600 m" },
  { name: "Muzeul de Istorie a Farmaciei", dist: "aprox. 450–510 m" },
  { name: "Pasajul Scărilor", dist: "aprox. 750–800 m" }
];

const distances = [
  { name: "Piața Mare", dist: "7–10 min pe jos" },
  { name: "Piața Mică", dist: "aprox. 500 m" },
  { name: "Podul Minciunilor", dist: "aprox. 550 m" },
  { name: "Turnul Sfatului", dist: "aprox. 550–600 m" },
  { name: "Muzeul de Istorie a Farmaciei", dist: "aprox. 450–510 m" },
  { name: "Marea Sinagogă din Sibiu", dist: "sub 600 m" },
  { name: "Pasajul Scărilor", dist: "aprox. 750–800 m" },
  { name: "Gara Sibiu", dist: "aprox. 850 m" },
  { name: "Aeroportul Internațional Sibiu", dist: "aprox. 4,6 km" }
];

const walk = [
  { n: "01", name: "Strada Nouă", text: "Ieși din curte și mergi spre nord-vest, pe stradă liniștită." },
  { n: "02", name: "Muzeul de Istorie a Farmaciei", text: "Primul reper din centrul istoric, la aproximativ 450–510 m." },
  { n: "03", name: "Piața Mică și Podul Minciunilor", text: "Aproximativ 500–550 m de la plecare." },
  { n: "04", name: "Piața Mare și Turnul Sfatului", text: "Punctul final, la 7–10 minute de mers pe jos." }
];

const guide = [
  { n: "01", name: "Piața Mare", text: "Cea mai amplă piață a orașului, cu Palatul Brukenthal și Biserica Iezuiților.", dist: "7–10 min pe jos" },
  { n: "02", name: "Podul Minciunilor", text: "Primul pod din fontă din România și cel mai fotografiat loc din Sibiu.", dist: "aprox. 550 m" },
  { n: "03", name: "Turnul Sfatului", text: "Urcă pentru priveliștea peste acoperișurile cu ochi de pisică.", dist: "aprox. 550–600 m" },
  { n: "04", name: "Piața Mică", text: "Terase, bolți și case de meșteșugari, între cele două piețe mari.", dist: "aprox. 500 m" },
  { n: "05", name: "Muzeul de Istorie a Farmaciei", text: "Cea mai veche farmacie din oraș, într-o clădire din secolul XVI.", dist: "aprox. 450–510 m" },
  { n: "06", name: "Străzile centrului istoric", text: "Pasajul Scărilor, Strada Turnului și zidurile de apărare.", dist: "aprox. 750–800 m" }
];

const reviews = [
  { q: "„Curățenie impecabilă și camere amenajate cu mult bun gust.”", k: "TEMĂ REPETATĂ ÎN RECENZII" },
  { q: "„Foarte aproape de centrul vechi, dar într-o zonă liniștită.”", k: "LOCAȚIE · 9,8 / 10" },
  { q: "„Gazdă primitoare și răspuns rapid la orice solicitare.”", k: "TEMĂ REPETATĂ ÎN RECENZII" },
  { q: "„Camere spațioase, paturi confortabile și o curte plăcută.”", k: "CURĂȚENIE · 9,8 / 10" }
];

const faqs = [
  { q: "La ce oră se face check-in-ul?", a: "Între 16:00 și 00:00. Check-in-ul independent, cu cheie sau cod, este disponibil la cerere — anunță gazda ora estimată de sosire." },
  { q: "La ce oră se face check-out-ul?", a: "Până la ora 11:00." },
  { q: "Există parcare?", a: "Parcare gratuită disponibilă. Confirmă detaliile și disponibilitatea la rezervare." },
  { q: "Sunt acceptate cardurile de vacanță?", a: "Da. Sunt acceptate cardurile de vacanță Sodexo/Pluxee, Up România și Edenred, alături de transfer bancar. Confirmă modalitatea preferată la rezervare." },
  { q: "Camerele au baie proprie?", a: "Toate cele 8 camere au baie proprie, cu duș, iar unele camere au cadă." },
  { q: "Există bucătărie?", a: "Da, o bucătărie comună cu frigider, cuptor cu microunde, aparat de cafea și spațiu pentru servirea mesei. Nu este disponibil aragaz sau plită, deci este potrivită pentru cafea, încălzirea mâncării și preparate simple." },
  { q: "Sunt acceptați copiii?", a: "Copiii sunt acceptați. Pătuțurile și paturile suplimentare se solicită în avans și se confirmă de proprietate." },
  { q: "Sunt acceptate animalele de companie?", a: "Nu, animalele de companie nu sunt acceptate." },
  { q: "Cât de aproape este centrul istoric?", a: "Aproximativ 7–10 minute de mers pe jos până în Piața Mare, Podul Minciunilor și Turnul Sfatului. Distanțele sunt orientative." },
  { q: "Cum primesc confirmarea rezervării?", a: "După trimiterea cererii, gazda te contactează telefonic sau prin email cu disponibilitatea și tariful. Cererea nu reprezintă o rezervare confirmată." }
];

const payments = [
  "Transfer bancar", "Card de vacanță Sodexo / Pluxee", "Up România", "Edenred", "Numerar la sosire"
];

const guestOptions = ["1 oaspete", "2 oaspeți", "3 oaspeți", "2 adulți și 1 copil"];
const personOptions = ["1", "2", "3", "2 adulți și 1 copil"];

const nav = [
  { href: "index.html", label: "Acasă", id: "acasa" },
  { href: "camere.html", label: "Camere", id: "camere" },
  { href: "index.html#facilitati", label: "Facilități", id: "facilitati" },
  { href: "galerie.html", label: "Galerie", id: "galerie" },
  { href: "locatie.html", label: "Locație", id: "locatie" },
  { href: "contact.html", label: "Contact", id: "contact" }
];

const navFooter = [
  { href: "index.html", label: "Acasă" },
  { href: "camere.html", label: "Camere" },
  { href: "galerie.html", label: "Galerie" },
  { href: "locatie.html", label: "Locație" },
  { href: "contact.html", label: "Contact și rezervare" }
];

module.exports = {
  site, rooms, gallery, galleryHome, amenityGroups, amenities, landmarks, distances,
  walk, guide, reviews, faqs, payments, guestOptions, personOptions,
  nav, navFooter
};

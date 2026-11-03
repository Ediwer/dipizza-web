"use strict";

/* ══════════════════════════════════════════════════════════════
   1 · DEFAULTS
   ══════════════════════════════════════════════════════════════ */

const DEFAULT_BRAND = {
  name: "DiPizza",
  script: "",                       /* optional script word before the name */
  badge: "Authentic pizza at your event · est. 2016",
  headline: "Made from scratch,|fired on site,|served {to your guests}.",
  lede: "We bring the wood-fired oven to you and cook Neapolitan pizza in front of your guests — dough stretched by hand, one pie at a time, never a mix and never a shortcut.",
  menuTitle: "Fourteen pizzas, three families",
  menuNote: "Vegetarian and no-tomato options are marked on the menu.",
  storyTitle: "Made for your celebration",
  storyText: "Great pizza, shared with the people who matter. Tell us about your event and we will help plan the details.",
  handle: "@dipizza00",
  instagram: "https://www.instagram.com/dipizza00/",
  tagline: "Wood-fired pizza catering · est. 2016"
};

/* Marcadores de posicion: sustituir por los datos reales de DiPizza. */
const DEFAULT_CONTACT = {
  email: "dipizza00@gmail.com",
  phone: "(484) 954-7273",
  notice: "Book ahead so we can hold your date — ask us what's open.",
  coverage: "We serve events in Augusta, Georgia. Tell us the venue and we'll confirm availability.",
  hours: "Reach out any day; we reply within one business day.",
  payment: "Ask us for a tailored proposal for your event."
};

const PRESETS = {
  dipizza: {
    label: "DiPizza",
    light: { ground:"#050505", surface:"#11100F", ink:"#F4F0E8", accent:"#D2B36E", warm:"#D2B36E", green:"#77917A", zest:"#B99758" }
  }
};

const TOKEN_LABELS = [
  ["ground", "Page"], ["surface", "Cards"], ["ink", "Text"], ["accent", "Buttons"],
  ["warm", "Red"], ["green", "Green"], ["zest", "Yellow"]
];

const DEFAULT_MENU = [
  /* ── TRADITIONALs ── */
  { id:"margherita", order:10, cat:"traditionals", star:1, name:"Margherita",
    ing:"Tomato base, fresh mozzarella, basil.",
    tags:["vegetarian"], art:{ base:"rosso", top:[["--i-mozz",7,13,"blob"],["--i-basil",5,9,"leaf"]] } },
  { id:"napoletana", order:20, cat:"traditionals", star:0, name:"Napoletana",
    ing:"Tomato base, fresh mozzarella, kalamata olives, anchovies.",
    tags:[], art:{ base:"rosso", top:[["--i-mozz",6,12,"blob"],["--i-fungo",8,7,"disc"],["--i-metal",6,9,"shred"]] } },
  { id:"garlicbread", order:30, cat:"traditionals", star:0, name:"Garlic Bread",
    ing:"Tomato base, fresh mozzarella, garlic-parsley butter, feta cheese.",
    tags:["vegetarian"], art:{ base:"rosso", top:[["--i-mozz",8,12,"blob"],["--i-blu",7,7,"crumb"],["--i-verde",12,3,"crumb"]] } },

  /* ── MEATs ── */
  { id:"pepperoni", order:40, cat:"meats", star:1, name:"Pepperoni",
    ing:"Tomato base, fresh mozzarella, pepperoni.",
    tags:[], art:{ base:"rosso", top:[["--i-mozz",6,12,"blob"],["--i-salame",10,12,"disc"]] } },
  { id:"hamcheese", order:50, cat:"meats", star:0, name:"Ham & Cheese",
    ing:"Tomato base, fresh mozzarella, ham.",
    tags:[], art:{ base:"rosso", top:[["--i-mozz",7,13,"blob"],["--i-rosa",6,14,"blob"]] } },
  { id:"prosciutto", order:60, cat:"meats", star:1, name:"Prosciutto",
    ing:"Tomato base, fresh mozzarella, prosciutto, arugula, parmigiano.",
    tags:[], art:{ base:"rosso", top:[["--i-rosa",5,16,"blob"],["--i-basil",7,9,"leaf"],["--i-mozz",5,9,"shred"]] } },
  { id:"salami", order:70, cat:"meats", star:0, name:"Salami",
    ing:"Tomato base, fresh mozzarella, salami, red onion, kalamata olive.",
    tags:[], art:{ base:"rosso", top:[["--i-mozz",5,11,"blob"],["--i-salame",8,11,"disc"],["--i-radic",7,8,"shred"],["--i-fungo",6,6,"disc"]] } },
  { id:"hawaiian", order:80, cat:"meats", star:0, name:"Hawaiian",
    ing:"Tomato base, fresh mozzarella, ham, pineapple.",
    tags:[], art:{ base:"rosso", top:[["--i-mozz",6,12,"blob"],["--i-rosa",5,13,"blob"],["--i-giallo",8,9,"disc"]] } },
  { id:"pancetta", order:90, cat:"meats", star:0, name:"Pancetta",
    ing:"Fresh mozzarella, feta cheese, red onion, bacon.",
    tags:[], art:{ base:"bianca", top:[["--i-mozz",7,12,"blob"],["--i-blu",6,8,"crumb"],["--i-radic",7,8,"shred"],["--i-salame",6,9,"shred"]] } },

  /* ── VEGGIEs ── */
  { id:"carciofi", order:100, cat:"veggies", star:1, name:"Carciofi",
    ing:"Tomato base, fresh mozzarella, artichoke, mushrooms, kalamata olives.",
    tags:["vegetarian"], art:{ base:"rosso", top:[["--i-mozz",5,11,"blob"],["--i-verde",7,11,"leaf"],["--i-fungo",7,8,"disc"]] } },
  { id:"bianca", order:120, cat:"veggies", star:0, name:"Bianca",
    ing:"Fresh mozzarella, goat cheese, mushrooms, red onion.",
    tags:["vegetarian"], art:{ base:"bianca", top:[["--i-mozz",8,13,"blob"],["--i-fungo",8,8,"disc"],["--i-radic",6,8,"shred"]] } },
  { id:"spicyhoney", order:140, cat:"veggies", star:0, name:"Spicy-Honey",
    ing:"Fresh mozzarella, ricotta, chili flakes, honey, dried oregano.",
    tags:["vegetarian","spicy","no tomato"], art:{ base:"bianca", top:[["--i-mozz",8,13,"blob"],["--i-rosso",14,4,"crumb"],["--i-giallo",9,5,"crumb"]] } },
  { id:"sundried", order:150, cat:"veggies", star:0, name:"Sundried Tomatoes",
    ing:"Fresh mozzarella, ricotta, dried tomatoes, basil sauce, pine nuts.",
    tags:["vegetarian","no tomato"], art:{ base:"bianca", top:[["--i-mozz",7,12,"blob"],["--i-radic",8,8,"blob"],["--i-noce",9,5,"crumb"],["--i-verde",7,6,"crumb"]] } }
];

const FAMILIES = [
  { id:"all", label:"Full menu" }, { id:"traditionals", label:"Traditionals" },
  { id:"meats", label:"Meats" }, { id:"veggies", label:"Veggies" }
];

/* Gallery fallbacks show behind-the-scenes scenes, not menu pizzas. */
const FALLBACK_GALLERY = [
  { id:"f-oven", wide:true, scene:"forno", caption:"The oven before service" },
  { id:"f-mise", scene:"mise", caption:"Prep table before service" }
];

/* ══════════════════════════════════════════════════════════════
   2 · STATE
   ══════════════════════════════════════════════════════════════ */

const state = {
  brand:   { ...DEFAULT_BRAND },
  contact: { ...DEFAULT_CONTACT },
  palette: { light: { ...PRESETS.dipizza.light } },
  menu:    DEFAULT_MENU.map(p => ({ ...p, tags:[...p.tags] })),
  photos:  {},        /* logo | hero | story | pizza-<id>  →  data URL */
  gallery: [],        /* uploaded pieces: { id, order, caption, dataUrl } */
  filter:  "all",
  editTheme: "light"
};

let db = null, canEdit = false, seeding = false;

const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
const headline = str => esc(str).split("|").join("<br>").replace(/\{([^}]*)\}/g, "<em>$1</em>");
const $ = id => document.getElementById(id);

/* ══════════════════════════════════════════════════════════════
   3 · DRAWN PIZZAS — used until a real photo replaces them
   ══════════════════════════════════════════════════════════════ */

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let s = seed || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const BASES = { rosso:"--i-rosso", bianca:"--i-bianca", verde:"--i-verde", giallo:"--i-giallo" };

function wobbly(cx, cy, r, amp, rand) {
  const pts = [];
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2;
    const rr = r + Math.sin(a * 3 + rand() * .4) * amp + (rand() - .5) * amp * .8;
    pts.push((cx + Math.cos(a) * rr).toFixed(1) + " " + (cy + Math.sin(a) * rr).toFixed(1));
  }
  return "M" + pts.join("L") + "Z";
}
function topping(shape, x, y, size, color, rot) {
  const c = "var(" + color + ")";
  if (shape === "leaf")  return `<ellipse cx="${x}" cy="${y}" rx="${size*.62}" ry="${size*.3}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
  if (shape === "shred") return `<rect x="${x-size*.7}" y="${y-size*.16}" width="${size*1.4}" height="${size*.32}" rx="${size*.16}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
  if (shape === "disc")  return `<circle cx="${x}" cy="${y}" r="${size*.5}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${size*.5}" fill="none" stroke="var(--i-char)" stroke-opacity=".18" stroke-width="1"/>`;
  if (shape === "crumb") return `<circle cx="${x}" cy="${y}" r="${size*.5}" fill="${c}"/>`;
  return `<ellipse cx="${x}" cy="${y}" rx="${size*.54}" ry="${size*.44}" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
}
function pizzaSVG(item) {
  const art = item.art || { base:"rosso", top:[["--i-mozz",7,13,"blob"],["--i-basil",5,9,"leaf"]] };
  const rand = rng(seedFrom(item.id + (art.base || "")));
  const out = [];
  out.push(`<path d="${wobbly(100,100,92,3.2,rand)}" fill="var(--i-crust)" stroke="var(--i-char)" stroke-opacity=".35" stroke-width="1.2"/>`);
  out.push(`<path d="${wobbly(100,100,84,2.4,rand)}" fill="var(--i-crust2)" opacity=".55"/>`);
  for (let i = 0; i < 11; i++) {
    const a = rand() * Math.PI * 2, r = 84 + rand() * 5;
    const x = (100 + Math.cos(a) * r).toFixed(1), y = (100 + Math.sin(a) * r).toFixed(1);
    out.push(`<ellipse cx="${x}" cy="${y}" rx="${(3+rand()*3).toFixed(1)}" ry="${(2+rand()*2).toFixed(1)}" fill="var(--i-char)" opacity="${(.28+rand()*.3).toFixed(2)}" transform="rotate(${(a*57).toFixed(0)} ${x} ${y})"/>`);
  }
  out.push(`<path d="${wobbly(100,100,74,2.6,rand)}" fill="var(${BASES[art.base] || BASES.rosso})"/>`);
  if (art.base === "rosso" || art.base === "giallo") out.push(`<path d="${wobbly(100,100,68,3.4,rand)}" fill="var(--i-char)" opacity=".07"/>`);
  for (const [color, count, size, shape] of (art.top || [])) {
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 62;
      out.push(topping(shape, (100 + Math.cos(a) * r).toFixed(1), (100 + Math.sin(a) * r).toFixed(1), size, color, (rand() * 360).toFixed(0)));
    }
  }
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(item.name)}">${out.join("")}</svg>`;
}

function ovenSVG() {
  return `<svg viewBox="0 0 420 400" role="img" aria-label="Neapolitan wood-fired dome oven, lit">
    <defs>
      <radialGradient id="fuoco" cx="50%" cy="72%" r="62%">
        <stop offset="0%" stop-color="var(--warm)"/><stop offset="55%" stop-color="var(--i-giallo)"/><stop offset="100%" stop-color="var(--i-rosso)"/>
      </radialGradient>
    </defs>
    <rect x="52" y="318" width="316" height="16" rx="6" fill="var(--surface-2)" stroke="var(--line-strong)" stroke-width="1.2"/>
    <rect x="76" y="334" width="268" height="46" rx="8" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="1.2"/>
    <path d="M110 380v-46M210 380v-46M310 380v-46" stroke="var(--line)" stroke-width="1"/>
    <path d="M62 318A148 148 0 0 1 358 318Z" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/>
    <path d="M96 318A114 114 0 0 1 324 318" fill="none" stroke="var(--line)" stroke-width="1"/>
    <path d="M130 318A80 80 0 0 1 290 318" fill="none" stroke="var(--line)" stroke-width="1"/>
    <path d="M164 318A46 46 0 0 1 256 318" fill="none" stroke="var(--line)" stroke-width="1"/>
    <path d="M210 170v148M155 180l38 138M265 180l-38 138" stroke="var(--line)" stroke-width="1"/>
    <rect x="292" y="118" width="26" height="72" rx="5" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.4"/>
    <rect x="286" y="106" width="38" height="14" rx="6" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/>
    <path d="M158 318A52 52 0 0 1 262 318Z" fill="var(--ink)"/>
    <g class="ember">
      <path d="M166 318A44 44 0 0 1 254 318Z" fill="url(#fuoco)" opacity=".92"/>
      <path d="M196 318c-10-14 4-22 2-34 14 10 22 4 20 22 8-6 12 2 10 12Z" fill="var(--warm)" opacity=".95"/>
    </g>
    <path d="M152 318A58 58 0 0 1 268 318" fill="none" stroke="var(--ink)" stroke-width="1.6"/>
    <line x1="360" y1="96" x2="330" y2="300" stroke="var(--i-wood)" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="327" cy="308" rx="21" ry="15" fill="var(--i-metal)" stroke="var(--ink)" stroke-width="1.2"/>
    <rect x="86" y="342" width="52" height="10" rx="5" fill="var(--i-wood)" stroke="var(--ink)" stroke-width="1"/>
    <rect x="94" y="357" width="52" height="10" rx="5" fill="var(--i-wood)" stroke="var(--ink)" stroke-width="1"/>
  </svg>`;
}

function sceneSVG(kind) {
  if (kind === "mise") {
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Mise en place on marble">
      <rect width="400" height="400" fill="var(--i-marble)"/>
      <path d="M0 90q120 26 240-6t160 18M0 300q140-30 250 4t150-12" fill="none" stroke="var(--line)" stroke-width="1"/>
      <line x1="40" y1="352" x2="360" y2="60" stroke="var(--i-wood)" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="352" cy="66" rx="28" ry="20" fill="var(--i-metal)" stroke="var(--ink)" stroke-width="1.2" transform="rotate(-42 352 66)"/>
      <circle cx="120" cy="150" r="46" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><circle cx="120" cy="150" r="34" fill="var(--i-rosso)"/>
      <circle cx="238" cy="196" r="40" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><circle cx="238" cy="196" r="29" fill="var(--i-mozz)"/>
      <circle cx="150" cy="268" r="36" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><circle cx="150" cy="268" r="26" fill="var(--i-basil)"/>
      <circle cx="292" cy="300" r="30" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><circle cx="292" cy="300" r="21" fill="var(--i-giallo)"/>
      <g fill="var(--surface)" opacity=".85">
        <circle cx="72" cy="230" r="3"/><circle cx="196" cy="120" r="2.4"/><circle cx="300" cy="150" r="3.2"/><circle cx="88" cy="318" r="2.6"/>
        <circle cx="212" cy="332" r="3"/><circle cx="336" cy="238" r="2.2"/><circle cx="60" cy="120" r="2.4"/><circle cx="258" cy="90" r="2.8"/>
      </g>
    </svg>`;
  }
  return `<svg viewBox="0 0 400 400" role="img" aria-label="The oven set up in a cloister">
    <rect width="400" height="400" fill="var(--i-marble)"/>
    <line x1="0" y1="300" x2="400" y2="300" stroke="var(--line-strong)" stroke-width="1"/>
    <path d="M40 300v-90M120 300v-120M280 300v-120M360 300v-90" stroke="var(--line)" stroke-width="1"/>
    <path d="M40 210A40 40 0 0 1 120 210M280 210A40 40 0 0 1 360 210" fill="none" stroke="var(--line)" stroke-width="1"/>
    <rect x="130" y="262" width="140" height="14" rx="5" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.2"/>
    <rect x="146" y="276" width="108" height="26" rx="6" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.2"/>
    <path d="M136 262A64 64 0 0 1 264 262Z" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/>
    <path d="M158 262A42 42 0 0 1 242 262" fill="none" stroke="var(--line)" stroke-width="1"/>
    <rect x="238" y="180" width="14" height="34" rx="4" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.2"/>
    <path d="M178 262A22 22 0 0 1 222 262Z" fill="var(--ink)"/>
    <path d="M182 262A18 18 0 0 1 218 262Z" fill="var(--warm)" opacity=".92" class="ember"/>
    <ellipse cx="200" cy="330" rx="120" ry="10" fill="var(--ink)" opacity=".05"/>
    <circle cx="70" cy="330" r="9" fill="none" stroke="var(--line-strong)" stroke-width="1.2"/>
    <circle cx="96" cy="336" r="9" fill="none" stroke="var(--line-strong)" stroke-width="1.2"/>
    <circle cx="316" cy="332" r="9" fill="none" stroke="var(--line-strong)" stroke-width="1.2"/>
  </svg>`;
}

/* ══════════════════════════════════════════════════════════════
   4 · RENDER
   ══════════════════════════════════════════════════════════════ */

function markHTML() {
  if (state.photos.logo) return `<img src="${state.photos.logo}" alt="${esc(state.brand.name)}">`;
  const s = state.brand.script ? `<span class="script">${esc(state.brand.script)}</span>` : "";
  return s + "<span>" + esc(state.brand.name) + "</span>";
}

function renderPalette() {
  const css = t => TOKEN_LABELS.map(([k]) => `--${k}:${state.palette[t][k]};`).join("");
  let sheet = $("paletteOverride");
  if (!sheet) { sheet = document.createElement("style"); sheet.id = "paletteOverride"; document.head.appendChild(sheet); }
  sheet.textContent = `:root{${css("light")}}`;
}

function renderBrand() {
  const b = state.brand;
  document.title = b.name;
  $("navMark").innerHTML = markHTML();
  $("footMark").innerHTML = markHTML();
  $("heroBadge").textContent = b.badge;
  $("heroTitle").innerHTML = headline(b.headline);
  $("heroLede").textContent = b.lede;
  $("storyTitle").textContent = b.storyTitle;
  $("storyText").textContent = b.storyText;
  $("followHandle").textContent = b.handle;
  $("followLink").href = b.instagram || "#";
  $("footTag").textContent = b.tagline;
  $("heroShot").innerHTML = state.photos.hero
    ? `<img src="${state.photos.hero}" alt="${esc(b.name)}">` : ovenSVG();
  $("storyShot").innerHTML = state.photos.story
    ? `<img src="${state.photos.story}" alt="" loading="lazy" decoding="async">` : sceneSVG("mise");
}

function renderInfo() {
  const c = state.contact;
  $("info").innerHTML = `
    <div class="info-item"><dt>Notice</dt><dd>${esc(c.notice)}</dd></div>
    <div class="info-item"><dt>Coverage</dt><dd>${esc(c.coverage)}</dd></div>
    <div class="info-item"><dt>Payment</dt><dd>${esc(c.payment)}</dd></div>
    <div class="info-item"><dt>Reach us</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a><br><a href="tel:${esc(c.phone.replace(/[^\d+]/g,""))}">${esc(c.phone)}</a><br><a href="https://wa.me/14849547273" target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a><br>${esc(c.hours)}</dd></div>`;
  $("footContact").textContent = c.email + " · " + c.phone;
}

const TAG_CLASS = { spicy:"tag tag-hot", vegetarian:"tag tag-veg", vegan:"tag tag-veg" };
const tagsHTML = p => p.tags.map(t => `<span class="${TAG_CLASS[t] || "tag"}">${esc(t)}</span>`).join("");

function pizzaArt(p) {
  const photo = state.photos["pizza-" + p.id];
  return photo ? `<img src="${photo}" alt="${esc(p.name)}" loading="lazy" decoding="async">` : pizzaSVG(p);
}

function renderSignature() {
  const stars = state.menu.filter(p => p.star).slice(0, 4);
  const list = stars.length ? stars : state.menu.slice(0, 4);
  $("signatureCards").innerHTML = list.map(p => `
    <article class="card">
      <div class="card-art" data-pid="${p.id}" role="button" tabindex="0" aria-label="Enlarge ${esc(p.name)}">${pizzaArt(p)}</div>
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.ing)}</p>
        <div class="card-tags">${tagsHTML(p)}</div>
      </div>
    </article>`).join("");
}

function renderMenu() {
  const list = state.filter === "all" ? state.menu : state.menu.filter(p => p.cat === state.filter);
  $("menuList").innerHTML = list.map(p => {
    const body = `<div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.ing)}</p>
        <div class="card-tags">${tagsHTML(p)}</div>
      </div>`;
    /* Sin foto todavia: ficha de texto en vez de un hueco con un dibujo */
    if (!state.photos["pizza-" + p.id]) {
      return `<article class="dish dish-plain">${body}</article>`;
    }
    return `<article class="dish">
      <div class="dish-art" data-pid="${p.id}" role="button" tabindex="0" aria-label="Enlarge ${esc(p.name)}">${pizzaArt(p)}</div>
      ${body}
    </article>`;
  }).join("") || `<article class="dish dish-plain"><div><p>No pizzas in this family yet.</p></div></article>`;
  $("filters").innerHTML = FAMILIES.map(f =>
    `<button class="chip" data-cat="${f.id}" aria-pressed="${state.filter === f.id}">${f.label}</button>`).join("");
}

/* The gallery shows uploaded photos once there are any, and the
   drawn fallback set until then. */
function galleryPieces() {
  if (state.gallery.length) return state.gallery.map(g => ({ ...g, photo: g.dataUrl }));
  return FALLBACK_GALLERY;
}
function pieceArt(g) {
  if (g.photo) return `<img src="${g.photo}" alt="${esc(g.caption)}" loading="lazy" decoding="async">`;
  if (g.pizza) {
    const p = state.menu.find(x => x.id === g.pizza);
    return p ? pizzaArt(p) : sceneSVG("forno");
  }
  return sceneSVG(g.scene);
}
function renderGallery() {
  $("galGrid").innerHTML = galleryPieces().map((g, i) =>
    `<button class="tile${g.wide ? " wide" : ""}" data-i="${i}" aria-label="Enlarge: ${esc(g.caption)}">
       ${pieceArt(g)}<span class="tile-cap">${esc(g.caption)}</span>
     </button>`).join("");
}

function renderAll() {
  renderPalette(); renderBrand(); renderInfo();
  renderGallery();
}

const menuFilters=$("filters");
if(menuFilters)menuFilters.addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  state.filter = b.dataset.cat;
  renderMenu();
});

/* ── lightbox ─────────────────────────────────────────────── */
/* ── caja de luz ─────────────────────────────────────────────────────
   Gobernada por una lista de piezas, asi que sirve igual para la
   galeria y para las fotos del menu. */
const lb = $("lb");
let lbItems = [], lbIdx = 0, lastFocus = null;

function lbShow(i) {
  if (!lbItems.length) return;
  lbIdx = (i + lbItems.length) % lbItems.length;
  $("lbStage").innerHTML = lbItems[lbIdx].html;
  $("lbCap").textContent = lbItems[lbIdx].caption;
  const many = lbItems.length > 1;
  $("lbPrev").hidden = $("lbNext").hidden = !many;
}
function lbOpen(items, i) {
  lbItems = items;
  lastFocus = document.activeElement;
  lbShow(i);
  lb.hidden = false;
  $("lbClose").focus();
}
function lbClose() { lb.hidden = true; if (lastFocus) lastFocus.focus(); }

const galleryItems = () =>
  galleryPieces().map(g => ({ html: pieceArt(g), caption: g.caption }));
const menuItems = () =>
  state.menu.map(p => ({ html: pizzaArt(p), caption: p.name + " — " + p.ing }));

$("galGrid").addEventListener("click", e => {
  const t = e.target.closest(".tile");
  if (t) lbOpen(galleryItems(), Number(t.dataset.i));
});

/* Cualquier foto de pizza abre la caja de luz y navega por la carta */
document.addEventListener("click", e => {
  const z = e.target.closest("[data-pid]");
  if (!z) return;
  const i = state.menu.findIndex(p => p.id === z.dataset.pid);
  if (i >= 0) lbOpen(menuItems(), i);
});
$("lbClose").addEventListener("click", lbClose);
$("lbPrev").addEventListener("click", () => lbShow(lbIdx - 1));
$("lbNext").addEventListener("click", () => lbShow(lbIdx + 1));
lb.addEventListener("click", e => { if (e.target === lb) lbClose(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") lbClose();
  if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
  if (e.key === "ArrowRight") lbShow(lbIdx + 1);
});

/* ── enquiry form ─────────────────────────────────────────────────
   Todo el envio pasa por la Edge Function de Supabase. El navegador
   solo aporta los datos del evento: el destinatario, el asunto y el
   acuse al cliente son constantes del servidor, asi que nadie puede
   usar este formulario para mandar correo a terceros.

   Antes de aceptar una solicitud el servidor exige un reto firmado
   que esta pagina pide al tocar el formulario y resuelve mientras el
   cliente escribe. Un robot que solo haga POST no lo tiene. */

const SUPABASE_URL  = "https://cdauxkkksubujtzxouwo.supabase.co";
const SUPABASE_ANON = "sb_publishable_xggqWkbnIc7hNZF0G66eAw_DuKltCqY";

/* Pega aqui la clave publica del widget de Cloudflare Turnstile para
   activar la verificacion antirrobot visible. Vacio = desactivada. */
const TURNSTILE_KEY = "";

const enquiryForm = $("form");
const formError = $("formError");

/* ── reto firmado + prueba de trabajo ───────────────────────────── */

const bytesToHex = buf =>
  [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return bytesToHex(digest);
}

/* Cuenta los bits en cero por delante del hash, que es lo que mide la
   dificultad que pide el servidor. */
function leadingZeroBits(hex) {
  let bits = 0;
  for (const ch of hex) {
    const nibble = parseInt(ch, 16);
    if (nibble === 0) { bits += 4; continue; }
    bits += Math.clz32(nibble) - 28;
    break;
  }
  return bits;
}

async function solveChallenge(token, difficulty) {
  for (let nonce = 0; nonce < 20000000; nonce++) {
    const hash = await sha256Hex(token + "." + nonce);
    if (leadingZeroBits(hash) >= difficulty) return String(nonce);
  }
  throw new Error("challenge_unsolved");
}

/* Se pide en cuanto el cliente toca el formulario y se resuelve de
   fondo, de modo que al pulsar Enviar ya este listo. */
let challengePromise = null;

function requestChallenge() {
  if (challengePromise) return challengePromise;
  challengePromise = (async () => {
    const res = await fetch(SUPABASE_URL + "/functions/v1/enquiry?challenge=1", {
      headers: { "Authorization": "Bearer " + SUPABASE_ANON, "apikey": SUPABASE_ANON }
    });
    if (!res.ok) throw new Error("challenge_unavailable");
    const { token, difficulty } = await res.json();
    if (!token) throw new Error("challenge_unavailable");
    return { token, nonce: await solveChallenge(token, difficulty || 12) };
  })();
  challengePromise.catch(() => { challengePromise = null; });
  return challengePromise;
}

enquiryForm.addEventListener("focusin", requestChallenge, { once: true });

/* ── Turnstile ──────────────────────────────────────────────────── */

if (TURNSTILE_KEY) {
  const box = $("turnstile");
  box.hidden = false;
  box.className = "field cf-turnstile";
  box.dataset.sitekey = TURNSTILE_KEY;
  box.dataset.theme = "dark";
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  s.async = true; s.defer = true;
  document.head.appendChild(s);
}

const turnstileToken = () =>
  document.querySelector('[name="cf-turnstile-response"]')?.value || "";

/* ── envio ──────────────────────────────────────────────────────── */

async function sendEnquiry(fields) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(SUPABASE_URL + "/functions/v1/enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + SUPABASE_ANON,
        "apikey": SUPABASE_ANON
      },
      body: JSON.stringify(fields),
      signal: controller.signal
    });
    const result = await res.json().catch(() => ({}));
    return { status: res.status, ...result };
  } finally {
    clearTimeout(timeout);
  }
}

function showEnquiryReceipt(state) {
  const receipt = document.createElement("div");
  receipt.className = "sent";
  receipt.setAttribute("role", "status");
  if (state.emailed) {
    receipt.innerHTML = `<h3>Thanks — we’ve received your enquiry.</h3>
      <p style="font-size:.9375rem;color:var(--ink-2)">A confirmation email is on its way, and the DiPizza team has your event details. We'll reply the same business day. If you don't see the email, check your spam folder.</p>`;
  } else {
    receipt.innerHTML = `<h3>Thanks — your details are with us.</h3>
      <p style="font-size:.9375rem;color:var(--ink-2)">Your enquiry is saved and the team will see it, but we couldn't send the confirmation email just now. If you'd like a faster reply, contact DiPizza directly at <a href="mailto:dipizza00@gmail.com">dipizza00@gmail.com</a> or call (484) 954-7273.</p>`;
  }
  enquiryForm.replaceWith(receipt);
}

const ERRORS = {
  rate_limited: "You've sent several enquiries already. Please email dipizza00@gmail.com and we'll pick it up from there.",
  busy: "We're receiving a lot of enquiries right now. Please try again in a few minutes or email dipizza00@gmail.com.",
  challenge_failed: "We couldn't verify this form. Reload the page and try once more.",
  too_fast: "That was submitted faster than the form can be filled in. Please try again.",
  turnstile_failed: "The anti-robot check didn't pass. Tick it again and resend.",
  missing_fields: "Please add your name and a valid email address.",
};

enquiryForm.addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  if (!f.reportValidity()) return;

  const button = f.querySelector('button[type="submit"]');
  const original = button.textContent;
  button.disabled = true;
  formError.hidden = true;

  try {
    button.textContent = "Verifying…";
    const challenge = await requestChallenge();

    button.textContent = "Sending…";
    const d = new FormData(f);
    const fields = Object.fromEntries(d.entries());
    const payload = {
      ...fields,
      website: fields._honey || "",
      challenge: challenge.token,
      nonce: challenge.nonce,
      turnstile: turnstileToken()
    };

    let result = await sendEnquiry(payload);

    /* El servidor exige unos segundos entre pedir el reto y enviarlo,
       porque un robot no espera. Si alguien rellena el formulario mas
       rapido que eso, esperamos por el y reenviamos una sola vez: el
       reto todavia no se ha gastado, se rechazo antes de registrarlo. */
    if (result.error === "too_fast") {
      await new Promise(r => setTimeout(r, 3500));
      result = await sendEnquiry(payload);
    }

    if (result.ok) { showEnquiryReceipt(result); return; }

    challengePromise = null;
    formError.textContent = ERRORS[result.error] || ERRORS.challenge_failed;
    formError.hidden = false;
  } catch (err) {
    challengePromise = null;
    formError.textContent =
      "We couldn't reach our servers. Please email dipizza00@gmail.com or call (484) 954-7273.";
    formError.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
});

/* ══════════════════════════════════════════════════════════════
   5 · ASSISTANT
   ══════════════════════════════════════════════════════════════ */

const REPLIES = [
  { k:["price","prices","cost","how much","quote","budget","rate","expensive"],
    t:"Send us your event date, venue and guest count through the enquiry form. Our team will follow up with a tailored proposal.",
    a:["Start an enquiry", "#enquiry"] },
  { k:["minimum","maximum","how many","guests","people","headcount","pax","capacity"],
    t:"Tell us how many guests you expect and our team will help plan your event." },
  { k:["gluten","celiac","coeliac","intolerance","intolerant"],
    t:"Tell us about any dietary needs in your enquiry and the team will confirm what we can arrange." },
  { k:["vegan","vegetarian","diet","allergy","allergen","halal","kosher","dairy","nut"],
    t:"Tell us about dietary needs and pizza preferences in your enquiry, and the team will confirm what we can arrange.",
    a:["Start an enquiry", "#enquiry"] },
  { k:["space","set up","setup","install","power","electricity","metres","meters","indoor","smoke","terrace","water"],
    t:"Share the venue details in your enquiry and our team will confirm the arrangements for your event.",
    a:["Start an enquiry", "#enquiry"] },
  { k:["where","travel","area","coverage","distance","km","miles","far","location"],
    t:"We serve events in Augusta, Georgia. Send us the venue address and we will confirm availability." },
  { k:["invoice","vat","company","tax","institution","insurance","payment","terms","30 day","purchase order","deposit"],
    t:"We can provide the paperwork your company or venue needs. Include those details in your enquiry and we will follow up.",
    a:["Start an enquiry", "#enquiry"] },
  { k:["date","availability","available","book","booking","calendar","free","when","notice"],
    t:"Send us your preferred date and we will confirm availability.",
    a:["Check a date", "#enquiry"] },
  { k:["menu","pizza","pizzas","card","kinds","types","which","options","food"],
    t:"Tell us which pizzas you have in mind in the enquiry form. The team can confirm ingredients and dietary options.",
    a:["Start an enquiry", "#enquiry"] },
  { k:["favourite","favorite","popular","recommend","best","suggest"],
    t:"Share what you and your guests enjoy in the enquiry form, and the team can suggest options for your event.",
    a:["Start an enquiry", "#enquiry"] },
  { k:["photo","photos","gallery","pictures","see","look","instagram","follow"],
    t:"The gallery shows moments from events and behind the scenes. The menu has the individual pizzas.",
    a:["Open the gallery", "#gallery"] },
  { k:["human","person","speak","call","phone","email","contact","talk","someone","whatsapp"],
    t:"Gladly. Our email and phone are in the booking information below, or leave your details and the team will get back to you.",
    a:["Leave your details", "#enquiry"] },
  { k:["hi","hello","hey","good morning","good afternoon","greetings","ciao"],
    t:"Hello. I can help with the menu, dietary information, location and your event enquiry. For a quote or venue details, send us a message through the form." },
  { k:["thanks","thank you","great","perfect","cheers"],
    t:"My pleasure. If you like, I can pass your enquiry to the events team.",
    a:["Go to the form", "#enquiry"] }
];

const FALLBACK = {
  t:"I don't have an answer for that yet. Send your event details through the enquiry form and the team will help.",
  a:["Write to the team", "#enquiry"]
};

const CHIPS = ["Get a quote", "Dietary options?", "Where do you travel?", "Check a date", "Can you invoice a company?"];

const chat = $("chat"), chatBtn = $("chatBtn"), chatLog = $("chatLog");
let greeted = false;

function push(text, who, action) {
  const el = document.createElement("div");
  el.className = "msg msg-" + who;
  el.textContent = text;
  if (action) {
    const b = document.createElement("button");
    b.className = "msg-act"; b.type = "button"; b.textContent = action[0];
    b.addEventListener("click", () => {
      document.querySelector(action[1]).scrollIntoView({ behavior:"smooth", block:"start" });
      toggleChat(false);
    });
    el.appendChild(document.createElement("br"));
    el.appendChild(b);
  }
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function answer(q) {
  const n = q.toLowerCase();
  let best = null, score = 0;
  for (const r of REPLIES) {
    let s = 0;
    for (const k of r.k) if (n.includes(k)) s += k.length;
    if (s > score) { score = s; best = r; }
  }
  return best || FALLBACK;
}
function ask(q) { push(q, "me"); const r = answer(q); setTimeout(() => push(r.t, "bot", r.a), 420); }
function toggleChat(open) {
  chat.hidden = !open;
  chatBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    if (!greeted) {
      greeted = true;
      push("Hello — the assistant for " + state.brand.name + ". I can help with the menu, dietary information, location and your event enquiry. For a quote or venue details, send us a message through the form.", "bot");
    }
    $("chatInput").focus();
  } else { chatBtn.focus(); }
}
chatBtn.addEventListener("click", () => toggleChat(chat.hidden));
$("chatForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("chatInput").value.trim();
  if (!v) return;
  $("chatInput").value = "";
  if (v.toLowerCase().replace(/\s+/g, " ") === "open door") {
    window.location.href = "admin.html";
    return;
  }
  ask(v);
});
$("chatChips").innerHTML = CHIPS.map(c => `<button type="button">${c}</button>`).join("");
$("chatChips").addEventListener("click", e => { if (e.target.tagName === "BUTTON") ask(e.target.textContent); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !chat.hidden) toggleChat(false); });

const PHOTOS = {
  "logo": "images/logo-paddle-crisp.png",
  "hero": "images/Galeria/hero.jpg?v=gallery20261028",
  "story": "images/Galeria/1.jpg?v=gallery20261028",
  "pizza-spicyhoney": "images/pizza-spicyhoney.jpg?v=364212c",
  "pizza-pepperoni": "images/pizza-pepperoni.jpg?v=364212c",
  "pizza-margherita": "images/pizza-margherita.jpg?v=364212c",
  "pizza-prosciutto": "images/pizza-prosciutto.jpg?v=364212c",
  "pizza-carciofi": "images/pizza-carciofi-new.jpg?v=20261102",
  "pizza-hamcheese": "images/pizza-hamcheese.jpg?v=20261102",
  "pizza-hawaiian": "images/pizza-hawaiian.jpg?v=20261102",
  "pizza-bianca": "images/pizza-bianca.jpg?v=364212c",
  "pizza-salami": "images/pizza-salami.jpg?v=364212c",
  "pizza-napoletana": "images/pizza-napoletana.jpg?v=364212c",
  "pizza-garlicbread": "images/pizza-garlicbread.jpg?v=364212c",
  "pizza-pancetta": "images/pizza-pancetta-new.jpg?v=20261102",
  "pizza-sundried": "images/pizza-sundried.jpg?v=20261102"
};

const GALLERY = [
  { "id": "prep-dough", "order": 10, "caption": "Preparing dough and sauce at the prep table", "dataUrl": "images/Galeria/gal-03.jpg?v=gallery20261028" },
  { "id": "prep-hero", "order": 20, "caption": "Preparing fresh dough and sauce on site", "dataUrl": "images/Galeria/hero.jpg?v=gallery20261028" },
  { "id": "event-13", "order": 30, "caption": "The pizza station among the trees", "dataUrl": "images/Galeria/event-13.jpg?v=20261102" },
  { "id": "event-02", "order": 40, "caption": "The DiPizza stand ready for guests", "dataUrl": "images/Galeria/event-02.jpg?v=20261102" },
  { "id": "event-03", "order": 50, "caption": "Guests enjoying an outdoor event", "dataUrl": "images/Galeria/event-03.jpg?v=20261102" },
  { "id": "event-04", "order": 60, "caption": "Wood-fired pizza setup under the canopy", "dataUrl": "images/Galeria/event-04.jpg?v=20261102" },
  { "id": "event-14", "order": 70, "caption": "The DiPizza team preparing pizzas for guests", "dataUrl": "images/Galeria/event-14.jpg?v=20261102" },
  { "id": "event-05", "order": 80, "caption": "Outdoor catering station ready for service", "dataUrl": "images/Galeria/event-05.jpg?v=20261102" },
  { "id": "event-12", "order": 90, "caption": "Outdoor pizza setup ready for guests", "dataUrl": "images/Galeria/event-12.jpg?v=20261102" },
  { "id": "event-07", "order": 100, "caption": "DiPizza catering at an outdoor patio", "dataUrl": "images/Galeria/event-07.jpg?v=20261102" },
  { "id": "event-08", "order": 110, "caption": "Pizza catering at a covered outdoor venue", "dataUrl": "images/Galeria/event-08.jpg?v=20261102" },
  { "id": "event-09", "order": 120, "caption": "Fresh pizzas ready for guests", "dataUrl": "images/Galeria/event-09.jpg?v=20261102" },
  { "id": "event-served", "order": 130, "caption": "Serving wood-fired pizza to guests", "dataUrl": "images/Galeria/event-served.jpg?v=20261102" },
];

/* ══════════════════════════════════════════════════════════════
   6 · ARRANQUE
   Las fotos son archivos en images/. Para cambiar el menu, los
   textos o los colores, edita los bloques DEFAULT_* de arriba.
   ══════════════════════════════════════════════════════════════ */

state.photos = PHOTOS;
state.gallery = GALLERY;
renderAll();


document.documentElement.style.scrollBehavior = "smooth";

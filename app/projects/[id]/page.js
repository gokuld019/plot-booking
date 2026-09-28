"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  Home,
  Ruler,
  Compass,
  Route,
  Building2,
  Heart,
  X,
  Check,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  TreePine,
  Droplets,
  Lightbulb,
  Wrench,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  Filter,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Star,
  Award,
  MessageCircle,
  Eye,
  Grid3x3,
  List,
  Layers,
  Circle,
  Square,
  Tag,
  Share2,
  Crosshair,
} from "lucide-react";
import Shell from "@/components/Shell";


/* ───────────────────────────── Config ──────────────────────────────── */

const API_BASE = "https://api.crazystory.in/api/customer";

// Map view limits
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 4;
const EASE = "transform .35s cubic-bezier(.2,.8,.2,1)";

/* ───────────────────────────── SVG layout files ─────────────────────────
   The SVG files live in the FRONTEND public folder:

        public/layouts/firstlayout.svg    → Green Valley
        public/layouts/secondlayout.svg   → other project

   The BACKEND only stores / sends the file name, e.g.
        "project": { "name": "Green Valley", "layout_svg": "firstlayout.svg" }

   The frontend turns that into "/layouts/firstlayout.svg" and loads it.
   If the backend sends nothing, PROJECT_LAYOUTS below is used as a fallback.

   Inside the SVG, every plot must be one shape (polygon / path / rect …) or
   a <g> whose id is:

        Plot-<PLOT NUMBER>      e.g.  Plot-2C   Plot-14   Plot-A-3

   (Illustrator's duplicate suffix "_1" is ignored: Plot-2C_1 → 2C.)
   To use your own ids, put a data-plot="2C" attribute on the element instead.

   A plot is linked to a database plot by:
     1) the plot's svg_id / layout_id / plot_code from the API, else
     2) its plot number (plot_number "PLOT-2C" → 2C).
   Everything else in the file (roads, labels, dimensions, north arrow…) is
   drawn exactly as uploaded.

   Testing tip: add ?layout=secondlayout.svg to the page URL to preview a file.
──────────────────────────────────────────────────────────────────────── */

// Folder inside /public that holds the layout files
const LAYOUT_DIR = "/layouts";

// Frontend fallback: which file each project uses if the backend sends nothing.
// Numeric keys = project id (exact). Text keys = project name / slug (contains).
const PROJECT_LAYOUTS = {
  "1": "fisrtlayout.svg",              // /projects/1
  "2": "alankars.svg",   // also matches "Green Valley Township"
  // "2": "secondlayout.svg",
};

const SVG_NS = "http://www.w3.org/2000/svg";
const SHAPE_SEL = "polygon,path,rect,polyline,circle,ellipse";
const UPRIGHT_MAX_CHARS = 12; // short texts (plot names, dimensions) stay upright when the map is rotated

// Plot names on the map:
//   "auto" → draw a name only if the file doesn't already print one (recommended)
//   "file" → never draw names, the SVG always has them (use if names are outlined shapes)
//   "app"  → always draw names (use when the SVG has no names)
const PLOT_NAMES = "file"; // your SVG already prints plot names (as outlined shapes)

const INK = "#231f20";
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function normKey(v) {
  return String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Local mapping: project → layout file name in public/layouts
function layoutForProject(project, id) {
  const norm = (k) => String(k).toLowerCase().trim().replace(/[-_]+/g, " ");

  // 1) exact match on project id
  if (id != null && PROJECT_LAYOUTS[norm(id)]) return PROJECT_LAYOUTS[norm(id)];

  // 2) project name / slug contains a key ("green valley township" contains "green valley")
  const names = [project?.slug, project?.title, project?.name].filter(Boolean).map(norm);
  for (const [key, file] of Object.entries(PROJECT_LAYOUTS)) {
    if (/^\d+$/.test(key)) continue; // numeric keys are ids only
    if (names.some((n) => n === key || n.includes(key))) return file;
  }
  return null;
}

// Backend sends only a file name ("firstlayout.svg" or "/layouts/firstlayout.svg").
// We keep just the file name so paths like "../" can't escape the layouts folder.
function resolveLayoutUrl(source) {
  if (/^https?:\/\//i.test(source)) return source; // full URLs still work
  const file = source.split(/[\\/]/).pop();
  if (!/^[\w.-]+\.svg$/i.test(file)) {
    throw new Error(`Invalid layout file name: "${source}"`);
  }
  return `${LAYOUT_DIR}/${file}`;
}

// Where the SVG comes from: the file name from the API, else the local mapping
function pickLayoutSource(data, project, id) {
  const src =
    project?.layout_svg ||
    project?.layout_file ||
    project?.layout_svg_url ||
    project?.svg_url ||
    project?.layout_url ||
    data?.layout_svg ||
    data?.layout?.file ||
    data?.layout?.svg_url ||
    data?.layout?.url ||
    layoutForProject(project, id);
  return typeof src === "string" && src.trim() ? src.trim() : null;
}

// Layout files are treated as untrusted: strip scripts, event handlers and script URLs
function sanitizeSvg(root) {
  root.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((n) => n.remove());
  root.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((a) => {
      const name = a.name.toLowerCase();
      const val = a.value.trim().toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(a.name);
      else if (
        (name === "href" || name === "xlink:href") &&
        (val.startsWith("javascript:") || (val.startsWith("data:") && !val.startsWith("data:image/")))
      ) {
        el.removeAttribute(a.name);
      }
    });
  });
  root.querySelectorAll("style").forEach((s) => {
    s.textContent = (s.textContent || "").replace(/@import[^;]+;/gi, "");
  });
}

// Reads the raw bytes of a layout file and returns SVG text.
// Handles files saved as UTF-16 (common from Illustrator / Windows tools),
// compressed SVG (.svgz renamed to .svg) and stray bytes before the first tag.
async function decodeSvgBytes(buf) {
  let bytes = new Uint8Array(buf);
  const starts = (...sig) => sig.every((b, i) => bytes[i] === b);

  if (starts(0x89, 0x50, 0x4e, 0x47)) throw new Error("This file is a PNG image renamed to .svg. Export the layout as SVG.");
  if (starts(0xff, 0xd8, 0xff)) throw new Error("This file is a JPG image renamed to .svg. Export the layout as SVG.");
  if (starts(0x25, 0x50, 0x44, 0x46)) throw new Error("This file is a PDF renamed to .svg. Export the layout as SVG.");

  // Compressed SVG (gzip)
  if (starts(0x1f, 0x8b)) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This SVG is compressed (svgz). Export it again as a normal SVG.");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // Text encoding
  let encoding = "utf-8";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) encoding = "utf-16le";
  else if (bytes[0] === 0xfe && bytes[1] === 0xff) encoding = "utf-16be";
  else if (bytes[0] === 0x3c && bytes[1] === 0x00) encoding = "utf-16le";
  else if (bytes[0] === 0x00 && bytes[1] === 0x3c) encoding = "utf-16be";

  const text = new TextDecoder(encoding).decode(bytes);
  const start = text.indexOf("<");
  if (start < 0) throw new Error("This file has no SVG markup. Export the layout again as SVG.");
  return text.slice(start);
}

// Illustrator / Inkscape exports often contain things a strict XML parser rejects:
// a DOCTYPE with custom entities (&ns_svg; …), a BOM, or undeclared prefixes.
// Clean those up first; if strict parsing still fails, use the lenient HTML parser.
const ENTITY_NS = {
  ns_svg: "http://www.w3.org/2000/svg",
  ns_xlink: "http://www.w3.org/1999/xlink",
};

function cleanSvgText(raw) {
  let text = String(raw || "").replace(/^\uFEFF/, "").trim();
  if (/^<!doctype html|^<html/i.test(text)) {
    throw new Error("Got a web page instead of an SVG — the layout file name or path is wrong.");
  }
  text = text.replace(/<\?xml[^>]*\?>/i, "");                     // XML declaration
  text = text.replace(/<!DOCTYPE[^[>]*(\[[\s\S]*?\])?\s*>/i, ""); // DOCTYPE (+ entity block)
  text = text.replace(/&(ns_[a-z_]+);/gi, (_, name) =>             // Illustrator entities
    ENTITY_NS[name.toLowerCase()] || `http://ns.adobe.com/${name}/`
  );
  return text.trim();
}

// Turns an SVG file into { inner, vb, plots, fileLabels }
function parseLayoutSvg(raw) {
  const text = cleanSvgText(raw);

  let doc = new DOMParser().parseFromString(text, "image/svg+xml");
  let svg = doc.documentElement;
  const strictFailed =
    !svg || svg.nodeName.toLowerCase() !== "svg" || doc.getElementsByTagName("parsererror").length > 0;

  if (strictFailed) {
    const why = doc.getElementsByTagName("parsererror")[0]?.textContent?.trim();
    if (why) console.warn("Strict SVG parse failed, trying lenient parser:", why);

    // Lenient fallback (same parser the browser uses for inline <svg> in HTML)
    const hdoc = new DOMParser().parseFromString(`<!doctype html><body>${text}</body>`, "text/html");
    const found = hdoc.querySelector("svg");
    if (!found) {
      throw new Error(`This file is not a valid SVG.${why ? " " + why.split("\n")[0] : ""}`);
    }
    doc = hdoc;
    svg = found;
  }
  sanitizeSvg(svg);

  let vb = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some(Number.isNaN) || vb[2] <= 0 || vb[3] <= 0) {
    const w = parseFloat(svg.getAttribute("width")) || 1000;
    const h = parseFloat(svg.getAttribute("height")) || 1000;
    vb = [0, 0, w, h];
  }

  // Find the plot shapes
  const seen = new Map();
  svg.querySelectorAll("[id],[data-plot]").forEach((el) => {
    if (el.closest("defs,clipPath,mask,symbol")) return;
    let raw = el.getAttribute("data-plot");
    if (!raw) {
      const m = /^plot[-_\s]?(.+)$/i.exec(el.getAttribute("id") || "");
      if (!m) return;
      raw = m[1].replace(/_\d+$/, "");
    }
    const key = normKey(raw);
    if (!key) return;
    el.setAttribute("data-plot", key);
    el.setAttribute("class", `${el.getAttribute("class") || ""} pl`.trim());
    if (!seen.has(key)) seen.set(key, { key, label: String(raw).trim().toUpperCase() });
  });

  // Remember which labels the file already prints, and let short texts stay upright
  const fileLabels = new Set();
  const texts = Array.from(svg.querySelectorAll("text"));
  texts.forEach((t) => {
    const k = normKey(t.textContent);
    if (k) fileLabels.add(k);
  });
  texts.forEach((t) => {
    if (t.closest("defs,clipPath,mask,symbol")) return;
    if ((t.textContent || "").trim().length > UPRIGHT_MAX_CHARS) return;
    const g = doc.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "upright");
    t.parentNode.insertBefore(g, t);
    g.appendChild(t);
  });

  const ser = new XMLSerializer();
  const inner = Array.from(svg.childNodes).map((n) => ser.serializeToString(n)).join("");
  const plots = Array.from(seen.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true })
  );

  return { inner, vb, plots, fileLabels };
}

function fileHasLabel(layout, key) {
  const f = layout.fileLabels;
  return f.has(key) || f.has(`PLOT${key}`) || f.has(`P${key}`);
}

// Plot fills: "available" keeps the original cream from your design
const STATUS_FILL = {
  available: "#f9e8c6",
  selected: "#b7cff2",
  booked: "#f4b860",
  sold: "#d4d4d4",
  onhold: "#d3bdea",
};
const PICKED_FILL = "#9ad3ad"; // the plot currently chosen by the user

/* ───────────────────────────── Fallback Data ───────────────────────── */
// Only used when the API is unreachable (demo)

const FB_LABELS = ["1A", "1B", "1C", "1D", "1E", "1F", "1G", "1H", "2A", "2B", "2C", "2D", "2E", "2F"];
const FB_STATUS = [
  "available", "available", "booked", "available", "available", "sold", "available",
  "onhold", "available", "available", "sold", "available", "available", "booked",
];
const FB_SIZE = [1200, 1500, 1200, 1800, 1200, 1500, 2400, 1800, 1200, 1500, 1800, 1200, 1500, 2400];
const FB_DIM = { 1200: "30 x 40", 1500: "30 x 50", 1800: "30 x 60", 2400: "40 x 60" };
const FB_FACING = ["North", "South", "East", "West"];

const FALLBACK_PLOTS = FB_LABELS.map((label, i) => ({
  id: label,
  number: label,
  status: FB_STATUS[i],
  size: FB_SIZE[i],
  price: FB_SIZE[i] * 2200,
  pricePerSqft: 2200,
  facing: FB_FACING[i % 4],
  dimensions: FB_DIM[FB_SIZE[i]],
  roadWidth: "20 FT",
  type: i % 5 === 0 ? "Corner Plot" : "Residential",
  advantages: ["Corner Advantage", "Park Facing", "Near to Main Gate", "Close to Clubhouse"],
}));

const FALLBACK_AMENITIES = [
  { icon: Shield, label: "24/7 Security" },
  { icon: Route, label: "Wide Roads" },
  { icon: TreePine, label: "Parks & Greenery" },
  { icon: Droplets, label: "Underground Drainage" },
  { icon: Lightbulb, label: "Street Lights" },
  { icon: Wrench, label: "Water Connection" },
];

const DEFAULT_ADVANTAGES = ["Corner Advantage", "Park Facing", "Near to Main Gate", "Close to Clubhouse"];

const STATUS_COLORS = {
  available: "bg-[#4a7c59]",
  selected: "bg-[#3b6bb5]",
  reserved: "bg-[#3b6bb5]",
  booked: "bg-[#c49a2a]",
  sold: "bg-[#6b7280]",
  onhold: "bg-[#7c5c8a]",
  blocked: "bg-[#7c5c8a]",
};

const STATUS_LABELS = {
  available: "Available",
  selected: "Selected",
  reserved: "Selected",
  booked: "Booked",
  sold: "Sold",
  onhold: "On Hold",
  blocked: "On Hold",
};

// Maps API status strings to the internal status keys the UI uses
function normalizeStatus(apiStatus) {
  const s = (apiStatus || "available").toLowerCase();
  if (s === "reserved") return "selected";
  if (s === "blocked") return "onhold";
  return s;
}

/* ───────────────────────────── Helpers ─────────────────────────────── */

function formatINR(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

function formatShort(num) {
  const n = Number(num || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")} L`;
  return `₹${formatINR(n)}`;
}

function parseMoney(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
}

function getStatusLabel(s) {
  return STATUS_LABELS[s] || s;
}

// Compass-heading degrees for a facing string, used by the modal's facing badge
const FACING_DEGREES = {
  north: 0,
  "north-east": 45,
  northeast: 45,
  east: 90,
  "south-east": 135,
  southeast: 135,
  south: 180,
  "south-west": 225,
  southwest: 225,
  west: 270,
  "north-west": 315,
  northwest: 315,
};
function facingToDegrees(facing) {
  const key = String(facing || "north").toLowerCase().trim();
  return FACING_DEGREES[key] ?? 0;
}

// Convert flat API plot list into the shape the UI expects
function mapApiPlots(apiPlots) {
  return apiPlots.map((p, index) => ({
    id: String(p.id ?? index + 1),
    number: (p.plot_number || `PLOT-${index + 1}`).replace(/^PLOT-0*/i, "") || String(index + 1),
    // the id of this plot inside the SVG (e.g. "2C"); falls back to the plot number
    layoutId: p.svg_id || p.layout_id || p.plot_code || null,
    status: normalizeStatus(p.status),
    size: parseMoney(p.area_sqft),
    price: parseMoney(p.final_price || p.total_price),
    totalPrice: parseMoney(p.total_price),
    discount: parseMoney(p.discount),
    pricePerSqft: parseMoney(p.price_per_sqft),
    facing: p.facing || "North",
    dimensions: p.dimension || "—",
    roadWidth: p.road_access || "—",
    type: p.plot_type || "Residential",
    block: p.block_name || null,
    floor: p.floor || null,
    corner: p.corner || null,
    boundaryWall: p.boundary_wall || null,
    description: p.description || null,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
    advantages: p.features || [],
    image: p.image,
  }));
}

// Links each database plot to a plot shape in the SVG (key → plot).
// Exact id match first; any plots left over fill the remaining shapes in order.
function assignShapes(plots, shapes) {
  const byKey = {};
  const used = new Set();
  const keys = new Set(shapes.map((s) => s.key));

  plots.forEach((p) => {
    const key = normKey(p.layoutId || p.number);
    if (keys.has(key) && !byKey[key]) {
      byKey[key] = p;
      used.add(p.id);
    }
  });

  const freeShapes = shapes.filter((s) => !byKey[s.key]);
  plots
    .filter((p) => !used.has(p.id))
    .forEach((p, i) => {
      if (freeShapes[i]) byKey[freeShapes[i].key] = p;
    });

  return byKey;
}

/* ───────────────────────────── Component ───────────────────────────── */

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [plots, setPlots] = useState(FALLBACK_PLOTS);
  const [amenitiesList, setAmenitiesList] = useState(null);
  const [filtersMeta, setFiltersMeta] = useState(null);
  const [contact, setContact] = useState({ phone: "+91 76677 77737" });
  const [selectedPlot, setSelectedPlot] = useState(FALLBACK_PLOTS.find((p) => p.id === "1C"));
  const [viewMode, setViewMode] = useState("layout");
  const [showPlotPanel, setShowPlotPanel] = useState(true);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // SVG layout (from public/layouts)
  const [layout, setLayout] = useState(null); // { inner, vb, plots, fileLabels }
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState(null);
  const [geo, setGeo] = useState({}); // plot key → bounding box in SVG units
  const layoutSrcRef = useRef(null);
  const svgRef = useRef(null);

  // Plot details modal
  const [modalPlot, setModalPlot] = useState(null);

  // Map (SVG layout) state
  const mapRef = useRef(null);
  const dragRef = useRef({ active: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 });
  const [hover, setHover] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0); // map rotation in degrees (unbounded so animations take the short way)
  const [upright, setUpright] = useState(true); // keep plot labels readable while rotating
  const [sliding, setSliding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [size, setSize] = useState({ w: 800, h: 740 });

  // Filters
  const [sizeFilter, setSizeFilter] = useState("all");
  const [facingFilter, setFacingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("10,00,000");
  const [priceMax, setPriceMax] = useState("75,00,000");
  const [amenities, setAmenities] = useState({
    parkFacing: false,
    cornerPlot: false,
    mainRoadAccess: false,
    clubhouseNearby: false,
    gardenView: false,
  });

  const layoutPlots = layout?.plots || [];
  const shapeMap = useMemo(() => assignShapes(plots, layoutPlots), [plots, layout]); // eslint-disable-line react-hooks/exhaustive-deps
  const labelByKey = useMemo(() => {
    const m = {};
    layoutPlots.forEach((s) => (m[s.key] = s.label));
    return m;
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  const hoverKey = hover?.key || null;
  const hoverPlot = hoverKey ? shapeMap[hoverKey] : null;
  const modalKey = modalPlot ? Object.keys(shapeMap).find((k) => shapeMap[k].id === modalPlot.id) : null;

  /* ─────────────── Load the SVG layout from public/layouts ─────────────── */

  async function loadLayout(source) {
    setLayoutLoading(true);
    setLayoutError(null);
    try {
      let text;
      if (/^\s*<(\?xml|svg)/i.test(source)) {
        text = source; // API sent the SVG markup itself
      } else {
        const url = resolveLayoutUrl(source); // "firstlayout.svg" → "/layouts/firstlayout.svg"
        const fileName = url.split("/").pop();
        const rootUrl = url.startsWith("http") ? null : `/${fileName}`; // also try public/ root

        const isSvg = (r) => r.ok && !/text\/html/i.test(r.headers.get("content-type") || "");

        let res = await fetch(url);
        if (!isSvg(res) && rootUrl && rootUrl !== url) res = await fetch(rootUrl);
        if (!isSvg(res)) {
          throw new Error(`Layout file not found. Put it at public/layouts/${fileName} (check the spelling).`);
        }
        text = await decodeSvgBytes(await res.arrayBuffer());
      }
      const parsed = parseLayoutSvg(text);
      if (parsed.plots.length === 0) {
        throw new Error('No plots found in this SVG. Give each plot an id like "Plot-2C" (or a data-plot attribute).');
      }
      setLayout(parsed);
    } catch (err) {
      console.error("Error loading layout:", err);
      layoutSrcRef.current = null;
      setLayout(null);
      setLayoutError(err.message || "Could not load the layout file.");
    } finally {
      setLayoutLoading(false);
    }
  }

  // Load (or clear) the layout only when the file actually changes.
  // Tip for testing: add ?layout=secondlayout.svg to the page URL to preview any file.
  function syncLayout(src) {
    const override =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("layout") : null;
    const source = override || src;
    if (!source) {
      layoutSrcRef.current = null;
      setLayout(null);
      setLayoutError(null);
      return;
    }
    if (source === layoutSrcRef.current) return;
    layoutSrcRef.current = source;
    loadLayout(source);
  }

  /* ─────────────── Fetch project + plots from live API ─────────────── */

  function buildQuery() {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sizeFilter !== "all") params.set("size", sizeFilter);
    if (facingFilter !== "all") params.set("facing", facingFilter.toLowerCase());

    const min = parseMoney(priceMin);
    const max = parseMoney(priceMax);
    if (min) params.set("min_price", String(min));
    if (max) params.set("max_price", String(max));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  async function fetchProject() {
    if (!id) return;
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_BASE}/projects/${id}${buildQuery()}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error("API returned success: false");

      const data = json.data || {};
      const proj = data.project || data.project_details || null;

      setProject(proj);
      setContact(data.contact || { phone: "+91 76677 77737" });
      setFiltersMeta(data.filters || null);

      // Backend sends only the file name (e.g. "firstlayout.svg"); fallback = PROJECT_LAYOUTS
      syncLayout(pickLayoutSource(data, proj, id));

      if (Array.isArray(data.amenities) && data.amenities.length > 0) {
        setAmenitiesList(data.amenities);
      }

      if (Array.isArray(data.plots) && data.plots.length > 0) {
        const mapped = mapApiPlots(data.plots);
        setPlots(mapped);
        setSelectedPlot(mapped.find((p) => p.status === "available") || mapped[0]);
      } else {
        setPlots([]);
        setSelectedPlot(null);
      }

      setApiError(null);
    } catch (err) {
      console.error("Error fetching project:", err);
      setApiError("Live data unavailable — showing demo plots");
      setPlots(FALLBACK_PLOTS);
      setSelectedPlot(FALLBACK_PLOTS.find((p) => p.id === "1C"));
      // Still show the layout from public/layouts if we know it for this project
      syncLayout(layoutForProject(null, id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Close the modal with Escape and lock page scroll while it is open
  useEffect(() => {
    if (!modalPlot) return;
    const onKey = (e) => {
      if (e.key === "Escape") setModalPlot(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalPlot]);

  // Track the map container size so the rotated layout always fits
  useEffect(() => {
    const el = mapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mouse-wheel zoom (native listener so we can stop the page from scrolling)
  useEffect(() => {
    const el = mapRef.current;
    if (!el || viewMode !== "layout") return;
    const onWheel = (e) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 0.15 : -0.15);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [viewMode]);

  // Measure every plot shape once the SVG is on screen (used for labels + the modal preview)
  const busy = loading || layoutLoading;
  useEffect(() => {
    const root = svgRef.current;
    if (!layout || viewMode !== "layout" || busy || !root) {
      if (!layout) setGeo({});
      return;
    }
    const rootCTM = root.getScreenCTM();
    if (!rootCTM) return;
    const inv = rootCTM.inverse();
    const out = {};

    root.querySelectorAll("[data-plot]").forEach((el) => {
      let b;
      try {
        b = el.getBBox();
      } catch {
        return;
      }
      const m = el.getScreenCTM();
      if (!m || !b) return;
      const rel = inv.multiply(m);
      const pts = [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x, b.y + b.height],
        [b.x + b.width, b.y + b.height],
      ].map(([x, y]) => {
        const p = new DOMPoint(x, y).matrixTransform(rel);
        return [p.x, p.y];
      });
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const key = el.getAttribute("data-plot");
      const prev = out[key];
      const minX = Math.min(...xs, prev ? prev.minX : Infinity);
      const minY = Math.min(...ys, prev ? prev.minY : Infinity);
      const maxX = Math.max(...xs, prev ? prev.maxX : -Infinity);
      const maxY = Math.max(...ys, prev ? prev.maxY : -Infinity);
      out[key] = { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
    });

    // Does the file already print this plot's name?
    // Illustrator often splits "1B" into separate <text>/<tspan> pieces,
    // so join the texts sitting in the middle of each plot and look for the name.
    const pieces = [];
    root.querySelectorAll(".layout-file text").forEach((t) => {
      let b;
      try {
        b = t.getBBox();
      } catch {
        return;
      }
      const m = t.getScreenCTM();
      if (!m || !b) return;
      const p = new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(inv.multiply(m));
      pieces.push({ x: p.x, y: p.y, text: t.textContent || "" });
    });

    Object.entries(out).forEach(([key, g]) => {
      const row = g.h * 0.08 || 1;
      const inside = pieces
        .filter((p) => Math.abs(p.x - g.cx) < g.w * 0.3 && Math.abs(p.y - g.cy) < g.h * 0.25)
        .sort((a, b) => Math.round(a.y / row) - Math.round(b.y / row) || a.x - b.x);
      g.hasName = normKey(inside.map((p) => p.text).join("")).includes(key);
    });

    setGeo(out);
  }, [layout, viewMode, busy]);

  function handleApplyFilters() {
    fetchProject();
  }

  const projectName = project?.title || project?.name || "Green Valley";

  // Click on the map / list: select the plot and open the details modal
  function handlePlotClick(plot) {
    if (plot.status === "sold") return;
    setSelectedPlot(plot);
    setShowPlotPanel(true);
    setModalPlot(plot);
  }

  // Select without opening the modal (recently viewed strip)
  function selectPlot(plot) {
    if (plot.status === "sold") return;
    setSelectedPlot(plot);
    setShowPlotPanel(true);
  }

  // "Reserve This Plot" → checkout page (payment gateway UI lives there)
  function handleBookPlot(plot) {
    if (!plot) return;
    try {
      sessionStorage.setItem(
        "plot_checkout",
        JSON.stringify({ projectId: id, projectName, plot })
      );
    } catch {
      /* storage blocked — checkout page will refetch from the API */
    }
    setModalPlot(null);
    router.push(`/projects/${id}/checkout?plot=${plot.id}`);
  }

  function toggleAmenity(key) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  /* ─────────────── Map interactions (zoom / rotate / pan / hover) ─────────────── */

  function zoomBy(delta) {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(2))));
  }

  function rotateBy(deg) {
    setRot((r) => r + deg);
  }

  // Rotate (shortest way) so the chosen compass direction is at the top of the screen
  function faceUp(target) {
    setRot((r) => {
      const delta = ((((target - r) % 360) + 540) % 360) - 180;
      return r + delta;
    });
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    faceUp(0);
  }

  function onMapPointerDown(e) {
    dragRef.current = { active: true, moved: false, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  }

  function onMapPointerMove(e) {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) setPan({ x: d.px + dx, y: d.py + dy });
  }

  function onMapPointerUp() {
    dragRef.current.active = false;
    setDragging(false);
  }

  // Events are handled on the <svg> itself, so any layout file works without per-shape handlers
  function plotKeyFromEvent(e) {
    const el = e.target?.closest?.("[data-plot]");
    return el ? el.getAttribute("data-plot") : null;
  }

  function onSvgMouseMove(e) {
    if (dragRef.current.active && dragRef.current.moved) return;
    const key = plotKeyFromEvent(e);
    if (key && shapeMap[key]) {
      const r = mapRef.current?.getBoundingClientRect();
      if (!r) return;
      setHover({ key, x: e.clientX - r.left, y: e.clientY - r.top });
    } else if (hover) {
      setHover(null);
    }
  }

  function onSvgClick(e) {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    const key = plotKeyFromEvent(e);
    const plot = key ? shapeMap[key] : null;
    if (plot) {
      setHover(null);
      handlePlotClick(plot);
    }
  }

  const filteredPlotCount = plots.filter((p) => p.status !== "sold").length;
  const availableCount = plots.filter((p) => p.status === "available").length;

  const amenityBar =
    amenitiesList && amenitiesList.length > 0
      ? amenitiesList.map((a) => ({ label: a.name, icon: TreePine }))
      : FALLBACK_AMENITIES;

  const sizeOptions =
    filtersMeta?.plot_size?.map((f) => ({ label: f.label, value: f.value })) || [
      { label: "All", value: "all" },
      { label: "600 - 1200", value: "600-1200" },
      { label: "1200 - 1800", value: "1200-1800" },
      { label: "1800+", value: "1800+" },
    ];

  const mapW = size.w;

  // Scale that keeps the whole (rotated) layout inside the map area at any angle
  const [vbX, vbY, vbW, vbH] = layout?.vb || [0, 0, 1, 1];
  const rad = (rot * Math.PI) / 180;
  const boundW = Math.abs(vbW * Math.cos(rad)) + Math.abs(vbH * Math.sin(rad));
  const boundH = Math.abs(vbW * Math.sin(rad)) + Math.abs(vbH * Math.cos(rad));
  const baseScale = Math.min(size.w / vbW, size.h / vbH) || 1;
  const fit = (Math.min(size.w / boundW, size.h / boundH) / baseScale) * 0.94 || 1;

  const still = dragging || sliding; // no easing while the user is dragging / sliding
  const normRot = Math.round(((rot % 360) + 360) % 360);
  const compassTargets = [
    { key: "N", deg: 0, title: "North at top" },
    { key: "E", deg: 270, title: "East at top" },
    { key: "S", deg: 180, title: "South at top" },
    { key: "W", deg: 90, title: "West at top" },
  ];

  // Status colours + selection / hover outline for every plot shape in the file
  const plotCss = useMemo(() => {
    if (!layout) return "";
    const sw = layout.vb[2] * 0.002;
    let css = "";
    layout.plots.forEach((s) => {
      const plot = shapeMap[s.key];
      const empty = !plot;
      const sold = plot?.status === "sold";
      const isSel = !!plot && selectedPlot?.id === plot.id;
      const isHover = hoverKey === s.key;
      const fill = empty
        ? STATUS_FILL.available
        : isSel
        ? PICKED_FILL
        : STATUS_FILL[plot.status] || STATUS_FILL.available;
      const sel = `.layout-svg [data-plot="${s.key}"]:is(${SHAPE_SEL}),.layout-svg [data-plot="${s.key}"] :is(${SHAPE_SEL})`;
      let rule = `fill:${fill}!important;fill-opacity:${empty ? 0.6 : 1}!important;cursor:${
        empty ? "default" : sold ? "not-allowed" : "pointer"
      };transition:fill .2s ease;`;
      if (isSel) {
        rule += `stroke:#1B2B1B!important;stroke-width:${sw * 3.1}px!important;stroke-opacity:1;animation:plotGlow 1.8s ease-in-out infinite;`;
      } else if (isHover && !sold) {
        rule += `stroke:#1B2B1B!important;stroke-width:${sw * 1.8}px!important;`;
      }
      css += `${sel}{${rule}}`;
    });
    return css;
  }, [layout, shapeMap, selectedPlot, hoverKey]);

  const unrotVar = `${upright ? -rot : 0}deg`;

  return (
    <Shell>
      <style>{`
        @keyframes plotGlow {
          0%, 100% { stroke-opacity: 1; }
          50%      { stroke-opacity: .35; }
        }
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalRise {
          from { opacity: 0; transform: translateY(22px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .layout-svg text { pointer-events: none; }
        .upright {
          transform-box: fill-box;
          transform-origin: center;
          transform: rotate(var(--unrot, 0deg));
          transition: transform .35s cubic-bezier(.2,.8,.2,1);
        }
        .layout-still .upright { transition: none; }
        .modal-backdrop { animation: modalFade .25s ease-out both; }
        .modal-card { animation: modalRise .34s cubic-bezier(.2,.8,.2,1) both; }
        .rot-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 9999px; background: rgba(255,255,255,.22); outline: none; }
        .rot-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 9999px; background: #e0bd6a; border: 2px solid #101a10; cursor: pointer; }
        .rot-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 9999px; background: #e0bd6a; border: 2px solid #101a10; cursor: pointer; }
        @media (prefers-reduced-motion: reduce) {
          .layout-svg [data-plot] { animation: none !important; }
          .modal-backdrop, .modal-card { animation: none; }
        }
      `}</style>

      <div className="min-h-screen bg-[#f5f5f0] flex flex-col">

        {/* ════════════════════ BREADCRUMB + TITLE BAR ════════════════ */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 pt-3 pb-4">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-3">
              <Link href="/dashboard" className="hover:text-gray-600">
                <Home className="w-3.5 h-3.5" />
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/projects" className="hover:text-gray-600">Projects</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600">{projectName}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-800 font-medium">Plot Selection</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
                  Select Your Perfect Plot
                  <span className="ml-2">
                    <TreePine className="w-6 h-6 inline text-green-600" />
                  </span>
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {project?.location
                    ? `${project.location} · Premium plots in a prime location to build your dream home.`
                    : "Premium plots in a prime location to build your dream home."}
                </p>
                {apiError && (
                  <p className="text-[11px] text-amber-600 mt-1">{apiError}</p>
                )}
              </div>
              <button className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors mt-1">
                <Play className="w-4 h-4 text-green-700" />
                How it works
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════ MAIN 3-COLUMN LAYOUT ═════════════════ */}
        <div className="flex-1 flex min-h-0">

          {/* ──────────── LEFT SIDEBAR — FILTERS ──────────── */}
          <aside className="w-[400px] flex-shrink-0 bg-white border-r border-gray-200 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Plots
              </h2>
              <button
                onClick={() => {
                  setSizeFilter("all");
                  setFacingFilter("all");
                  setStatusFilter("all");
                  setPriceMin("10,00,000");
                  setPriceMax("75,00,000");
                  setAmenities({
                    parkFacing: false,
                    cornerPlot: false,
                    mainRoadAccess: false,
                    clubhouseNearby: false,
                    gardenView: false,
                  });
                  fetchProject();
                }}
                className="text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Reset <RotateCw className="w-3 h-3" />
              </button>
            </div>

            {/* Plot Size */}
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-700 mb-2.5 block">
                <Ruler className="w-4 h-4 inline mr-1.5" />
                Plot Size (Sq.Ft.)
              </label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSizeFilter(s.value)}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                      sizeFilter === s.value
                        ? "bg-[#1B2B1B] text-white border-[#1B2B1B]"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plot Facing */}
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-700 mb-2.5 block">
                <Compass className="w-4 h-4 inline mr-1.5" />
                Plot Facing
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[
                  { label: "All", value: "all", icon: null },
                  { label: "North", value: "north", icon: ArrowUp },
                  { label: "South", value: "south", icon: ArrowDown },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFacingFilter(f.value)}
                      className={`flex flex-col items-center py-2.5 rounded-lg text-[11px] font-medium border transition-colors ${
                        facingFilter === f.value
                          ? "bg-[#1B2B1B] text-white border-[#1B2B1B]"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {f.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "East", value: "east", icon: ArrowRight },
                  { label: "West", value: "west", icon: ArrowLeft },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFacingFilter(f.value)}
                      className={`flex flex-col items-center py-2.5 rounded-lg text-[11px] font-medium border transition-colors ${
                        facingFilter === f.value
                          ? "bg-[#1B2B1B] text-white border-[#1B2B1B]"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-700 mb-2.5 block">
                <TrendingUp className="w-4 h-4 inline mr-1.5" />
                Price Range
              </label>
              <div className="relative h-6 flex items-center mb-3 px-1">
                <div className="w-full h-[3px] bg-gray-200 rounded-full relative">
                  <div className="absolute left-[10%] right-[10%] h-full bg-[#4a7c59] rounded-full" />
                  <div className="absolute left-[10%] -translate-x-1/2 -top-[5px] w-[13px] h-[13px] rounded-full bg-[#4a7c59] border-2 border-white shadow-sm cursor-pointer" />
                  <div className="absolute right-[10%] translate-x-1/2 -top-[5px] w-[13px] h-[13px] rounded-full bg-[#4a7c59] border-2 border-white shadow-sm cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`₹ ${priceMin}`}
                  onChange={(e) => setPriceMin(e.target.value.replace("₹ ", ""))}
                  className="flex-1 border border-gray-300 rounded-md px-2.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#4a7c59]"
                />
                <input
                  type="text"
                  value={`₹ ${priceMax}`}
                  onChange={(e) => setPriceMax(e.target.value.replace("₹ ", ""))}
                  className="flex-1 border border-gray-300 rounded-md px-2.5 py-2 text-[12px] text-gray-700 outline-none focus:border-[#4a7c59]"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-700 mb-2.5 block">
                <Award className="w-4 h-4 inline mr-1.5" />
                Amenities
              </label>
              <div className="flex flex-col gap-2.5">
                {[
                  { key: "parkFacing", label: "Park Facing" },
                  { key: "cornerPlot", label: "Corner Plot" },
                  { key: "mainRoadAccess", label: "Main Road Access" },
                  { key: "clubhouseNearby", label: "Clubhouse Nearby" },
                  { key: "gardenView", label: "Garden View" },
                ].map((a) => (
                  <label key={a.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={amenities[a.key]}
                      onChange={() => toggleAmenity(a.key)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#4a7c59] accent-[#4a7c59]"
                    />
                    <span className="text-[13px] text-gray-600">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyFilters}
              className="w-full bg-[#1B2B1B] hover:bg-[#263d26] text-white py-3 rounded-lg text-[13px] font-semibold transition-colors mb-3"
            >
              <SlidersHorizontal className="w-4 h-4 inline mr-2" />
              {loading ? "Loading..." : "Apply Filters"}
            </button>

            <p className="text-center text-[12px] text-gray-500">
              <span className="font-bold text-gray-700">{filteredPlotCount}</span> plots found
            </p>
          </aside>

          {/* ──────────── CENTER — MAP / LAYOUT ──────────── */}
          <div className="flex-[1.5] flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[12px] font-semibold text-gray-700 flex items-center gap-1.5">
                  <Circle className="w-3 h-3" />
                  Plot Status :
                </span>
                {[
                  { status: "available", label: "Available" },
                  { status: "selected", label: "Selected" },
                  { status: "booked", label: "Booked" },
                  { status: "sold", label: "Sold" },
                  { status: "onhold", label: "On Hold" },
                ].map((s) => (
                  <div key={s.status} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: STATUS_FILL[s.status], border: "1px solid rgba(35,31,32,.35)" }}
                    />
                    <span className="text-[11px] text-gray-600">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-500">View :</span>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("layout")}
                    className={`px-3 py-1 text-[11px] font-medium transition-colors flex items-center gap-1 ${
                      viewMode === "layout" ? "bg-[#1B2B1B] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3x3 className="w-3.5 h-3.5" />
                    Layout
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 text-[11px] font-medium transition-colors flex items-center gap-1 ${
                      viewMode === "list" ? "bg-[#1B2B1B] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Map area */}
            <div
              ref={mapRef}
              className="relative overflow-hidden select-none"
              style={{
                height: viewMode === "layout" ? "740px" : "460px",
                background:
                  viewMode === "layout"
                    ? "radial-gradient(ellipse at 50% 40%, #ffffff 0%, #f4f3ec 100%)"
                    : "#1d2b1c",
              }}
            >
              {busy ? (
                <div className={`absolute inset-0 flex items-center justify-center text-[13px] ${viewMode === "layout" ? "text-gray-400" : "text-white/70"}`}>
                  {layoutLoading ? "Loading layout..." : "Loading plots..."}
                </div>
              ) : viewMode === "layout" ? (
                layout ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{ cursor: dragging && dragRef.current.moved ? "grabbing" : "grab", touchAction: "none" }}
                      onPointerDown={onMapPointerDown}
                      onPointerMove={onMapPointerMove}
                      onPointerUp={onMapPointerUp}
                      onPointerLeave={onMapPointerUp}
                    >
                      <style>{plotCss}</style>
                      <div
                        className={`w-full h-full ${still ? "layout-still" : ""}`}
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rot}deg) scale(${(zoom * fit).toFixed(4)})`,
                          transformOrigin: "center",
                          transition: still ? "none" : EASE,
                        }}
                      >
                        <svg
                          ref={svgRef}
                          className="layout-svg"
                          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                          width="100%"
                          height="100%"
                          fontFamily={FONT}
                          style={{ overflow: "visible", "--unrot": unrotVar }}
                          onClick={onSvgClick}
                          onMouseMove={onSvgMouseMove}
                          onMouseLeave={() => setHover(null)}
                        >
                          {/* The layout file, drawn as-is */}
                          <g className="layout-file" dangerouslySetInnerHTML={{ __html: layout.inner }} />

                          {/* Plot names (only if the file doesn't print them) and status / price tags */}
                          <g pointerEvents="none" fill={INK}>
                            {layout.plots.map((s) => {
                              const plot = shapeMap[s.key];
                              const g = geo[s.key];
                              if (!plot || !g) return null;
                              const sold = plot.status === "sold";
                              const nameSize = Math.min(g.w, g.h) * 0.2;
                              const ownLabel =
                                PLOT_NAMES === "file"
                                  ? true
                                  : PLOT_NAMES === "app"
                                  ? false
                                  : g.hasName || fileHasLabel(layout, s.key);
                              const sub =
                                showPrice && !sold
                                  ? formatShort(plot.price)
                                  : plot.status !== "available"
                                  ? getStatusLabel(plot.status).toUpperCase()
                                  : null;
                              return (
                                <g key={s.key}>
                                  {!ownLabel && (
                                    <g className="upright">
                                      <text
                                        x={g.cx}
                                        y={g.cy + nameSize * (sub ? 0 : 0.35)}
                                        textAnchor="middle"
                                        fontSize={nameSize}
                                        fontWeight="800"
                                      >
                                        {s.label}
                                      </text>
                                    </g>
                                  )}
                                  {sub && (
                                    <g className="upright">
                                      <text
                                        x={g.cx}
                                        y={g.cy + nameSize * (ownLabel ? 1.05 : 0.85)}
                                        textAnchor="middle"
                                        fontSize={nameSize * 0.45}
                                        fontWeight="700"
                                        letterSpacing={nameSize * 0.05}
                                        fillOpacity="0.75"
                                      >
                                        {sub}
                                      </text>
                                    </g>
                                  )}
                                </g>
                              );
                            })}
                          </g>
                        </svg>
                      </div>
                    </div>

                    {plots.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-[12px] pointer-events-none">
                        No plots match the current filters.
                      </div>
                    )}

                    {/* Hover card */}
                    {hover && hoverPlot && (
                      <div
                        className="absolute z-20 pointer-events-none rounded-xl border border-white/15 bg-[#1B2B1B]/95 backdrop-blur px-3.5 py-2.5 text-white shadow-2xl"
                        style={{
                          left: hover.x > mapW - 200 ? hover.x - 184 : hover.x + 16,
                          top: Math.max(8, hover.y - 8),
                          width: 168,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] font-bold">Plot {labelByKey[hover.key] || hoverPlot.number}</span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-[#231f20]"
                            style={{ background: STATUS_FILL[hoverPlot.status] || STATUS_FILL.available }}
                          >
                            {getStatusLabel(hoverPlot.status)}
                          </span>
                        </div>
                        <div className="text-[15px] font-bold leading-tight">₹ {formatINR(hoverPlot.price)}</div>
                        <div className="text-[11px] text-white/60 mt-1">
                          {formatINR(hoverPlot.size)} Sq.Ft. · {hoverPlot.facing} facing
                        </div>
                      </div>
                    )}

                    {/* Live compass — the needle always points to real North */}
                    <div
                      className="absolute top-3 left-3 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm"
                      title="North"
                    >
                      <svg viewBox="0 0 48 48" className="w-full h-full">
                        <circle cx="24" cy="24" r="21" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                        <g
                          style={{
                            transform: `rotate(${rot}deg)`,
                            transformOrigin: "24px 24px",
                            transition: still ? "none" : EASE,
                          }}
                        >
                          <path d="M24 8 L28.5 24 L24 21.5 L19.5 24 Z" fill="#dc2626" />
                          <path d="M24 40 L28.5 24 L24 26.5 L19.5 24 Z" fill="#9ca3af" />
                          <text x="24" y="7" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#374151">N</text>
                        </g>
                        <circle cx="24" cy="24" r="1.8" fill="#1B2B1B" />
                      </svg>
                    </div>

                    {/* Availability chip */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-white border border-gray-200 shadow-sm px-3 py-1.5 text-[11px] text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]" />
                      {availableCount} available
                    </div>

                    {/* Hint */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] text-gray-400 pointer-events-none whitespace-nowrap">
                      Scroll to zoom · drag to move · click a plot to open it
                    </div>

                    {/* Rotation panel */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[min(400px,calc(100%-24px))] rounded-2xl bg-[#101a10]/90 backdrop-blur-md border border-white/10 shadow-2xl px-3 py-2.5 text-white">
                      <div className="flex items-center gap-2">
                        <button
                          title="Rotate left 90°"
                          onClick={() => rotateBy(-90)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={1}
                          value={normRot}
                          aria-label="Rotate layout"
                          onChange={(e) => setRot(Number(e.target.value))}
                          onPointerDown={() => setSliding(true)}
                          onPointerUp={() => setSliding(false)}
                          onBlur={() => setSliding(false)}
                          className="rot-slider flex-1 min-w-0"
                        />
                        <button
                          title="Rotate right 90°"
                          onClick={() => rotateBy(90)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-right text-[11px] tabular-nums text-white/70">{normRot}°</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10.5px] text-white/50 mr-1">Face up</span>
                          {compassTargets.map((c) => (
                            <button
                              key={c.key}
                              title={c.title}
                              onClick={() => faceUp(c.deg)}
                              className={`w-7 h-7 rounded-md text-[11px] font-bold transition-colors ${
                                normRot === c.deg
                                  ? "bg-[#e0bd6a] text-[#101a10]"
                                  : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                            >
                              {c.key}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setUpright((v) => !v)}
                          className="flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white transition-colors"
                          aria-pressed={upright}
                        >
                          <span
                            className={`w-7 h-4 rounded-full relative transition-colors ${upright ? "bg-[#e0bd6a]" : "bg-white/25"}`}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${upright ? "left-3.5" : "left-0.5"}`}
                            />
                          </span>
                          Upright labels
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No layout file for this project / failed to load */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="text-[14px] font-semibold text-gray-800">
                      {layoutError ? "We couldn't load this layout" : "No layout has been added for this project yet"}
                    </div>
                    <p className="text-[12px] text-gray-500 max-w-sm">
                      {layoutError || "You can still browse and book plots from the list view."}
                    </p>
                    <button
                      onClick={() => setViewMode("list")}
                      className="mt-1 bg-[#1B2B1B] hover:bg-[#263d26] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
                    >
                      Open list view
                    </button>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-2 max-w-[560px] mx-auto">
                    {plots.map((plot) => (
                      <button
                        key={plot.id}
                        onClick={() => handlePlotClick(plot)}
                        disabled={plot.status === "sold"}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                          selectedPlot?.id === plot.id
                            ? "bg-white/20 ring-1 ring-white/50"
                            : "bg-white/5 hover:bg-white/10"
                        } ${plot.status === "sold" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: STATUS_FILL[plot.status] || STATUS_FILL.available }}
                          />
                          <span className="text-white text-[13px] font-semibold">Plot {plot.number}</span>
                          <span className="text-white/50 text-[11px]">{formatINR(plot.size)} Sq.Ft.</span>
                        </div>
                        <span className="text-white text-[13px] font-semibold">₹ {formatINR(plot.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Map controls */}
              {viewMode === "layout" && layout && !busy && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
                  <button
                    title="Zoom in"
                    onClick={() => zoomBy(0.25)}
                    disabled={zoom >= ZOOM_MAX}
                    className="w-9 h-9 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="text-[10.5px] font-semibold text-gray-500 tabular-nums bg-white/80 rounded px-1.5 py-0.5">
                    {Math.round(zoom * 100)}%
                  </div>
                  <button
                    title="Zoom out"
                    onClick={() => zoomBy(-0.25)}
                    disabled={zoom <= ZOOM_MIN}
                    className="w-9 h-9 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    title="Reset view"
                    onClick={resetView}
                    className="w-9 h-9 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  <button
                    title={showPrice ? "Hide plot price" : "Show plot price"}
                    onClick={() => setShowPrice((v) => !v)}
                    className={`w-9 h-9 border rounded-lg shadow-sm flex items-center justify-center transition-colors ${
                      showPrice
                        ? "bg-[#1B2B1B] border-[#1B2B1B] text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              )}

              {viewMode === "layout" && layout && !busy && (
                <button className="absolute top-[68px] left-3 bg-[#1B2B1B]/90 hover:bg-[#1B2B1B] backdrop-blur text-white px-3.5 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors z-10">
                  <Eye className="w-3.5 h-3.5" />
                  3D View
                </button>
              )}
            </div>

            {/* Amenity icons bar */}
            <div className="flex items-center gap-5 px-4 py-2.5 bg-white border-t border-gray-200 overflow-x-auto">
              {amenityBar.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className="flex items-center gap-1.5 whitespace-nowrap">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-[11px] text-gray-600">{a.label}</span>
                  </div>
                );
              })}
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </div>

            {/* Recently Viewed Plots */}
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <h3 className="text-[13px] font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Recently Viewed Plots
              </h3>
              <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
                {plots.slice(0, 4).map((rv) => (
                  <button
                    key={rv.id}
                    onClick={() => selectPlot(rv)}
                    className={`flex items-center gap-3 min-w-[150px] rounded-xl px-3 py-2.5 border transition-colors ${
                      selectedPlot?.id === rv.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      selectedPlot?.id === rv.id ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                    }`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-[12px] font-bold text-gray-900">P-{rv.number}</div>
                      <div className="text-[10px] text-gray-400">{formatINR(rv.size)} Sq.Ft.</div>
                      <div className="text-[12px] font-bold text-gray-800">₹ {formatINR(rv.price)}</div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setViewMode("list")}
                  className="flex flex-col items-center justify-center min-w-[80px] rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 mb-1">
                    <Grid3x3 className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-gray-700">View All</div>
                  <div className="text-[9px] text-gray-400">All Plots</div>
                </button>
              </div>
            </div>
          </div>

          {/* ──────────── RIGHT SIDEBAR — PLOT DETAILS ──────────── */}
          {showPlotPanel && selectedPlot && (
            <aside className="w-[400px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
              <div className="p-5 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Plot P-{selectedPlot.number}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowPlotPanel(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <span className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full text-white ${STATUS_COLORS[selectedPlot.status]}`}>
                  {getStatusLabel(selectedPlot.status)}
                </span>

                <div className="mt-3 mb-1">
                  <div className="text-[28px] font-bold text-gray-900 leading-tight">
                    ₹ {formatINR(selectedPlot.price)}
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    ₹ {formatINR(
                      selectedPlot.pricePerSqft ||
                        Math.round(selectedPlot.price / (selectedPlot.size || 1))
                    )} / Sq.Ft.
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 mx-5 my-3" />

              <div className="px-5 space-y-3">
                {[
                  { icon: Ruler, label: "Plot Size", value: `${formatINR(selectedPlot.size)} Sq.Ft.` },
                  { icon: Square, label: "Dimensions", value: selectedPlot.dimensions },
                  { icon: Compass, label: "Facing", value: selectedPlot.facing },
                  { icon: Route, label: "Road Width", value: selectedPlot.roadWidth },
                  { icon: Building2, label: "Plot Type", value: selectedPlot.type },
                ].map((d) => {
                  const Icon = d.icon;
                  return (
                    <div key={d.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-[12px] text-gray-500">{d.label}</span>
                      </div>
                      <span className="text-[12px] font-medium text-gray-900">{d.value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mx-5 mt-4 bg-gray-50 rounded-xl p-4">
                <div className="text-[13px] font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Why this plot?
                </div>
                <div className="space-y-1.5">
                  {(selectedPlot.advantages && selectedPlot.advantages.length > 0
                    ? selectedPlot.advantages
                    : DEFAULT_ADVANTAGES
                  ).map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[12px] text-gray-600">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 mt-auto space-y-2.5">
                <button
                  onClick={() => handleBookPlot(selectedPlot)}
                  className="w-full bg-[#1B2B1B] hover:bg-[#263d26] text-white py-3 rounded-xl text-[13px] font-semibold transition-colors"
                >
                  Book This Plot
                </button>
                <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Site Visit
                </button>
              </div>

              <div className="mx-5 mb-5 bg-[#1B2B1B] rounded-xl p-4 text-white relative overflow-hidden">
                <div className="text-[14px] font-bold mb-0.5 flex items-center gap-2">
                  Need Help?
                </div>
                <div className="text-[11px] text-white/70 mb-2.5">Our experts are here to assist you</div>
                <div className="text-[12px] font-medium mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {contact.phone}
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white text-[12px] font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat with Expert
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ════════════════════ PLOT DETAILS MODAL ═════════════════ */}
      {modalPlot && (
        <PlotModal
          plot={modalPlot}
          layout={layout}
          shapeKey={modalKey}
          shapeLabel={modalKey ? labelByKey[modalKey] : null}
          geo={modalKey ? geo[modalKey] : null}
          phone={contact.phone}
          onClose={() => setModalPlot(null)}
          onBook={() => handleBookPlot(modalPlot)}
        />
      )}
    </Shell>
  );
}

/* ───────────────────────────── Plot Modal ──────── */

function CompassBadge({ facing }) {
  const deg = facingToDegrees(facing);
  return (
    <svg viewBox="0 0 44 44" className="w-9 h-9 flex-shrink-0">
      <circle cx="22" cy="22" r="20" fill="none" stroke="#d8cdb0" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="2" fill="#9c7a34" />
      <text x="22" y="8" textAnchor="middle" fontSize="6" fill="#9c9184" fontWeight="700">N</text>
      <g transform={`rotate(${deg} 22 22)`}>
        <path d="M22 8 L25 22 L22 19 L19 22 Z" fill="#9c7a34" />
      </g>
    </svg>
  );
}

function PlotModal({ plot, layout, shapeKey, shapeLabel, geo, phone, onClose, onBook }) {
  const gallery = plot.images && plot.images.length > 0 ? plot.images : null;
  const [imgIndex, setImgIndex] = useState(0);

  const bookable = plot.status === "available" || plot.status === "selected";
  const title = shapeLabel || plot.number;
  const perSqft = plot.pricePerSqft || Math.round(plot.price / (plot.size || 1));
  const perks = plot.advantages && plot.advantages.length > 0 ? plot.advantages : DEFAULT_ADVANTAGES;
  const hasDiscount = Number(plot.discount) > 0 && Number(plot.totalPrice) > 0;

  const specRows = [
    { label: "Plot size", value: `${formatINR(plot.size)} Sq.Ft.` },
    { label: "Dimensions", value: plot.dimensions },
    { label: "Facing", value: plot.facing },
    { label: "Road width", value: plot.roadWidth },
    ...(plot.block ? [{ label: "Block", value: plot.block }] : []),
    ...(plot.floor ? [{ label: "Floor", value: plot.floor }] : []),
    ...(plot.corner ? [{ label: "Corner plot", value: plot.corner }] : []),
    ...(plot.boundaryWall ? [{ label: "Boundary wall", value: plot.boundaryWall }] : []),
    { label: "Plot type", value: plot.type },
  ];

  function prevImage(e) {
    e.stopPropagation();
    if (!gallery) return;
    setImgIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }
  function nextImage(e) {
    e.stopPropagation();
    if (!gallery) return;
    setImgIndex((i) => (i + 1) % gallery.length);
  }

  // Zoomed-in view of this plot cut out of the layout
  const canPreview = !!(layout && geo && shapeKey);
  const pad = canPreview ? Math.max(geo.w, geo.h) * 0.35 : 0;
  const previewBox = canPreview
    ? `${geo.minX - pad} ${geo.minY - pad} ${geo.w + pad * 2} ${geo.h + pad * 2}`
    : null;
  const previewCss = canPreview
    ? `.mini-ctx [data-plot]{opacity:.35}
       .mini-ctx [data-plot="${shapeKey}"]{opacity:1}
       .mini-ctx [data-plot="${shapeKey}"]:is(${SHAPE_SEL}),.mini-ctx [data-plot="${shapeKey}"] :is(${SHAPE_SEL}){
         fill:${STATUS_FILL[plot.status] || STATUS_FILL.available}!important;
         stroke:#1B2B1B!important;stroke-width:${Math.max(geo.w, geo.h) * 0.02}px!important;}`
    : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Plot ${title} details`}
    >
      <div
        className="modal-backdrop absolute inset-0 bg-[#0c0f0a]/78 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="modal-card relative w-full max-w-[820px] h-[93vh] max-h-[820px] overflow-hidden bg-[#fbfaf6] rounded-[20px] shadow-[0_50px_120px_-24px_rgba(0,0,0,0.6)] flex flex-col font-sans">

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-30 w-9 h-9 rounded-full bg-black/25 hover:bg-black/45 backdrop-blur text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ───────── Hero image ───────── */}
        <div className="relative h-[240px] sm:h-[300px] flex-shrink-0 bg-[#12201a] overflow-hidden">
          {gallery ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={imgIndex}
              src={gallery[imgIndex]}
              alt={`Plot ${title}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : canPreview ? (
            <div
              className="absolute inset-0 flex items-center justify-center p-6"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(ellipse at 30% 10%, #21402d 0%, #12201a 70%)",
                backgroundSize: "20px 20px, 100% 100%",
              }}
            >
              <div className="h-full w-full max-w-[300px] rounded-2xl bg-white/95 p-2 shadow-xl">
                <style>{previewCss}</style>
                <svg viewBox={previewBox} className="mini-ctx h-full w-full" fontFamily={FONT}>
                  <g dangerouslySetInnerHTML={{ __html: layout.inner }} />
                </svg>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-5xl font-bold">{title}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f0a]/85 via-black/5 to-black/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent pointer-events-none" />

          {gallery && gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-16 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                    aria-label={`Photo ${i + 1}`}
                    className={`h-1 rounded-full transition-all ${
                      i === imgIndex ? "w-5 bg-white" : "w-1 bg-white/45"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <span className={`absolute left-6 top-6 text-[10.5px] font-semibold tracking-wide px-3 py-1.5 rounded-full text-white shadow-lg ${STATUS_COLORS[plot.status]}`}>
            {getStatusLabel(plot.status)}
          </span>
        </div>

        {/* ───────── Floating overlap card ───────── */}
        <div className="relative z-20 -mt-10 px-6 sm:px-10">
          <div className="bg-white rounded-2xl shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)] border border-[#ece6d8] px-6 py-5 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#9c7a34]">
                {plot.type} · {[plot.block, `Plot ${title}`].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-baseline gap-3 flex-wrap mt-1">
                <div className="font-sans text-[36px] leading-none text-[#1c2620] tracking-tight font-bold">
                  ₹{formatINR(plot.price)}
                </div>
                {hasDiscount && (
                  <div className="text-[14px] text-gray-400 line-through">₹{formatINR(plot.totalPrice)}</div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12.5px] text-gray-500">₹{formatINR(perSqft)} per Sq.Ft.</span>
                {hasDiscount && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />
                    {plot.discount}% off
                  </span>
                )}
              </div>
            </div>
            <CompassBadge facing={plot.facing} />
          </div>
        </div>

        {/* ───────── Scrollable body ───────── */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 pt-6 pb-4">
          <div className="max-w-[620px] mx-auto">
            {plot.description && (
              <p className="text-[14px] text-[#4c4a43] leading-relaxed italic border-l-2 border-[#d8cdb0] pl-4">
                {plot.description}
              </p>
            )}

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-[#9c7a34]">SPECIFICATION</span>
                <span className="flex-1 h-px bg-[#e6ddc8]" />
              </div>
              <div>
                {specRows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-2.5 ${
                      i !== specRows.length - 1 ? "border-b border-[#ece6d8]" : ""
                    }`}
                  >
                    <span className="text-[13px] text-gray-500">{row.label}</span>
                    <span className="text-[13.5px] font-semibold text-[#1c2620]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-[#9c7a34]">HIGHLIGHTS</span>
                <span className="flex-1 h-px bg-[#e6ddc8]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {perks.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 rounded-full border border-[#d8cdb0] px-3 py-1.5 text-[12px] text-[#3d3a33]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#4a7c59]" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ───────── Glass footer CTA ───────── */}
        <div className="flex-shrink-0 border-t border-[#ece6d8] bg-white/80 backdrop-blur-md px-6 sm:px-10 py-4">
          <div className="max-w-[620px] mx-auto flex gap-3">
            <button
              onClick={onBook}
              disabled={!bookable}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13.5px] font-semibold tracking-wide transition-all ${
                bookable
                  ? "bg-[#1c2620] hover:bg-[#263d26] text-white shadow-lg shadow-black/20 hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {bookable ? "Reserve This Plot" : plot.status === "booked" ? "Already booked" : "Currently unavailable"}
              {bookable && <ArrowRight className="w-4 h-4" />}
            </button>
            <a
              href={`tel:${String(phone || "").replace(/\s+/g, "")}`}
              className="flex items-center justify-center gap-2 px-5 rounded-xl border border-[#d8cdb0] text-[#1c2620] hover:bg-[#f4f0e6] text-[13px] font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            <button
              className="flex items-center justify-center w-12 rounded-xl border border-[#d8cdb0] text-[#6b675c] hover:bg-[#f4f0e6] transition-colors"
              aria-label="Save"
              title="Save"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              className="flex items-center justify-center w-12 rounded-xl border border-[#d8cdb0] text-[#6b675c] hover:bg-[#f4f0e6] transition-colors"
              aria-label="Share"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10.5px] text-gray-400 mt-2.5 text-center">
            Need help choosing? Our team is at {phone}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Play Icon (not in lucide) ─────────────────────────────
function Play(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
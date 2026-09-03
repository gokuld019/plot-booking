"use client";

import { useState, useEffect } from "react";
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
  Maximize2,
  Minimize2,
  RotateCw,
  ChevronRight,
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
} from "lucide-react";
import Shell from "@/components/Shell";

/* ───────────────────────────── Config ──────────────────────────────── */

const API_BASE = "https://api.crazystory.in/api/customer";

/* ───────────────────────────── Fallback Data ───────────────────────── */

const FALLBACK_PLOTS = [
  { id: "101", number: "101", row: 0, col: 0, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "102", number: "102", row: 0, col: 1, status: "selected", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "103", number: "103", row: 0, col: 2, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "104", number: "104", row: 0, col: 3, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "105", number: "105", row: 0, col: 4, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "106", number: "106", row: 0, col: 5, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "107", number: "107", row: 0, col: 6, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "108", number: "108", row: 0, col: 7, status: "available", size: 1200, price: 2399000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Corner Plot" },
  { id: "109", number: "109", row: 1, col: 0, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "110", number: "110", row: 1, col: 1, status: "available", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "111", number: "111", row: 1, col: 2, status: "booked", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "112", number: "112", row: 1, col: 3, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "113", number: "113", row: 1, col: 4, status: "available", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "114", number: "114", row: 1, col: 5, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "115", number: "115", row: 1, col: 6, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "116", number: "116", row: 1, col: 7, status: "available", size: 1200, price: 2399000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Corner Plot" },
  { id: "117", number: "117", row: 2, col: 0, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "118", number: "118", row: 2, col: 1, status: "selected", size: 1200, price: 2399000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential", advantages: ["Corner Advantage", "Park Facing", "Near to Main Gate", "Close to Clubhouse"] },
  { id: "119", number: "119", row: 2, col: 2, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "120", number: "120", row: 2, col: 3, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "121", number: "121", row: 2, col: 4, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "122", number: "122", row: 2, col: 5, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "123", number: "123", row: 2, col: 6, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "124", number: "124", row: 2, col: 7, status: "selected", size: 1200, price: 2349000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Corner Plot" },
  { id: "216", number: "216", row: 3, col: 0, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "215", number: "215", row: 3, col: 1, status: "available", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "214", number: "214", row: 3, col: 2, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "213", number: "213", row: 3, col: 3, status: "available", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "212", number: "212", row: 3, col: 4, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "211", number: "211", row: 3, col: 5, status: "sold", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "210", number: "210", row: 3, col: 6, status: "sold", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "209", number: "209", row: 3, col: 7, status: "onhold", size: 1200, price: 2399000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Corner Plot" },
  { id: "217", number: "217", row: 4, col: 0, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "218", number: "218", row: 4, col: 1, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "219", number: "219", row: 4, col: 2, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "220", number: "220", row: 4, col: 3, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "221", number: "221", row: 4, col: 4, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "222", number: "222", row: 4, col: 5, status: "available", size: 1200, price: 2399000, facing: "North", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "223", number: "223", row: 4, col: 6, status: "available", size: 1000, price: 1999000, facing: "North", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "224", number: "224", row: 4, col: 7, status: "available", size: 1200, price: 2399000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Corner Plot" },
  { id: "232", number: "232", row: 5, col: 0, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "233", number: "233", row: 5, col: 1, status: "available", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "234", number: "234", row: 5, col: 2, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "235", number: "235", row: 5, col: 3, status: "selected", size: 1500, price: 2999000, facing: "South", dimensions: "30 x 50", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "236", number: "236", row: 5, col: 4, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "237", number: "237", row: 5, col: 5, status: "available", size: 1200, price: 2399000, facing: "South", dimensions: "30 x 40", roadWidth: "30 FT", type: "Premium Residential" },
  { id: "238", number: "238", row: 5, col: 6, status: "available", size: 1000, price: 1999000, facing: "South", dimensions: "25 x 40", roadWidth: "30 FT", type: "Residential" },
  { id: "239", number: "239", row: 5, col: 7, status: "available", size: 1200, price: 2399000, facing: "East", dimensions: "30 x 40", roadWidth: "30 FT", type: "Corner Plot" },
];

const FALLBACK_AMENITIES = [
  { icon: Shield, label: "24/7 Security" },
  { icon: Route, label: "Wide Roads" },
  { icon: TreePine, label: "Parks & Greenery" },
  { icon: Droplets, label: "Underground Drainage" },
  { icon: Lightbulb, label: "Street Lights" },
  { icon: Wrench, label: "Water Connection" },
];

const STATUS_COLORS = {
  available: "bg-[#4a7c59]",
  selected: "bg-[#3b6bb5]",
  reserved: "bg-[#3b6bb5]",
  booked: "bg-[#c49a2a]",
  sold: "bg-[#6b7280]",
  onhold: "bg-[#7c5c8a]",
  blocked: "bg-[#7c5c8a]",
};

const STATUS_DOT_COLORS = STATUS_COLORS;

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

function parseMoney(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
}

function getStatusLabel(s) {
  return STATUS_LABELS[s] || s;
}

// Convert flat API plot list into the row/col grid the layout expects
function mapApiPlotsToGrid(apiPlots) {
  return apiPlots.map((p, index) => ({
    id: String(p.id ?? index + 1),
    number: (p.plot_number || `PLOT-${index + 1}`).replace(/^PLOT-0*/i, "") || String(index + 1),
    row: Math.floor(index / 8),
    col: index % 8,
    status: normalizeStatus(p.status),
    size: parseMoney(p.area_sqft),
    price: parseMoney(p.final_price || p.total_price),
    pricePerSqft: parseMoney(p.price_per_sqft),
    facing: p.facing || "North",
    dimensions: p.dimension || "—",
    roadWidth: p.road_access || "—",
    type: p.plot_type || "Residential",
    advantages: p.features || [],
    image: p.image,
  }));
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
  const [selectedPlot, setSelectedPlot] = useState(FALLBACK_PLOTS.find((p) => p.id === "118"));
  const [viewMode, setViewMode] = useState("layout");
  const [showPlotPanel, setShowPlotPanel] = useState(true);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

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

  const userName = user?.name || "Priya Sharma";

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

      setProject(data.project || data.project_details || null);
      setContact(data.contact || { phone: "+91 76677 77737" });
      setFiltersMeta(data.filters || null);

      if (Array.isArray(data.amenities) && data.amenities.length > 0) {
        setAmenitiesList(data.amenities);
      }

      if (Array.isArray(data.plots) && data.plots.length > 0) {
        const gridPlots = mapApiPlotsToGrid(data.plots);
        setPlots(gridPlots);
        setSelectedPlot(gridPlots.find((p) => p.status === "available") || gridPlots[0]);
      } else {
        setPlots([]);
        setSelectedPlot(null);
      }

      setApiError(null);
    } catch (err) {
      console.error("Error fetching project:", err);
      setApiError("Live data unavailable — showing demo layout");
      setPlots(FALLBACK_PLOTS);
      setSelectedPlot(FALLBACK_PLOTS.find((p) => p.id === "118"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleApplyFilters() {
    fetchProject();
  }

  const projectName = project?.title || project?.name || "Green Valley";

  function handlePlotClick(plot) {
    if (plot.status === "sold") return;
    setSelectedPlot(plot);
    setShowPlotPanel(true);
  }

  function toggleAmenity(key) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const filteredPlotCount = plots.filter((p) => p.status !== "sold").length;

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

  return (
    <Shell>
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
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[s.status]}`} />
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
            <div className="relative overflow-hidden bg-[#2a3a28]" style={{ height: "460px" }}>
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 text-[13px]">
                  Loading plots...
                </div>
              ) : viewMode === "layout" ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-[560px] relative">
                    <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-[12px] font-bold border border-white/30">
                      <Compass className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      {[0, 1].map((rowNum) => (
                        <div key={rowNum} className="grid grid-cols-8 gap-1">
                          {plots.filter((p) => p.row === rowNum).map((plot) => (
                            <PlotCell
                              key={plot.id}
                              plot={plot}
                              selected={selectedPlot?.id === plot.id}
                              onClick={() => handlePlotClick(plot)}
                            />
                          ))}
                        </div>
                      ))}

                      {plots.some((p) => p.row >= 2) && (
                        <div className="text-center text-[9px] text-white/60 tracking-[0.3em] py-1 font-medium flex items-center justify-center gap-2">
                          <Route className="w-3 h-3" />
                          30 FT ROAD
                        </div>
                      )}

                      {[2, 3].map((rowNum) => (
                        <div key={rowNum} className="grid grid-cols-8 gap-1">
                          {plots.filter((p) => p.row === rowNum).map((plot) => (
                            <PlotCell
                              key={plot.id}
                              plot={plot}
                              selected={selectedPlot?.id === plot.id}
                              onClick={() => handlePlotClick(plot)}
                            />
                          ))}
                        </div>
                      ))}

                      {plots.some((p) => p.row >= 4) && (
                        <div className="text-center text-[9px] text-white/60 tracking-[0.3em] py-1 font-medium flex items-center justify-center gap-2">
                          <Route className="w-3 h-3" />
                          30 FT ROAD
                        </div>
                      )}

                      {[4, 5].map((rowNum) => (
                        <div key={rowNum} className="grid grid-cols-8 gap-1">
                          {plots.filter((p) => p.row === rowNum).map((plot) => (
                            <PlotCell
                              key={plot.id}
                              plot={plot}
                              selected={selectedPlot?.id === plot.id}
                              onClick={() => handlePlotClick(plot)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {plots.length === 0 && (
                      <div className="text-center text-white/70 text-[12px] py-8">
                        No plots match the current filters.
                      </div>
                    )}
                  </div>
                </div>
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
                          <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[plot.status]}`} />
                          <span className="text-white text-[13px] font-semibold">Plot {plot.number}</span>
                          <span className="text-white/50 text-[11px]">{formatINR(plot.size)} Sq.Ft.</span>
                        </div>
                        <span className="text-white text-[13px] font-semibold">₹ {formatINR(plot.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <RotateCw className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              <button className="absolute bottom-3 left-3 bg-[#1B2B1B]/80 hover:bg-[#1B2B1B] backdrop-blur text-white px-3.5 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors">
                <Eye className="w-3.5 h-3.5" />
                3D View
              </button>
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
                    onClick={() => handlePlotClick(rv)}
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
                <button className="flex flex-col items-center justify-center min-w-[80px] rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2.5 transition-colors">
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
                    : ["Corner Advantage", "Park Facing", "Near to Main Gate", "Close to Clubhouse"]
                  ).map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[12px] text-gray-600">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 mt-auto space-y-2.5">
                <button className="w-full bg-[#1B2B1B] hover:bg-[#263d26] text-white py-3 rounded-xl text-[13px] font-semibold transition-colors">
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
    </Shell>
  );
}

/* ───────────────────────────── Plot Cell ───────────────────────────── */

function PlotCell({ plot, selected, onClick }) {
  const colorMap = {
    available: selected ? "bg-[#3b6bb5] text-white" : "bg-[#4a7c59]/80 text-white hover:bg-[#4a7c59]",
    selected: "bg-[#3b6bb5] text-white",
    booked: "bg-[#c49a2a]/80 text-white",
    sold: "bg-[#6b7280]/60 text-white/70 cursor-not-allowed",
    onhold: "bg-[#7c5c8a]/80 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={plot.status === "sold"}
      className={`py-2 rounded text-[11px] font-semibold transition-all ${colorMap[plot.status]} ${
        selected ? "ring-2 ring-white ring-offset-1 ring-offset-[#2a3a28] scale-105" : ""
      }`}
    >
      {plot.number}
    </button>
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
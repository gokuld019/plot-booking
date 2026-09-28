"use client";

import { useState } from "react";
import {
  LayoutGrid, Building2, ClipboardList, PauseCircle, Search, ChevronDown,
  SlidersHorizontal, RotateCcw, List, Map, MapPin, Plus, Minus, Maximize2,
  Box, ArrowRight, ChevronLeft, ChevronRight, ClipboardCheck, Wallet,
  Heart, User, Sprout
} from "lucide-react";
import Shell from "@/components/Shell";


const stats = [
  { icon: LayoutGrid, tint: "bg-red-50 text-red-800", label: "Total Plots", value: "342" },
  { icon: Building2, tint: "bg-red-50 text-red-800", label: "Available", value: "178" },
  { icon: ClipboardList, tint: "bg-amber-50 text-amber-600", label: "Booked", value: "120" },
  { icon: PauseCircle, tint: "bg-violet-50 text-violet-600", label: "On Hold", value: "44" },
];

const filters = ["All Projects", "All Sizes", "All Facing", "All Status"];

const legend = [
  { label: "Available", color: "#86b04a" },
  { label: "Booked", color: "#e0a53a" },
  { label: "On Hold", color: "#a78bfa" },
  { label: "Sold", color: "#9ca3af" },
];

// row layout for the site map
const mapRows = [
  ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110"],
  ["111", "112", "113", "114", "115", "116", "117", "118", "119", "120"],
  ["121", "122", "123", "124", "125", "126", "127", "128", "129", "130"],
];

const plotState = {
  102: "booked", 106: "booked", 117: "hold", 124: "sold",
};

const plotColors = {
  available: "bg-[#86b04a] text-white",
  booked: "bg-[#e0a53a] text-white",
  hold: "bg-[#a78bfa] text-white",
  sold: "bg-neutral-400 text-white",
};

const rows = [
  { no: "P-118", project: "Green Valley", size: "1200", facing: "East", status: "Available", price: "₹ 23,99,000" },
  { no: "P-101", project: "Green Valley", size: "1000", facing: "North", status: "Available", price: "₹ 19,99,000" },
  { no: "P-235", project: "Elite Residency", size: "1500", facing: "West", status: "Available", price: "₹ 29,99,000" },
  { no: "P-124", project: "SRI Grandeur", size: "1200", facing: "East", status: "On Hold", price: "₹ 23,49,000" },
  { no: "P-217", project: "SRI Grandeur", size: "1800", facing: "North", status: "Booked", price: "-" },
  { no: "P-142", project: "Green Valley", size: "1200", facing: "West", status: "Booked", price: "-" },
];

const statusStyles = {
  Available: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-violet-50 text-violet-600",
  Booked: "bg-amber-50 text-amber-700",
  Sold: "bg-neutral-100 text-neutral-500",
};

const quickLinks = [
  { icon: ClipboardCheck, title: "My Bookings", desc: "2 Active Bookings" },
  { icon: Wallet, title: "Payment History", desc: "View your transactions" },
  { icon: Heart, title: "Saved Plots", desc: "3 Plots Saved" },
  { icon: User, title: "Profile Settings", desc: "Manage your profile" },
];

export default function InventoryPage() {
  const [view, setView] = useState("map");

  return (
    <Shell>
    <div className="grid gap-5 text-[#1f1f1f] xl:grid-cols-[1fr_280px]">
      {/* Left column */}
      <div className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          {/* Header + stats */}
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                Plot Inventory <Sprout className="h-5 w-5 text-red-800" />
              </h2>
              <p className="text-sm text-neutral-500">Choose from 342 premium plots across our projects.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.map(({ icon: Icon, tint, label, value }) => (
                <div key={label} className="flex min-w-[120px] items-center gap-3 rounded-xl border border-black/5 px-4 py-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tint}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500">{label}</p>
                    <p className="text-lg font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-black/5 p-3">
            <div className="relative min-w-[220px] flex-1">
              <input
                placeholder="Search by project, plot no. or keyword..."
                className="h-10 w-full rounded-lg border border-black/10 pl-4 pr-10 text-sm outline-none focus:border-red-800/40"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>

            {filters.map((f) => (
              <div key={f} className="relative">
                <select className="h-10 w-[120px] appearance-none rounded-lg border border-black/10 bg-white px-3 pr-8 text-[13px] outline-none">
                  <option>{f}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              </div>
            ))}

            <button className="flex h-10 items-center gap-2 rounded-lg border border-black/10 px-4 text-[13px] font-medium transition hover:bg-neutral-50">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
            <button className="flex h-10 items-center gap-2 px-2 text-[13px] font-medium text-neutral-500 transition hover:text-neutral-800">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </section>

        {/* Map / list */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Green Valley</p>
              <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin className="h-3.5 w-3.5" /> Guduvanchery, Chennai
              </p>
            </div>

            <div className="flex gap-1 rounded-lg border border-black/5 bg-neutral-50 p-1">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium transition ${
                  view === "list" ? "bg-white shadow-sm" : "text-neutral-500"
                }`}
              >
                <List className="h-4 w-4" /> List View
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium transition ${
                  view === "map" ? "bg-red-800 text-white" : "text-neutral-500"
                }`}
              >
                <Map className="h-4 w-4" /> Map View
              </button>
            </div>
          </div>

          {/* Site map */}
          <div className="relative overflow-hidden rounded-xl border border-black/5">
            <img src="/site-map-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />

            {/* Legend */}
            <div className="absolute left-4 top-4 z-10 space-y-1.5 rounded-lg bg-white/95 p-3 shadow-sm">
              {legend.map((l) => (
                <p key={l.label} className="flex items-center gap-2 text-[11px] font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </p>
              ))}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col overflow-hidden rounded-lg bg-white/95 shadow-sm">
              {[Plus, Minus, Maximize2].map((Icon, i) => (
                <button key={i} className="grid h-9 w-9 place-items-center border-b border-black/5 last:border-0 hover:bg-neutral-50">
                  <Icon className="h-4 w-4 text-neutral-600" />
                </button>
              ))}
            </div>

            {/* View in 3D */}
            <button className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold shadow-sm transition hover:bg-white">
              <Box className="h-4 w-4" /> View in 3D
            </button>

            {/* Plot grid */}
            <div className="relative space-y-1 px-24 py-8">
              {mapRows.map((row, ri) => (
                <div key={ri}>
                  <div className="grid grid-cols-10 gap-1">
                    {row.map((p) => (
                      <button
                        key={p}
                        className={`grid h-11 place-items-center rounded text-[11px] font-semibold transition hover:brightness-110 ${
                          plotColors[plotState[p] || "available"]
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {ri < mapRows.length - 1 && (
                    <p className="py-1.5 text-center text-[9px] font-medium tracking-wider text-white/80">
                      30 FT ROAD
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="border-b border-black/5 bg-neutral-50 text-left text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Plot No.</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Size (Sq.Ft.)</th>
                  <th className="px-4 py-3 font-medium">Facing</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price (₹)</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rows.map((r) => (
                  <tr key={r.no}>
                    <td className="px-4 py-3 font-semibold">{r.no}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.project}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.size}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.facing}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${statusStyles[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.price}</td>
                    <td className="px-4 py-3">
                      <button className="rounded-lg border border-red-800/30 px-4 py-1.5 text-[12px] font-semibold text-red-800 transition hover:bg-red-50">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">Showing 1 to 6 of 342 plots</p>
            <div className="flex items-center gap-1.5">
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-neutral-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                    p === 1 ? "bg-red-800 text-white" : "border border-black/10 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <span className="px-1 text-neutral-400">…</span>
              <button className="h-9 w-9 rounded-lg border border-black/10 text-sm font-medium hover:bg-neutral-50">57</button>
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-neutral-500">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Right column */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">Hi Priya! 👋</h3>
              <p className="mt-1 text-xs text-neutral-500">Manage your bookings and stay updated.</p>
            </div>
            <Sprout className="h-8 w-8 shrink-0 text-red-800" strokeWidth={1.4} />
          </div>

          <ul className="mt-4 space-y-1">
            {quickLinks.map(({ icon: Icon, title, desc }) => (
              <li key={title}>
                <a href="#" className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-neutral-50">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-100">
                    <Icon className="h-4 w-4 text-neutral-600" strokeWidth={1.6} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold">{title}</p>
                    <p className="text-[11px] text-neutral-500">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-red-800 p-5 text-white">
          <img src="/plot-cta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative">
            <h3 className="font-bold">Own Your Dream Plot</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              Build today,<br />Live tomorrow.
            </p>
            <button className="mt-20 flex items-center gap-2 rounded-lg bg-black/40 px-5 py-2.5 text-[13px] font-semibold backdrop-blur transition hover:bg-black/60">
              Book a Site Visit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="mb-4 font-bold">Plot Inventory Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, tint, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-xl border border-black/5 p-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tint}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500">{label}</p>
                  <p className="text-[15px] font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg bg-red-800 py-3 text-sm font-semibold text-white transition hover:bg-red-900">
            Explore All Projects
          </button>
        </section>
      </aside>
    </div>
    </Shell>
  );
}
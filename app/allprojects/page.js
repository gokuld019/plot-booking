"use client";

import { useState } from "react";
import {
  Building2, LayoutGrid, CheckCircle2, Clock, Search, ChevronDown,
  SlidersHorizontal, RotateCcw, MapPin, ArrowRight, Heart, Star,
  ChevronLeft, ChevronRight, Sprout, Calendar, Phone, Headphones,
  Ruler, Compass, Wallet, ShieldCheck
} from "lucide-react";
import Shell from "@/components/Shell";


const stats = [
  { icon: Building2, tint: "bg-emerald-50 text-emerald-700", label: "Total Projects", value: "8" },
  { icon: LayoutGrid, tint: "bg-green-50 text-green-600", label: "Ongoing", value: "5" },
  { icon: CheckCircle2, tint: "bg-amber-50 text-amber-600", label: "Completed", value: "2" },
  { icon: Clock, tint: "bg-violet-50 text-violet-600", label: "Upcoming", value: "1" },
];

const filters = ["All Locations", "All Sizes", "All Budgets", "All Status"];

const projects = [
  {
    name: "Green Valley",
    location: "Guduvanchery, Chennai",
    img: "/plot-1.jpg",
    status: "Ongoing",
    tag: "DTCP Approved",
    plots: "120 Plots",
    available: "48 Available",
    size: "1000 - 2400 Sq.Ft.",
    price: "₹ 19,99,000",
    rating: "4.8",
  },
  {
    name: "Elite Residency",
    location: "Oragadam, Chennai",
    img: "/plot-2.jpg",
    status: "Ongoing",
    tag: "RERA Approved",
    plots: "96 Plots",
    available: "35 Available",
    size: "1200 - 3000 Sq.Ft.",
    price: "₹ 24,99,000",
    rating: "4.7",
  },
  {
    name: "SRI Grandeur",
    location: "Sriperumbudur, Chennai",
    img: "/plot-3.jpg",
    status: "Ongoing",
    tag: "DTCP Approved",
    plots: "78 Plots",
    available: "52 Available",
    size: "1200 - 1800 Sq.Ft.",
    price: "₹ 21,49,000",
    rating: "4.6",
  },
  {
    name: "Palm Meadows",
    location: "Kelambakkam, Chennai",
    img: "/plot-4.jpg",
    status: "Completed",
    tag: "Sold Out",
    plots: "64 Plots",
    available: "0 Available",
    size: "1000 - 2000 Sq.Ft.",
    price: "₹ 18,99,000",
    rating: "4.9",
  },
  {
    name: "Lake View Enclave",
    location: "Thiruporur, Chennai",
    img: "/plot-5.jpg",
    status: "Upcoming",
    tag: "Pre-Launch",
    plots: "84 Plots",
    available: "Coming Soon",
    size: "1500 - 3200 Sq.Ft.",
    price: "₹ 26,99,000",
    rating: "New",
  },
  {
    name: "Sunrise Gardens",
    location: "Chengalpattu, Chennai",
    img: "/plot-6.jpg",
    status: "Ongoing",
    tag: "DTCP Approved",
    plots: "110 Plots",
    available: "43 Available",
    size: "1000 - 2600 Sq.Ft.",
    price: "₹ 17,99,000",
    rating: "4.5",
  },
];

const statusStyles = {
  Ongoing: "bg-emerald-50 text-emerald-700",
  Completed: "bg-neutral-100 text-neutral-500",
  Upcoming: "bg-violet-50 text-violet-600",
};

const tabs = ["All Projects", "Ongoing", "Completed", "Upcoming"];

const highlights = [
  { icon: ShieldCheck, title: "Clear Titles", desc: "100% legally verified" },
  { icon: Ruler, title: "Flexible Sizes", desc: "1000 – 3200 Sq.Ft." },
  { icon: Compass, title: "Vaastu Compliant", desc: "All facing options" },
  { icon: Wallet, title: "Easy Finance", desc: "Bank loans available" },
];

const quickLinks = [
  { icon: LayoutGrid, title: "Plot Inventory", desc: "342 plots available" },
  { icon: Calendar, title: "Site Visits", desc: "1 visit scheduled" },
  { icon: Heart, title: "Saved Projects", desc: "3 projects saved" },
];

export default function ProjectsPage() {
  const [tab, setTab] = useState("All Projects");
  const visible = tab === "All Projects" ? projects : projects.filter((p) => p.status === tab);

  return (
    <Shell>
    <div className="grid gap-5 text-[#1c2b23] xl:grid-cols-[1fr_280px]">
      {/* Left column */}
      <div className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                Our Projects <Sprout className="h-5 w-5 text-emerald-600" />
              </h2>
              <p className="text-sm text-neutral-500">Explore 8 premium plotted developments across Chennai.</p>
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
                placeholder="Search by project name or location..."
                className="h-10 w-full rounded-lg border border-black/10 pl-4 pr-10 text-sm outline-none focus:border-emerald-700/40"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>

            {filters.map((f) => (
              <div key={f} className="relative">
                <select className="h-10 w-[130px] appearance-none rounded-lg border border-black/10 bg-white px-3 pr-8 text-[13px] outline-none">
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

        {/* Project grid */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">All Projects</h3>
            <div className="flex gap-1 rounded-lg border border-black/5 bg-neutral-50 p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-md px-4 py-2 text-[13px] font-medium transition ${
                    tab === t ? "bg-white text-[#173d2c] shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {visible.map((p) => (
              <article key={p.name} className="overflow-hidden rounded-xl border border-black/5 transition hover:shadow-md">
                <div className="relative">
                  <img src={p.img} alt="" className="h-[150px] w-full object-cover" />
                  <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-medium ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                  <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-500 transition hover:text-rose-500">
                    <Heart className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
                  </span>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold">{p.name}</h4>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        {p.tag}
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3">
                    <div>
                      <p className="text-[10px] text-neutral-500">Total Plots</p>
                      <p className="text-[13px] font-semibold">{p.plots}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">Availability</p>
                      <p className="text-[13px] font-semibold">{p.available}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">Plot Sizes</p>
                      <p className="text-[13px] font-semibold">{p.size}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">Starting From</p>
                      <p className="text-[13px] font-semibold">{p.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg bg-[#173d2c] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0f2b1e]">
                      View Details
                    </button>
                    <button className="flex-1 rounded-lg border border-emerald-800/30 py-2.5 text-[13px] font-semibold text-emerald-900 transition hover:bg-emerald-50">
                      Book a Visit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">Showing 1 to {visible.length} of 8 projects</p>
            <div className="flex items-center gap-1.5">
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-neutral-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2].map((n) => (
                <button
                  key={n}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                    n === 1 ? "bg-[#4b7c2f] text-white" : "border border-black/10 hover:bg-neutral-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-neutral-500">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Highlights banner */}
        <section className="flex flex-wrap items-center gap-6 rounded-2xl border border-black/5 bg-white px-5 py-4">
          <div className="flex min-w-[240px] flex-1 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#173d2c]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Why Choose SRI Housing Infra?</p>
              <p className="text-xs text-neutral-500">Trusted legacy of quality plotted developments.</p>
            </div>
          </div>
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-2.5">
              <Icon className="mt-0.5 h-4 w-4 text-emerald-700" />
              <div>
                <p className="text-xs font-semibold">{title}</p>
                <p className="max-w-[120px] text-[10px] leading-tight text-neutral-500">{desc}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Right column */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">Hi Priya! 👋</h3>
              <p className="mt-1 text-xs text-neutral-500">Find your perfect plot today.</p>
            </div>
            <Sprout className="h-8 w-8 shrink-0 text-emerald-500" strokeWidth={1.4} />
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

        <section className="relative overflow-hidden rounded-2xl bg-[#173d2c] p-5 text-white">
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

        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="mb-4 font-bold">Project Summary</h3>
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
          <button className="mt-4 w-full rounded-lg bg-[#173d2c] py-3 text-sm font-semibold text-white transition hover:bg-[#0f2b1e]">
            Browse Plot Inventory
          </button>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-[#173d2c] p-5 text-white">
          <img src="/support-agent.png" alt="" className="absolute bottom-0 right-0 h-[85%] object-contain" />
          <div className="relative max-w-[62%]">
            <h3 className="font-bold">Need Help?</h3>
            <p className="mt-1 text-xs text-white/70">Our experts are here to assist you</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4" /> +91 76677 77737
            </p>
            <button className="mt-4 flex items-center gap-2 rounded-lg bg-[#0f2b1e] px-4 py-2.5 text-[13px] font-semibold transition hover:bg-black/30">
              <Headphones className="h-4 w-4" /> Chat with Expert
            </button>
          </div>
        </section>
      </aside>
    </div>
    </Shell>
  );
}
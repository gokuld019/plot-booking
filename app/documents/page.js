"use client";

import { useState } from "react";
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Search, SlidersHorizontal,
  Eye, Download, Mail, ChevronDown, ChevronLeft, ChevronRight, Lightbulb,
  Check, MessageSquare, FilePlus, ArrowRight, ShieldCheck, Lock, Globe
} from "lucide-react";
import Shell from "@/components/Shell";


const stats = [
  { icon: FileText, tint: "bg-emerald-50 text-emerald-700", label: "Total Documents", value: "18", sub: "All Documents" },
  { icon: CheckCircle2, tint: "bg-green-50 text-green-600", label: "Verified", value: "12", sub: "Documents" },
  { icon: Clock, tint: "bg-amber-50 text-amber-600", label: "Pending", value: "4", sub: "Documents" },
  { icon: AlertTriangle, tint: "bg-rose-50 text-rose-500", label: "Action Required", value: "2", sub: "Documents" },
];

const tabs = ["All Documents", "Verified", "Pending", "Action Required"];

const docs = [
  { name: "Sale Agreement", desc: "Property sale agreement document", plot: "Plot P-118", project: "Green Valley", date: "12 May 2024", status: "Verified", tint: "bg-emerald-50 text-emerald-600" },
  { name: "Payment Receipt", desc: "Advance payment receipt", plot: "Plot P-118", project: "Green Valley", date: "12 May 2024", status: "Verified", tint: "bg-amber-50 text-amber-600" },
  { name: "ID Proof", desc: "Aadhaar Card", plot: "Priya Sharma", date: "10 May 2024", status: "Verified", tint: "bg-blue-50 text-blue-600" },
  { name: "Address Proof", desc: "Address proof document", plot: "Priya Sharma", date: "10 May 2024", status: "Verified", tint: "bg-violet-50 text-violet-600" },
  { name: "Patta / Chitta", desc: "Land ownership document", plot: "Plot P-235", project: "Elite Residency", date: "08 May 2024", status: "Pending", tint: "bg-orange-50 text-orange-600" },
  { name: "Encumbrance Certificate", desc: "Legal clearance certificate", plot: "Plot P-235", project: "Elite Residency", date: "08 May 2024", status: "Pending", tint: "bg-amber-50 text-amber-600" },
  { name: "Bank Loan Sanction Letter", desc: "Loan approval document", plot: "Plot P-118", project: "Green Valley", date: "05 May 2024", status: "Action Required", tint: "bg-rose-50 text-rose-600" },
];

const statusStyles = {
  Verified: { cls: "bg-emerald-50 text-emerald-700", icon: Check },
  Pending: { cls: "bg-amber-50 text-amber-700", icon: Clock },
  "Action Required": { cls: "bg-rose-50 text-rose-600", icon: AlertTriangle },
};

const donut = [
  { label: "Verified", count: 12, pct: "67%", color: "#15803d" },
  { label: "Pending", count: 4, pct: "22%", color: "#f59e0b" },
  { label: "Action Required", count: 2, pct: "11%", color: "#ef4444" },
];

const tips = [
  "Upload clear and valid documents for faster verification.",
  "Ensure documents are in PDF, JPG or PNG format.",
  "Max file size allowed is 10MB per document.",
];

const trust = [
  { icon: Lock, title: "Secure Storage", desc: "256-bit encrypted secure storage" },
  { icon: ShieldCheck, title: "Privacy Protected", desc: "Your data is safe and confidential" },
  { icon: Globe, title: "Easy Access", desc: "Access anywhere, anytime" },
];

export default function DocumentsPage() {
  const [tab, setTab] = useState("All Documents");
  const visible = tab === "All Documents" ? docs : docs.filter((d) => d.status === tab);

  // donut geometry
  const R = 54, C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <Shell>
    <div className="grid gap-5 text-[#1c2b23] xl:grid-cols-[1fr_300px]">
      {/* Left column */}
      <div className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-1 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50">
              <FileText className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-xl font-bold">My Documents</h2>
          </div>
          <p className="mb-5 text-sm text-neutral-500">View, download and manage all your property related documents.</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ icon: Icon, tint, label, value, sub }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-black/5 p-4">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tint}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-500">{label}</p>
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-[10px] text-neutral-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-5">
          {/* Tabs + search */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  placeholder="Search documents..."
                  className="h-10 w-[240px] rounded-lg border border-black/10 pl-10 pr-4 text-sm outline-none focus:border-emerald-700/40"
                />
              </div>
              <button className="flex h-10 items-center gap-2 rounded-lg border border-black/10 px-4 text-sm font-medium transition hover:bg-neutral-50">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="border-b border-black/5 bg-neutral-50 text-left text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-1">
                      <ChevronDown className="h-3.5 w-3.5" /> Document Name
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium">Related To</th>
                  <th className="px-4 py-3 font-medium">Uploaded On</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {visible.map((d) => {
                  const { cls, icon: SIcon } = statusStyles[d.status];
                  const disabled = d.status !== "Verified";
                  return (
                    <tr key={d.name}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${d.tint}`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{d.name}</p>
                            <p className="text-xs text-neutral-500">{d.desc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p>{d.plot}</p>
                        {d.project && <p className="text-xs text-neutral-500">{d.project}</p>}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{d.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium ${cls}`}>
                          <SIcon className="h-3 w-3" /> {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-50">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            disabled={disabled && d.status === "Pending"}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-40"
                          >
                            {d.status === "Action Required"
                              ? <Mail className="h-4 w-4" />
                              : <Download className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">Showing 1 to 7 of 18 documents</p>
            <div className="flex items-center gap-1.5">
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-neutral-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                    p === 1 ? "bg-emerald-50 text-emerald-800" : "border border-black/10 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-neutral-500">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Trust banner */}
        <section className="flex flex-wrap items-center gap-6 rounded-2xl border border-black/5 bg-white px-5 py-4">
          <div className="flex min-w-[280px] flex-1 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#173d2c]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Your Documents. Our Priority.</p>
              <p className="text-xs text-neutral-500">We ensure the highest security and privacy for all your documents.</p>
            </div>
          </div>
          {trust.map(({ icon: Icon, title, desc }) => (
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
        {/* Summary donut */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="mb-4 font-bold">Document Summary</h3>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                <circle cx="66" cy="66" r={R} fill="none" stroke="#f1f1ef" strokeWidth="16" />
                {donut.map((d) => {
                  const len = (d.count / 18) * C;
                  const el = (
                    <circle
                      key={d.label}
                      cx="66" cy="66" r={R} fill="none"
                      stroke={d.color} strokeWidth="16"
                      strokeDasharray={`${len} ${C - len}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += len;
                  return el;
                })}
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-[10px] text-neutral-400">Total</p>
                </div>
              </div>
            </div>

            <ul className="flex-1 space-y-3 text-sm">
              {donut.map((d) => (
                <li key={d.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="font-semibold">{d.count}</span>
                  <span className="text-neutral-600">{d.label}</span>
                  <span className="ml-auto text-xs text-neutral-400">({d.pct})</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tips */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold">Tips</h3>
          </div>
          <ul className="space-y-3">
            {tips.map((t) => (
              <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-neutral-600">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Need help */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="font-bold">Need Help?</h3>
          <p className="mt-1 text-xs text-neutral-500">Our experts are here to help you.</p>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#173d2c] py-3 text-sm font-semibold text-white transition hover:bg-[#0f2b1e]">
            Chat with Expert <MessageSquare className="h-4 w-4" />
          </button>
          <p className="my-3 text-center text-xs text-neutral-400">or</p>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 py-3 text-sm font-semibold transition hover:bg-neutral-50">
            Raise a Request <FilePlus className="h-4 w-4" />
          </button>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-[#173d2c] p-5 text-white">
          <img src="/plot-cta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="relative">
            <h3 className="text-[15px] font-bold leading-snug">
              Your Dream Plot<br />Is Just a Step Away!
            </h3>
            <p className="mt-2 text-xs text-white/70">
              We're here to make your journey smooth &amp; secure.
            </p>
            <button className="mt-16 flex items-center gap-2 rounded-lg bg-[#0f2b1e]/80 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-[#0f2b1e]">
              Explore Projects <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </aside>
    </div>
    </Shell>
  );
}
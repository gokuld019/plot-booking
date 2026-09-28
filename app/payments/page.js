"use client";

import {
  Wallet, CheckCircle2, CalendarDays, FileText, Bell, ShieldCheck,
  ArrowRight, Download, ChevronDown, CreditCard, Smartphone, Building2, Calendar
} from "lucide-react";
import Shell from "@/components/Shell";


const overview = [
  { icon: Wallet, tint: "bg-red-50 text-red-800", label: "Total Investment", value: "₹ 53,98,000", sub: "Across 2 Bookings" },
  { icon: CheckCircle2, tint: "bg-green-50 text-green-600", label: "Total Paid", value: "₹ 21,59,100", sub: "40% of Total" },
  { icon: CalendarDays, tint: "bg-amber-50 text-amber-600", label: "Upcoming Dues", value: "₹ 5,00,000", sub: "1 Payment Due" },
  { icon: FileText, tint: "bg-rose-50 text-rose-500", label: "Balance Amount", value: "₹ 27,38,900", sub: "60% Pending" },
];

const schedule = [
  { n: 1, milestone: "Booking Amount", due: "12 May 2024", amount: "₹ 2,39,900", status: "Paid", action: "receipt" },
  { n: 2, milestone: "Agreement Amount", due: "12 Jun 2024", amount: "₹ 5,00,000", status: "Due Soon", action: "pay" },
  { n: 3, milestone: "90 Days from Booking", due: "12 Aug 2024", amount: "₹ 7,00,000", status: "Upcoming" },
  { n: 4, milestone: "180 Days from Booking", due: "12 Nov 2024", amount: "₹ 7,00,000", status: "Upcoming" },
  { n: 5, milestone: "On Registration", due: "12 Feb 2025", amount: "₹ 8,00,000", status: "Upcoming" },
  { n: 6, milestone: "On Possession", due: "12 May 2025", amount: "₹ 24,58,100", status: "Upcoming" },
];

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-700",
  "Due Soon": "bg-amber-50 text-amber-700",
  Upcoming: "bg-blue-50 text-blue-600",
  Success: "bg-emerald-50 text-emerald-700",
};

const transactions = [
  { date: "12 May 2024", id: "TXN1212456789", for: "Booking Amount - P-118", amount: "₹ 2,39,900", mode: "UPI", icon: Smartphone },
  { date: "10 May 2024", id: "TXN1212456701", for: "Token Amount - P-118", amount: "₹ 10,000", mode: "Card", icon: CreditCard },
  { date: "08 May 2024", id: "TXN1212456602", for: "Booking Amount - P-235", amount: "₹ 1,00,000", mode: "Net Banking", icon: Building2 },
];

const summary = [
  ["Total Investment", "₹ 53,98,000"],
  ["Total Paid", "₹ 21,59,100"],
  ["Upcoming Dues", "₹ 5,00,000"],
  ["Balance Amount", "₹ 27,38,900"],
];

export default function PaymentsPage() {
  return (
    <Shell>
    <div className="grid gap-5 text-[#1f1f1f] xl:grid-cols-[1fr_300px]">
      {/* Left column */}
      <div className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-1 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50">
              <Wallet className="h-4 w-4 text-red-800" />
            </div>
            <h2 className="text-xl font-bold">Payments</h2>
          </div>
          <p className="mb-5 text-sm text-neutral-500">Overview of your payment status and transaction history.</p>

          {/* Payment Overview */}
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="mb-3 text-sm font-semibold">Payment Overview</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overview.map(({ icon: Icon, tint, label, value, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500">{label}</p>
                    <p className="text-[15px] font-bold">{value}</p>
                    <p className="text-[10px] text-neutral-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Due alert */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6ed] px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold">You have 1 payment due</p>
                <p className="text-xs text-neutral-500">Next payment of ₹ 5,00,000 is due on 12 Jun 2024</p>
              </div>
            </div>
            <button className="rounded-lg bg-red-800 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900">
              Pay Now
            </button>
          </div>

          {/* Schedule */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Payment Schedule</h3>
            <div className="relative">
              <select className="h-10 w-[220px] appearance-none rounded-lg border border-black/10 bg-white px-4 pr-9 text-sm outline-none">
                <option>Plot P-118 - Green Valley</option>
                <option>Plot P-235 - Sunrise Enclave</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="border-b border-black/5 bg-neutral-50 text-left text-xs text-neutral-500">
                <tr>
                  <th className="w-12 px-4 py-3 font-medium"></th>
                  <th className="px-4 py-3 font-medium">Milestone</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Amount (₹)</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {schedule.map((r) => (
                  <tr key={r.n}>
                    <td className="px-4 py-3 text-neutral-400">{r.n}</td>
                    <td className="px-4 py-3">{r.milestone}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.due}</td>
                    <td className="px-4 py-3 font-medium">{r.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${statusStyles[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.action === "receipt" && (
                        <a href="#" className="text-[13px] font-medium text-red-800">View Receipt</a>
                      )}
                      {r.action === "pay" && (
                        <button className="rounded-lg border border-red-800/30 px-5 py-1.5 text-[13px] font-semibold text-red-800 transition hover:bg-red-50">
                          Pay Now
                        </button>
                      )}
                      {!r.action && <span className="text-neutral-300">—</span>}
                    </td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 font-semibold">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">₹ 53,98,000</td>
                  <td colSpan={2} className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Secure payments */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#faf6ed] px-4 py-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold">Secure Payments</p>
                <p className="text-xs text-neutral-500">Your payments are safe with 256-bit encryption and secured gateways.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {["RuPay", "VISA", "Mastercard", "UPI", "Net Banking"].map((m) => (
                <span key={m} className="rounded-md border border-black/5 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Recent transactions */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent Transactions</h3>
            <a href="#" className="flex items-center gap-1 text-sm font-medium text-red-800">
              View All Transactions <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-sm">
              <thead className="border-b border-black/5 bg-neutral-50 text-left text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                  <th className="px-4 py-3 font-medium">For</th>
                  <th className="px-4 py-3 font-medium">Amount (₹)</th>
                  <th className="px-4 py-3 font-medium">Payment Mode</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {transactions.map((t) => {
                  const Icon = t.icon;
                  return (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-neutral-600">{t.date}</td>
                      <td className="px-4 py-3 text-neutral-600">{t.id}</td>
                      <td className="px-4 py-3">{t.for}</td>
                      <td className="px-4 py-3 font-medium">{t.amount}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-neutral-600">
                          <Icon className="h-4 w-4 text-neutral-400" /> {t.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                          Success
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-neutral-400 transition hover:text-red-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right column */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Upcoming Payment</h3>
            <Calendar className="h-4 w-4 text-red-800" />
          </div>

          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">Agreement Amount</p>
                <p className="text-xl font-bold">₹ 5,00,000</p>
              </div>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">Due Soon</span>
            </div>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Plot</dt>
              <dd className="font-medium">P-118 - Green Valley</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Due Date</dt>
              <dd className="font-medium">12 Jun 2024 <span className="text-neutral-400">(In 5 days)</span></dd>
            </div>
          </dl>

          <button className="mt-5 w-full rounded-lg bg-red-800 py-3 text-sm font-semibold text-white transition hover:bg-red-900">
            Pay Now
          </button>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 py-3 text-sm font-semibold transition hover:bg-neutral-50">
            <Download className="h-4 w-4" /> Download Schedule
          </button>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="mb-4 font-bold">Payment Summary</h3>
          <dl className="space-y-3 text-sm">
            {summary.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-neutral-500">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 py-3 text-sm font-semibold transition hover:bg-neutral-50">
            Go to Payment History <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-red-800 p-5 text-white">
          <img src="/plot-cta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="relative">
            <h3 className="text-[15px] font-bold leading-snug">
              Your Dream Plot<br />is Just a Step Away!
            </h3>
            <p className="mt-2 text-xs text-white/70">
              Secure your future with hassle-free payments.
            </p>
            <button className="mt-16 flex items-center gap-2 rounded-lg bg-red-900/80 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-red-900">
              Explore Projects <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </aside>
    </div>
    </Shell>
  );
}
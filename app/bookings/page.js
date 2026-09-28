"use client";

import {
  ClipboardList, CheckCircle2, PauseCircle, XCircle, MoreVertical,
  Download, ArrowRight, Calendar, Clock, MapPin, Phone, Headphones,
  Map, CreditCard, FileCheck2, ShieldCheck, Home, CheckCircle
} from "lucide-react";
import Shell from "@/components/Shell";


const stats = [
  { icon: ClipboardList, tint: "bg-red-50 text-red-800", label: "Total Bookings", value: "2" },
  { icon: CheckCircle2, tint: "bg-green-50 text-green-600", label: "Confirmed", value: "1" },
  { icon: PauseCircle, tint: "bg-amber-50 text-amber-600", label: "On Hold", value: "1" },
  { icon: XCircle, tint: "bg-rose-50 text-rose-500", label: "Cancelled", value: "0" },
];

const bookings = [
  {
    id: "BK-2024-00125",
    status: "Confirmed",
    plot: "Plot P-118",
    location: "Green Valley, Guduvanchery, Chennai",
    img: "/plot-1.jpg",
    specs: [["Plot Size", "1200 Sq.Ft."], ["Facing", "East"], ["Price", "₹ 23,99,000"], ["Booking Date", "12 May 2024"]],
    paid: "₹ 2,39,900",
    balance: "₹ 21,59,100",
    nextDue: "₹ 5,00,000",
    dueOn: "Due on 12 Jun 2024",
    primary: "View Details",
    secondary: "Download Agreement",
  },
  {
    id: "BK-2024-00136",
    status: "On Hold",
    plot: "Plot P-235",
    location: "Elite Residency, Oragadam, Chennai",
    img: "/plot-2.jpg",
    specs: [["Plot Size", "1500 Sq.Ft."], ["Facing", "West"], ["Price", "₹ 29,99,000"], ["Booking Date", "20 May 2024"]],
    paid: "₹ 1,00,000",
    balance: "₹ 28,99,000",
    nextDue: "₹ 4,99,000",
    dueOn: "Due on 20 Jun 2024",
    primary: "Pay Now",
    secondary: "View Details",
    split: true,
  },
];

const statusStyles = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-amber-50 text-amber-700",
  Cancelled: "bg-rose-50 text-rose-600",
};

const summary = [
  ["Total Bookings", "2"],
  ["Total Investment", "₹ 53,98,000"],
  ["Paid Amount", "₹ 3,39,900"],
  ["Balance Amount", "₹ 50,58,100"],
];

const process = [
  { icon: Map, t: "1. Choose Plot", d: "Select your preferred plot from our projects" },
  { icon: CreditCard, t: "2. Book & Pay", d: "Pay token amount to reserve your plot" },
  { icon: FileCheck2, t: "3. Document & Verify", d: "Submit documents for verification" },
  { icon: ShieldCheck, t: "4. Confirm Booking", d: "Your booking will be confirmed" },
  { icon: Home, t: "5. Possession Ready", d: "We'll inform you when your plot is ready" },
];

export default function BookingsPage() {
  return (
    <Shell>
    <div className="grid gap-5 text-[#1f1f1f] xl:grid-cols-[1fr_300px]">
      {/* Left column */}
      <div className="space-y-5">
        {/* Header card */}
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-black/5 bg-white p-5">
          <div>
            <h2 className="text-xl font-bold">My Bookings</h2>
            <p className="text-sm text-neutral-500">View and manage all your plot bookings in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.map(({ icon: Icon, tint, label, value }) => (
              <div key={label} className="flex min-w-[130px] items-center gap-3 rounded-xl border border-black/5 px-4 py-3">
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
        </section>

        {/* Active bookings */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="mb-4 font-semibold">Active Bookings</h3>

          <div className="space-y-4">
            {bookings.map((b) => (
              <article key={b.id} className="rounded-xl border border-black/5 p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <img src={b.img} alt="" className="h-[105px] w-full shrink-0 rounded-lg object-cover sm:w-[130px]" />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${statusStyles[b.status]}`}>
                        {b.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">Booking ID: {b.id}</span>
                        <button className="text-neutral-400 hover:text-neutral-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="mt-2 text-lg font-bold">{b.plot}</h4>
                    <p className="text-sm text-neutral-500">{b.location}</p>

                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                      {b.specs.map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[11px] text-neutral-500">{k}</p>
                          <p className="text-[13px] font-semibold">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment strip */}
                <div className="mt-4 flex flex-col gap-4 rounded-lg border border-black/5 bg-neutral-50/60 p-4 lg:flex-row lg:items-center">
                  <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] text-neutral-500">Amount Paid</p>
                      <p className="text-[13px] font-semibold">{b.paid}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-500">Balance Amount</p>
                      <p className="text-[13px] font-semibold">{b.balance}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-500">Next Payment Due</p>
                      <p className="text-[13px] font-semibold">{b.nextDue}</p>
                      <p className="text-[10px] text-rose-500">{b.dueOn}</p>
                    </div>
                  </div>

                  {b.split ? (
                    <div className="flex shrink-0 gap-3">
                      <button className="rounded-lg border border-red-800/30 px-8 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-50">
                        {b.primary}
                      </button>
                      <button className="rounded-lg border border-red-800/30 px-8 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-50">
                        {b.secondary}
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[200px]">
                      <button className="rounded-lg bg-red-800 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900">
                        {b.primary}
                      </button>
                      <button className="flex items-center justify-center gap-2 rounded-lg border border-red-800/30 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-50">
                        {b.secondary} <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Booking history */}
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Booking History</h3>
            <a href="#" className="flex items-center gap-1 text-sm font-medium text-red-800">
              View All History <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-black/5 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50">
              <CheckCircle className="h-5 w-5 text-red-800" />
            </div>
            <div>
              <p className="text-sm font-semibold">No cancelled bookings</p>
              <p className="text-xs text-neutral-500">You don't have any cancelled bookings.</p>
            </div>
          </div>
        </section>

        {/* Booking process */}
        <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/5 bg-white p-5">
          <div className="min-w-[180px]">
            <p className="font-semibold">Booking Process</p>
            <p className="text-xs text-neutral-500">Simple steps to secure your dream plot</p>
          </div>
          <div className="flex flex-1 flex-wrap gap-3">
            {process.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex min-w-[150px] flex-1 items-start gap-2.5 rounded-lg border border-black/5 p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-800" strokeWidth={1.6} />
                <div>
                  <p className="text-[11px] font-semibold">{t}</p>
                  <p className="text-[10px] leading-tight text-neutral-500">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right column */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Upcoming Site Visit</h3>
            <Calendar className="h-4 w-4 text-red-800" />
          </div>

          <img src="/plot-1.jpg" alt="" className="h-[110px] w-full rounded-xl object-cover" />

          <p className="mt-4 font-semibold">Plot P-118 - Green Valley</p>

          <div className="mt-3 space-y-2.5 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-2 text-neutral-600">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" /> 18 May 2024 (Saturday)
              </span>
              <span className="flex items-center gap-2 text-neutral-600">
                <Clock className="h-3.5 w-3.5 text-neutral-400" /> 10:00 AM
              </span>
            </div>
            <p className="flex items-start gap-2 text-neutral-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
              Site Office, Green Valley, Guduvanchery, Chennai
            </p>
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 py-3 text-sm font-semibold transition hover:bg-neutral-50">
            <Calendar className="h-4 w-4" /> Reschedule Visit
          </button>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-5">
          <h3 className="mb-4 font-bold">Booking Summary</h3>
          <dl className="space-y-3 text-sm">
            {summary.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-neutral-500">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 py-3 text-sm font-semibold text-white transition hover:bg-red-900">
            Go to Payments <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-red-800 p-5 text-white">
          <img src="/support-agent.png" alt="" className="absolute bottom-0 right-0 h-[85%] object-contain" />
          <div className="relative max-w-[62%]">
            <h3 className="font-bold">Need Help?</h3>
            <p className="mt-1 text-xs text-white/70">Our experts are here to assist you</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4" /> +91 76677 77737
            </p>
            <button className="mt-4 flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2.5 text-[13px] font-semibold transition hover:bg-black/30">
              <Headphones className="h-4 w-4" /> Chat with Expert
            </button>
          </div>
        </section>
      </aside>
    </div>
    </Shell>
  );
}
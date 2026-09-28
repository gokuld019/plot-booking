"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList, CheckCircle2, PauseCircle, XCircle, MoreVertical,
  Download, ArrowRight, Calendar, Clock, MapPin, Phone, Headphones,
  Map, CreditCard, FileCheck2, ShieldCheck, Home, CheckCircle
} from "lucide-react";
import Shell from "@/components/Shell";

/* ───────────────────────────── Config & API ───────────────────────────── */

const API_BASE = "https://api.crazystory.in/api/customer";

const STATUS_STYLES = {
  confirmed: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-600",
  pending: "bg-blue-50 text-blue-600",
};

const STATUS_LABELS = {
  confirmed: "Confirmed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  pending: "Pending",
};

/* ───────────────────────────── Helpers ───────────────────────────── */

function formatINR(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function capitalize(str) {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ───────────────────────────── Component ───────────────────────────── */

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    confirmed: 0,
    onHold: 0,
    cancelled: 0,
  });
  const [statsData, setStatsData] = useState({
    totalInvestment: 0,
    totalPaid: 0,
    balanceAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || localStorage.getItem("token")
          : null;

        if (!token) throw new Error("No authentication token found. Please log in.");

        const res = await fetch(`${API_BASE}/bookings`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

        const json = await res.json();

        // API structure: json.data.data is the array of bookings
        const rawBookings = json?.data?.data;

        if (json.success && Array.isArray(rawBookings)) {
          // ─── Map API data to UI format ───
          const mapped = rawBookings.map((b) => {
            const plotNumber = b.plot?.plot_number?.replace(/^plot-0*/i, "") || "—";
            const status = (b.booking_status || "pending").toLowerCase();

            return {
              id: b.booking_id,
              status: status,
              statusLabel: STATUS_LABELS[status] || capitalize(status),
              plot: `Plot P-${plotNumber}`,
              location: `${b.project?.title || "Project"}, ${b.project?.location || ""}, ${b.project?.city || ""}`.trim().replace(/,\s*$/, ""),
              img: b.project?.cover_image || b.plot?.image || "/plot-1.jpg",
              specs: [
                ["Plot Size", `${b.plot?.area_sqft || 0} Sq.Ft.`],
                ["Facing", b.plot?.facing || "—"],
                ["Price", `₹ ${formatINR(b.total_price)}`],
                ["Booking Date", formatDate(b.booking_date)],
              ],
              paid: `₹ ${formatINR(b.amount_paid)}`,
              balance: `₹ ${formatINR(b.balance_amount)}`,
              nextDue: b.next_payment_amount ? `₹ ${formatINR(b.next_payment_amount)}` : "—",
              dueOn: b.next_payment_due ? `Due on ${formatDate(b.next_payment_due)}` : "",
              primary: status === "on_hold" ? "Pay Now" : "View Details",
              secondary: status === "on_hold" ? "View Details" : "Download Agreement",
              split: status === "on_hold",
            };
          });

          setBookings(mapped);

          // ─── Calculate dynamic summary ───
          const totalBookings = mapped.length;
          const confirmed = mapped.filter((b) => b.status === "confirmed").length;
          const onHold = mapped.filter((b) => b.status === "on_hold").length;
          const cancelled = mapped.filter((b) => b.status === "cancelled").length;

          // Calculate totals from raw API data
          const totalInvestment = rawBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
          const totalPaid = rawBookings.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
          const balanceAmount = rawBookings.reduce((sum, b) => sum + parseFloat(b.balance_amount || 0), 0);

          setSummary({ totalBookings, confirmed, onHold, cancelled });
          setStatsData({ totalInvestment, totalPaid, balanceAmount });
        } else {
          throw new Error(json.message || "Invalid API response structure.");
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError(err.message || "Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  // Build the stats cards dynamically
  const stats = [
    { icon: ClipboardList, tint: "bg-red-50 text-red-800", label: "Total Bookings", value: String(summary.totalBookings) },
    { icon: CheckCircle2, tint: "bg-green-50 text-green-600", label: "Confirmed", value: String(summary.confirmed) },
    { icon: PauseCircle, tint: "bg-amber-50 text-amber-600", label: "On Hold", value: String(summary.onHold) },
    { icon: XCircle, tint: "bg-rose-50 text-rose-500", label: "Cancelled", value: String(summary.cancelled) },
  ];

  const bookingSummary = [
    ["Total Bookings", String(summary.totalBookings)],
    ["Total Investment", `₹ ${formatINR(statsData.totalInvestment)}`],
    ["Paid Amount", `₹ ${formatINR(statsData.totalPaid)}`],
    ["Balance Amount", `₹ ${formatINR(statsData.balanceAmount)}`],
  ];

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

            {loading ? (
              <div className="py-10 text-center text-neutral-500">Loading bookings...</div>
            ) : error ? (
              <div className="py-10 text-center text-red-500">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="py-10 text-center text-neutral-500">No active bookings found.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <article key={b.id} className="rounded-xl border border-black/5 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <img src={b.img} alt="" className="h-[105px] w-full shrink-0 rounded-lg object-cover sm:w-[130px]" />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                            {b.statusLabel}
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
                          {b.dueOn && <p className="text-[10px] text-rose-500">{b.dueOn}</p>}
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
            )}
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
              {[
                { icon: Map, t: "1. Choose Plot", d: "Select your preferred plot from our projects" },
                { icon: CreditCard, t: "2. Book & Pay", d: "Pay token amount to reserve your plot" },
                { icon: FileCheck2, t: "3. Document & Verify", d: "Submit documents for verification" },
                { icon: ShieldCheck, t: "4. Confirm Booking", d: "Your booking will be confirmed" },
                { icon: Home, t: "5. Possession Ready", d: "We'll inform you when your plot is ready" },
              ].map(({ icon: Icon, t, d }) => (
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
              {bookingSummary.map(([k, v]) => (
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
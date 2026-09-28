"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Wallet, CheckCircle2, CalendarDays, FileText, ShieldCheck, ArrowRight,
  ChevronDown, ChevronLeft, ChevronRight, Search, X, Loader2, Eye,
  AlertCircle, CreditCard, RefreshCw,
} from "lucide-react";
import Shell from "@/components/Shell";

/* ──────────────────────────────────────────────────────────────
   Config
   ────────────────────────────────────────────────────────────── */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/customer/payments`;
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const COMPANY_NAME = "Green Valley Plots";

// Adjust these to match the payment_type values your backend accepts
const PAYMENT_TYPES = [
  { value: "booking", label: "Booking Amount" },
  { value: "installment", label: "Installment" },
  { value: "full", label: "Full Payment" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const statusStyles = {
  paid: "bg-emerald-50 text-emerald-700",
  success: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  created: "bg-blue-50 text-blue-600",
  failed: "bg-rose-50 text-rose-600",
  refunded: "bg-neutral-100 text-neutral-600",
};

/* ──────────────────────────────────────────────────────────────
   API client
   ────────────────────────────────────────────────────────────── */

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token") || localStorage.getItem("token");
}

async function api(path = "", { method = "GET", body, params } = {}) {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) url.searchParams.set(k, v);
    });
  }

  const token = getToken();
  const res = await fetch(url.toString(), {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (res.status === 401) throw new Error("Your session has expired. Please log in again.");
  if (!res.ok || json?.success === false) {
    const firstValidationError = json?.errors ? Object.values(json.errors).flat()[0] : null;
    throw new Error(json?.message || firstValidationError || `Request failed (${res.status})`);
  }
  return json;
}

const paymentsApi = {
  list: (params) => api("", { params }),                                  // GET  /
  statistics: () => api("/statistics"),                                   // GET  /statistics
  show: (id) => api(`/${id}`),                                            // GET  /{id}
  createOrder: (body) => api("/create-order", { method: "POST", body }),  // POST /create-order
  verify: (body) => api("/verify", { method: "POST", body }),             // POST /verify
};

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */

function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pick(obj, keys, fallback = 0) {
  if (!obj) return fallback;
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return fallback;
}

function titleCase(s = "") {
  return String(s).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window not available"));
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay. Check your connection."));
    document.body.appendChild(script);
  });
}

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ──────────────────────────────────────────────────────────────
   Small UI pieces
   ────────────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  return (
    <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${statusStyles[key] || "bg-neutral-100 text-neutral-600"}`}>
      {titleCase(status || "unknown")}
    </span>
  );
}

function Select({ value, onChange, children, className = "", disabled }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-full appearance-none rounded-lg border border-black/10 bg-white px-4 pr-9 text-sm outline-none focus:border-red-800/40 disabled:bg-neutral-50 disabled:text-neutral-400"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <p className="flex-1">{toast.message}</p>
      <button onClick={onClose} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

function PaymentDetailModal({ id, onClose }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    paymentsApi
      .show(id)
      .then((res) => active && setPayment(res.data))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const rows = payment
    ? [
        ["Payment ID", payment.payment_id],
        ["Project", payment.project?.title],
        ["Plot", payment.plot?.plot_number],
        ["Payment Type", payment.payment_type ? titleCase(payment.payment_type) : null],
        ["Amount", formatINR(payment.amount)],
        ["Paid Amount", formatINR(payment.paid_amount)],
        ["Gateway", payment.payment_gateway ? titleCase(payment.payment_gateway) : null],
        ["Transaction ID", payment.transaction_id],
        ["Order ID", payment.razorpay_order_id || payment.order_id],
        ["Payment Date", formatDate(payment.payment_date)],
      ].filter(([, v]) => v !== null && v !== undefined && v !== "")
    : [];

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Payment Details</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="grid place-items-center py-10 text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        {payment && !loading && (
          <>
            <div className="mb-4 flex items-start justify-between rounded-xl bg-neutral-50 p-4">
              <div>
                <p className="text-xs text-neutral-500">Amount</p>
                <p className="text-xl font-bold">{formatINR(payment.amount)}</p>
              </div>
              <StatusBadge status={payment.status} />
            </div>
            <dl className="space-y-3 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="break-all text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────── */

export default function PaymentsPage() {
  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // List + filters
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [page, setPage] = useState(1);

  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // Projects / plots known from the customer's payments (used for filter + pay form)
  const [projects, setProjects] = useState({}); // { [id]: { id, title } }
  const [plots, setPlots] = useState({});       // { [id]: { id, plot_number, project_id } }

  // Detail modal
  const [detailId, setDetailId] = useState(null);

  // Pay form
  const [payProject, setPayProject] = useState("");
  const [payPlot, setPayPlot] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState(PAYMENT_TYPES[0].value);
  const [paying, setPaying] = useState(false);
  const payFormRef = useRef(null);

  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  /* ── Fetchers ── */

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await paymentsApi.statistics();
      setStats(res.data || {});
    } catch (e) {
      setToast({ type: "error", message: e.message });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await paymentsApi.list({ status, project_id: projectId, search, page });
      const pg = res.data || {};
      const items = pg.data || [];
      const perPage = pg.per_page || items.length || 10;

      setPayments(items);
      setMeta({
        current_page: pg.current_page || 1,
        last_page: pg.last_page || Math.max(1, Math.ceil((pg.total || 0) / perPage)),
        total: pg.total || 0,
        from: pg.from || (items.length ? (pg.current_page - 1) * perPage + 1 : 0),
        to: pg.to || (items.length ? (pg.current_page - 1) * perPage + items.length : 0),
      });

      // Remember projects & plots so the dropdowns stay populated when filtering
      setProjects((prev) => {
        const next = { ...prev };
        items.forEach((p) => p.project && (next[p.project.id] = p.project));
        return next;
      });
      setPlots((prev) => {
        const next = { ...prev };
        items.forEach((p) => p.plot && (next[p.plot.id] = { ...p.plot, project_id: p.project?.id }));
        return next;
      });
    } catch (e) {
      setListError(e.message);
      setPayments([]);
    } finally {
      setListLoading(false);
    }
  }, [status, projectId, search, page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [status, projectId, search]);

  // Preload Razorpay so checkout opens instantly
  useEffect(() => { loadRazorpay().catch(() => {}); }, []);

  /* ── Derived ── */

  const projectList = useMemo(() => Object.values(projects), [projects]);
  const plotList = useMemo(
    () => Object.values(plots).filter((pl) => !payProject || String(pl.project_id) === String(payProject)),
    [plots, payProject]
  );

  const totalAmount = pick(stats, ["total_amount", "total_investment"]);
  const totalPaid = pick(stats, ["total_paid", "paid_amount", "total_paid_amount"]);
  const pendingAmount = pick(stats, ["pending_amount", "upcoming_dues", "total_pending"]);
  const balanceAmount = pick(stats, ["balance_amount", "balance"], Math.max(0, Number(totalAmount) - Number(totalPaid)));
  const totalCount = pick(stats, ["total_payments", "total_count", "total"], meta.total);
  const paidCount = pick(stats, ["paid_count", "paid_payments"], null);
  const pendingCount = pick(stats, ["pending_count", "pending_payments"], null);
  const paidPct = Number(totalAmount) > 0 ? Math.round((Number(totalPaid) / Number(totalAmount)) * 100) : 0;

  const overview = [
    { icon: Wallet, tint: "bg-red-50 text-red-800", label: "Total Amount", value: formatINR(totalAmount), sub: `${totalCount} Payment${totalCount == 1 ? "" : "s"}` },
    { icon: CheckCircle2, tint: "bg-green-50 text-green-600", label: "Total Paid", value: formatINR(totalPaid), sub: paidCount !== null ? `${paidCount} Paid · ${paidPct}%` : `${paidPct}% of Total` },
    { icon: CalendarDays, tint: "bg-amber-50 text-amber-600", label: "Pending", value: formatINR(pendingAmount), sub: pendingCount !== null ? `${pendingCount} Pending` : "Awaiting payment" },
    { icon: FileText, tint: "bg-rose-50 text-rose-500", label: "Balance Amount", value: formatINR(balanceAmount), sub: `${Math.max(0, 100 - paidPct)}% Remaining` },
  ];

  const summary = [
    ["Total Amount", formatINR(totalAmount)],
    ["Total Paid", formatINR(totalPaid)],
    ["Pending", formatINR(pendingAmount)],
    ["Balance Amount", formatINR(balanceAmount)],
  ];

  /* ── Razorpay flow: create-order → checkout → verify ── */

  const handlePay = async (e) => {
    e?.preventDefault();

    const amount = Number(payAmount);
    if (!payProject || !payPlot) return setToast({ type: "error", message: "Please select a project and plot." });
    if (!amount || amount <= 0) return setToast({ type: "error", message: "Please enter a valid amount." });

    setPaying(true);
    try {
      const orderBody = {
        project_id: Number(payProject),
        plot_id: Number(payPlot),
        amount,
        payment_type: payType,
      };

      const [orderRes] = await Promise.all([paymentsApi.createOrder(orderBody), loadRazorpay()]);
      const order = orderRes.data || {};
      const orderId = order.razorpay_order_id || order.order_id || order.id;
      const key = order.key || order.razorpay_key || RAZORPAY_KEY;

      if (!orderId) throw new Error("Order could not be created. Please try again.");
      if (!key) throw new Error("Razorpay key is missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID.");

      const rzp = new window.Razorpay({
        key,
        order_id: orderId,
        ...(order.amount ? { amount: order.amount } : {}),
        currency: order.currency || "INR",
        name: COMPANY_NAME,
        description: `${titleCase(payType)} – ${plots[payPlot]?.plot_number || "Plot"}`,
        prefill: order.prefill || {
          name: order.customer_name,
          email: order.customer_email,
          contact: order.customer_phone,
        },
        theme: { color: "#991b1b" },
        handler: async (response) => {
          try {
            await paymentsApi.verify({
              project_id: orderBody.project_id,
              plot_id: orderBody.plot_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_type: orderBody.payment_type,
            });
            setToast({ type: "success", message: `Payment of ${formatINR(amount)} was successful.` });
            setPayAmount("");
            await Promise.all([fetchStats(), fetchPayments()]);
          } catch (err) {
            setToast({
              type: "error",
              message: `Payment received but verification failed: ${err.message}. Please contact support with ID ${response.razorpay_payment_id}.`,
            });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setToast({ type: "error", message: "Payment was cancelled." });
          },
        },
      });

      rzp.on("payment.failed", (resp) => {
        setPaying(false);
        setToast({ type: "error", message: resp?.error?.description || "Payment failed. Please try again." });
      });

      rzp.open();
    } catch (err) {
      setPaying(false);
      setToast({ type: "error", message: err.message });
    }
  };

  const startPayFor = (p) => {
    if (p.project) setPayProject(String(p.project.id));
    if (p.plot) setPayPlot(String(p.plot.id));
    const due = Number(p.amount) - Number(p.paid_amount || 0);
    setPayAmount(String(due > 0 ? due : p.amount));
    payFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const refreshAll = () => {
    fetchStats();
    fetchPayments();
  };

  const firstPending = payments.find((p) => String(p.status).toLowerCase() === "pending");

  /* ── Render ── */

  return (
    <Shell>
      <div className="grid gap-5 text-[#1f1f1f] xl:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50">
                  <Wallet className="h-4 w-4 text-red-800" />
                </div>
                <h2 className="text-xl font-bold">Payments</h2>
              </div>
              <button
                onClick={refreshAll}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${statsLoading || listLoading ? "animate-spin" : ""}`} /> Refresh
              </button>
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
                      {statsLoading ? (
                        <div className="my-1 h-4 w-20 animate-pulse rounded bg-neutral-200" />
                      ) : (
                        <p className="text-[15px] font-bold">{value}</p>
                      )}
                      <p className="text-[10px] text-neutral-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending alert */}
            {firstPending && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6ed] px-4 py-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold">You have a pending payment</p>
                    <p className="text-xs text-neutral-500">
                      {formatINR(firstPending.amount)} for {firstPending.project?.title} · {firstPending.plot?.plot_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startPayFor(firstPending)}
                  className="rounded-lg bg-red-800 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900"
                >
                  Pay Now
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">My Payments</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search payment ID…"
                    className="h-10 w-[190px] rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-red-800/40"
                  />
                </div>
                <Select value={status} onChange={setStatus} className="w-[140px]">
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <Select value={projectId} onChange={setProjectId} className="w-[180px]">
                  <option value="">All Projects</option>
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Payments table */}
            <div className="mt-3 overflow-x-auto rounded-xl border border-black/5">
              <table className="w-full text-sm">
                <thead className="border-b border-black/5 bg-neutral-50 text-left text-xs text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Payment ID</th>
                    <th className="px-4 py-3 font-medium">Project / Plot</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount (₹)</th>
                    <th className="px-4 py-3 font-medium">Paid (₹)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {listLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`sk-${i}`}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-full max-w-[110px] animate-pulse rounded bg-neutral-100" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!listLoading && listError && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <p className="text-sm text-rose-600">{listError}</p>
                        <button onClick={fetchPayments} className="mt-2 text-sm font-medium text-red-800">Try again</button>
                      </td>
                    </tr>
                  )}

                  {!listLoading && !listError && payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                        No payments found.
                      </td>
                    </tr>
                  )}

                  {!listLoading &&
                    !listError &&
                    payments.map((p) => {
                      const isPending = ["pending", "created", "failed"].includes(String(p.status).toLowerCase());
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/60">
                          <td className="px-4 py-3">
                            <p className="font-medium">{p.payment_id}</p>
                            {p.transaction_id && <p className="text-[11px] text-neutral-400">{p.transaction_id}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p>{p.project?.title || "—"}</p>
                            <p className="text-[11px] text-neutral-400">{p.plot?.plot_number || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-neutral-600">{formatDate(p.payment_date)}</td>
                          <td className="px-4 py-3 font-medium">{formatINR(p.amount)}</td>
                          <td className="px-4 py-3 text-neutral-600">{formatINR(p.paid_amount)}</td>
                          <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setDetailId(p.id)}
                                className="flex items-center gap-1 text-[13px] font-medium text-red-800 hover:underline"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                              {isPending && (
                                <button
                                  onClick={() => startPayFor(p)}
                                  className="rounded-lg border border-red-800/30 px-3 py-1 text-[12px] font-semibold text-red-800 transition hover:bg-red-50"
                                >
                                  Pay
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!listLoading && meta.total > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
                <p>
                  Showing {meta.from}–{meta.to} of {meta.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 font-medium text-neutral-700">
                    {meta.current_page} / {meta.last_page}
                  </span>
                  <button
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Secure payments */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#faf6ed] px-4 py-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold">Secure Payments</p>
                  <p className="text-xs text-neutral-500">Payments are processed securely through Razorpay.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {["RuPay", "VISA", "Mastercard", "UPI", "Net Banking"].map((m) => (
                  <span key={m} className="rounded-md border border-black/5 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-600">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          {/* Make a payment */}
          <section ref={payFormRef} className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Make a Payment</h3>
              <CreditCard className="h-4 w-4 text-red-800" />
            </div>

            <form onSubmit={handlePay} className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Project</label>
                <Select
                  value={payProject}
                  onChange={(v) => { setPayProject(v); setPayPlot(""); }}
                  disabled={paying}
                >
                  <option value="">Select project</option>
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-500">Plot</label>
                <Select value={payPlot} onChange={setPayPlot} disabled={paying || !payProject}>
                  <option value="">Select plot</option>
                  {plotList.map((pl) => (
                    <option key={pl.id} value={pl.id}>{pl.plot_number}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-500">Payment Type</label>
                <Select value={payType} onChange={setPayType} disabled={paying}>
                  {PAYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-500">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  disabled={paying}
                  placeholder="Enter amount"
                  className="h-10 w-full rounded-lg border border-black/10 bg-white px-4 text-sm outline-none focus:border-red-800/40 disabled:bg-neutral-50"
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 py-3 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {paying ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <>Pay {payAmount ? formatINR(payAmount) : "Now"}</>
                )}
              </button>
            </form>
          </section>

          {/* Summary */}
          <section className="rounded-2xl border border-black/5 bg-white p-5">
            <h3 className="mb-4 font-bold">Payment Summary</h3>
            <dl className="space-y-3 text-sm">
              {summary.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-semibold">
                    {statsLoading ? <span className="inline-block h-4 w-16 animate-pulse rounded bg-neutral-100" /> : v}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-neutral-500">
                <span>Paid</span>
                <span>{paidPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-red-800 transition-all" style={{ width: `${paidPct}%` }} />
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden rounded-2xl bg-red-800 p-5 text-white">
            <img src="/plot-cta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
            <div className="relative">
              <h3 className="text-[15px] font-bold leading-snug">
                Your Dream Plot<br />is Just a Step Away!
              </h3>
              <p className="mt-2 text-xs text-white/70">Secure your future with hassle-free payments.</p>
              <button className="mt-16 flex items-center gap-2 rounded-lg bg-red-900/80 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-red-900">
                Explore Projects <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {detailId && <PaymentDetailModal id={detailId} onClose={() => setDetailId(null)} />}
      <Toast toast={toast} onClose={closeToast} />
    </Shell>
  );
}
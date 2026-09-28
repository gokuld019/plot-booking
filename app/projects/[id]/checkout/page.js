"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Home,
  Info,
  Landmark,
  Loader2,
  Lock,
  Smartphone,
  Tag,
  Wallet,
  Compass,
  Ruler,
  Route,
  Square,
  X,
  Copy,
  AlertCircle,
} from "lucide-react";
import Shell from "@/components/Shell";
import { useAuth } from "@/lib/auth";

/* ───────────────────────────── Booking config ─────────────────────────
   Everything the business may want to change lives here. Later, most of
   this can come from your API instead (plans, coupons, hold time).       */

const API_BASE = "https://api.crazystory.in/api/customer";
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const BOOKING_CONFIG = {
  holdMinutes: 10, // how long the plot is held while the customer checks out
  brandName: "Sri Housing Infra",
  brandColor: "#1c2620",
  plans: [
    {
      id: "token",
      title: "Token reservation",
      badge: "Most popular",
      desc: "Block this plot for 7 days with a small token amount.",
      holdNote: "Plot held for 7 days",
      kind: "choice",
      options: [25000, 50000, 100000],
      paymentType: "booking", // value sent to the API as payment_type
    },
    {
      id: "advance",
      title: "Booking advance",
      desc: "Pay 10% now to lock today's price.",
      holdNote: "Price locked for 30 days",
      kind: "percent",
      value: 10,
      paymentType: "booking",
    },
    {
      id: "full",
      title: "Full payment",
      desc: "Pay the full amount and move straight to registration.",
      holdNote: "Plot is yours right away",
      kind: "percent",
      value: 100,
      paymentType: "booking", // change to your backend's value for full payment, if different
    },
  ],
  // DEMO ONLY — the backend doesn't know about coupons yet
  coupons: {
    WELCOME10K: { type: "flat", value: 10000, label: "₹10,000 off" },
  },
  supportPhone: "+91 76677 77737",
};

// Preferred method: Razorpay opens on this tab; the customer can still switch inside Razorpay
const METHODS = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", hint: "Debit / Credit", icon: CreditCard },
  { id: "netbanking", label: "Net banking", hint: "All major banks", icon: Landmark },
  { id: "wallet", label: "Wallet", hint: "Paytm, Mobikwik…", icon: Wallet },
];

/* ───────────────────────────── API helpers ─────────────────────────── */

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || localStorage.getItem("token");
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
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
    /* non-JSON response */
  }

  if (res.status === 401) throw new Error("Your session has expired. Please log in again.");
  if (!res.ok || !json || json.success === false) {
    const firstFieldError =
      json?.errors && typeof json.errors === "object" ? Object.values(json.errors).flat()[0] : null;
    throw new Error(firstFieldError || json?.message || `Request failed (${res.status})`);
  }
  return json;
}

// 1) create order → { order_id, amount (paise), currency, key }
function createOrder({ projectId, plotId, amount, paymentType }) {
  return apiRequest("/payments/create-order", {
    method: "POST",
    body: {
      project_id: Number(projectId),
      plot_id: Number(plotId),
      amount, // rupees
      payment_type: paymentType,
    },
  });
}

// 3) verify → { data: { payment_id, paid_amount, status, ... } }
function verifyPayment({ projectId, plotId, paymentType, rzp }) {
  return apiRequest("/payments/verify", {
    method: "POST",
    body: {
      project_id: Number(projectId),
      plot_id: Number(plotId),
      razorpay_payment_id: rzp.razorpay_payment_id,
      razorpay_order_id: rzp.razorpay_order_id,
      razorpay_signature: rzp.razorpay_signature,
      payment_type: paymentType,
    },
  });
}

// Loads Razorpay checkout.js once
let razorpayPromise = null;
function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayPromise) return razorpayPromise;
  razorpayPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      razorpayPromise = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return razorpayPromise;
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

function normalizeStatus(apiStatus) {
  const s = (apiStatus || "available").toLowerCase();
  if (s === "reserved") return "selected";
  if (s === "blocked") return "onhold";
  return s;
}

// Same shape the project page stores in sessionStorage
function normalizeApiPlot(p) {
  return {
    id: String(p.id),
    number: (p.plot_number || "").replace(/^PLOT-0*/i, "") || String(p.id),
    status: normalizeStatus(p.status),
    size: parseMoney(p.area_sqft),
    price: parseMoney(p.final_price || p.total_price),
    totalPrice: parseMoney(p.total_price),
    discount: parseMoney(p.discount),
    pricePerSqft: parseMoney(p.price_per_sqft),
    facing: p.facing || "—",
    dimensions: p.dimension || "—",
    roadWidth: p.road_access || "—",
    type: p.plot_type || "Residential",
    block: p.block_name || null,
    image: p.image || null,
  };
}

const inputCls =
  "w-full rounded-xl border border-[#e2dccb] bg-white px-3.5 py-3 text-[14px] text-[#1c2620] placeholder:text-gray-400 outline-none transition focus:border-[#1c2620] focus:ring-4 focus:ring-[#1c2620]/10";

function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-[#3d3a33]">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11.5px] text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[11.5px] text-gray-400">{hint}</span>
      ) : null}
    </label>
  );
}

function SectionCard({ title, subtitle, done, children }) {
  return (
    <section className="rounded-2xl border border-[#ebe5d3] bg-white p-5 sm:p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-[#1c2620]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-gray-500">{subtitle}</p>}
        </div>
        {done && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a7c59] text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/* ───────────────────────────── Page ────────────────────────────────── */

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Shell><div className="p-10 text-sm text-gray-500">Loading checkout…</div></Shell>}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const { id } = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const plotId = search.get("plot");

  const [plot, setPlot] = useState(null);
  const [projectName, setProjectName] = useState("Your project");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Booking plan
  const [planId, setPlanId] = useState("token");
  const [tokenAmt, setTokenAmt] = useState(BOOKING_CONFIG.plans[0].options[1]);

  // Buyer details
  const [form, setForm] = useState({
    name: user?.name || "",
    mobile: user?.phone || user?.mobile || "",
    email: user?.email || "",
    pan: "",
  });
  const [touched, setTouched] = useState({});

  // Payment
  const [method, setMethod] = useState("upi");
  const [agree, setAgree] = useState(false);
  const [agreeWarn, setAgreeWarn] = useState(false);
  const agreeRef = useRef(null);
  const [payError, setPayError] = useState("");
  const [receipt, setReceipt] = useState(null); // data returned by /payments/verify
  const payingRef = useRef(false);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, amount, label }
  const [couponError, setCouponError] = useState("");

  // Flow
  const [stage, setStage] = useState("form"); // form | processing | verifying | success
  const [secondsLeft, setSecondsLeft] = useState(BOOKING_CONFIG.holdMinutes * 60);
  const [copied, setCopied] = useState(false);

  // Start loading Razorpay early so the popup opens instantly
  useEffect(() => {
    loadRazorpay();
  }, []);

  /* ─────────────── Load plot (from project page, else API) ─────────────── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) plot handed over by the project page
      try {
        const raw = sessionStorage.getItem("plot_checkout");
        if (raw) {
          const saved = JSON.parse(raw);
          if (String(saved.projectId) === String(id) && String(saved.plot?.id) === String(plotId)) {
            if (!cancelled) {
              setPlot(saved.plot);
              setProjectName(saved.projectName || "Your project");
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        /* ignore and fall through to API */
      }

      // 2) fall back to the API (direct link / refresh after storage cleared)
      try {
        const json = await apiRequest(`/projects/${id}`);
        const data = json.data || {};
        const found = (data.plots || []).find((p) => String(p.id) === String(plotId));
        if (!found) throw new Error("This plot could not be found.");
        if (!cancelled) {
          setPlot(normalizeApiPlot(found));
          const proj = data.project || data.project_details;
          setProjectName(proj?.title || proj?.name || "Your project");
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load this plot.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, plotId]);

  // Prefill from the logged-in user once it arrives
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name || "",
      mobile: f.mobile || user.phone || user.mobile || "",
      email: f.email || user.email || "",
    }));
  }, [user]);

  // Hold timer (paused while the payment is in progress)
  useEffect(() => {
    if (stage !== "form" || !plot) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage, plot]);

  const expired = secondsLeft === 0 && stage === "form";
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  /* ─────────────── Pricing ─────────────── */
  const plan = BOOKING_CONFIG.plans.find((p) => p.id === planId);

  const pricing = useMemo(() => {
    if (!plot) return null;
    const listPrice = plot.totalPrice > plot.price ? plot.totalPrice : plot.price;
    const offerSaving = Math.max(0, listPrice - plot.price);
    const couponSaving = coupon?.amount || 0;
    const net = Math.max(0, plot.price - couponSaving);
    const payNow =
      plan.kind === "choice"
        ? Math.min(tokenAmt, net)
        : Math.round((net * plan.value) / 100);
    return { listPrice, offerSaving, couponSaving, net, payNow, balance: Math.max(0, net - payNow) };
  }, [plot, plan, tokenAmt, coupon]);

  /* ─────────────── Validation ─────────────── */
  const mobile10 = form.mobile.replace(/\D/g, "").slice(-10);
  const errors = {
    name: form.name.trim().length < 2 ? "Enter your full name" : "",
    mobile: /^[6-9]\d{9}$/.test(mobile10) ? "" : "Enter a valid 10-digit mobile number",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email) ? "" : "Enter a valid email address",
    pan: form.pan && !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan) ? "PAN looks incorrect (e.g. ABCDE1234F)" : "",
  };
  const detailsOk = !errors.name && !errors.mobile && !errors.email && !errors.pan;

  const bookable = plot && (plot.status === "available" || plot.status === "selected");
  const busy = stage === "processing" || stage === "verifying";
  const canPay = detailsOk && agree && !expired && bookable && stage === "form" && pricing?.payNow > 0;

  const step = stage === "success" ? 3 : detailsOk ? 2 : 1;

  /* ─────────────── Actions ─────────────── */
  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    // TODO: replace with a call to your coupon-validation API
    const found = BOOKING_CONFIG.coupons[code];
    if (!found) {
      setCoupon(null);
      setCouponError("This code isn't valid.");
      return;
    }
    setCouponError("");
    setCoupon({ code, amount: found.value, label: found.label });
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  function backToForm(message) {
    payingRef.current = false;
    setStage("form");
    setPayError(message || "");
  }

  /* ─────────────── Razorpay flow ───────────────
     1. POST /payments/create-order → order_id + key
     2. Open Razorpay → customer pays
     3. POST /payments/verify with the 3 Razorpay values → saved in DB
     The Razorpay SECRET stays on the server; the frontend only uses the key. */
  async function handlePay() {
    if (!canPay) {
      setTouched({ name: true, mobile: true, email: true, pan: true });
      // Show the customer exactly what is missing
      if (detailsOk && !agree) {
        setAgreeWarn(true);
        agreeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (!detailsOk) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    if (payingRef.current) return;
    payingRef.current = true;
    setPayError("");
    setStage("processing");

    const paymentType = plan.paymentType || "booking";

    try {
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Couldn't load the payment window. Check your internet connection and try again.");
      }

      // 1) Create order on the server
      const order = await createOrder({
        projectId: id,
        plotId: plot.id,
        amount: pricing.payNow,
        paymentType,
      });
      if (!order.order_id || !order.key) throw new Error("The server did not return a payment order.");

      // 2) Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.key,
        order_id: order.order_id,
        amount: order.amount, // already in paise
        currency: order.currency || "INR",
        name: BOOKING_CONFIG.brandName,
        description: `${projectName} · Plot ${plot.number} · ${plan.title}`,
        image: undefined, // put your logo URL here if you like
        prefill: {
          name: form.name.trim(),
          email: form.email.trim(),
          contact: `+91${mobile10}`,
          method,
        },
        notes: {
          project_id: String(id),
          plot_id: String(plot.id),
          plan: plan.id,
          pan: form.pan || "",
        },
        theme: { color: BOOKING_CONFIG.brandColor },

        // 3) Payment done → verify on the server right away
        handler: async (response) => {
          setStage("verifying");
          try {
            const result = await verifyPayment({
              projectId: id,
              plotId: plot.id,
              paymentType,
              rzp: response,
            });
            setReceipt({
              ...(result.data || {}),
              gateway_payment_id: result.data?.gateway_payment_id || response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
            });
            try {
              sessionStorage.removeItem("plot_checkout");
            } catch {}
            payingRef.current = false;
            setStage("success");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (err) {
            // Money may have been taken; show the Razorpay id so support can trace it
            backToForm(
              `${err.message || "We couldn't confirm your payment."} If money was debited, share this ID with us: ${response.razorpay_payment_id}`
            );
          }
        },

        modal: {
          ondismiss: () => {
            // closed without paying
            if (payingRef.current) backToForm("Payment was cancelled. You can try again.");
          },
          confirm_close: true,
        },
        retry: { enabled: true, max_count: 3 },
      });

      rzp.on("payment.failed", (resp) => {
        // Razorpay keeps its window open for a retry; we just show the reason
        setPayError(resp?.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      backToForm(err.message || "Something went wrong. Please try again.");
    }
  }

  function copyRef(text) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  /* ─────────────── Loading / error ─────────────── */
  if (loading) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing your checkout…
        </div>
      </Shell>
    );
  }

  if (loadError || !plot) {
    return (
      <Shell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="text-lg font-semibold text-[#1c2620]">We couldn't open this plot</div>
          <p className="mt-2 text-sm text-gray-500">{loadError || "Go back to the layout and pick a plot again."}</p>
          <Link
            href={`/projects/${id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1c2620] px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to plot layout
          </Link>
        </div>
      </Shell>
    );
  }

  /* ─────────────── Success ─────────────── */
  if (stage === "success") {
    const reference = receipt?.payment_id || receipt?.gateway_payment_id || "—";
    const paid = parseMoney(receipt?.paid_amount || receipt?.amount) || pricing.payNow;
    return (
      <Shell>
        <div className="min-h-screen bg-[#f6f4ee] px-4 py-12">
          <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-[#ebe5d3] bg-white shadow-[0_30px_80px_-30px_rgba(16,26,16,0.35)]">
            <div className="bg-[#0f1b12] px-8 pb-10 pt-10 text-center text-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e0bd6a]/15 ring-8 ring-[#e0bd6a]/10">
                <CheckCircle2 className="h-8 w-8 text-[#e0bd6a]" />
              </div>
              <h1 className="mt-5 text-[26px] font-bold leading-tight">Plot {plot.number} is reserved</h1>
              <p className="mt-2 text-[13.5px] text-white/65">
                Payment received. A confirmation is on its way to {form.email}. Our team will call you within one working day.
              </p>
            </div>

            <div className="space-y-5 px-8 py-7">
              <div className="flex items-center justify-between rounded-xl bg-[#f6f4ee] px-4 py-3">
                <div>
                  <div className="text-[11.5px] text-gray-500">Payment reference</div>
                  <div className="text-[16px] font-bold tracking-wide text-[#1c2620]">{reference}</div>
                </div>
                <button
                  onClick={() => copyRef(reference)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#d8cdb0] px-3 py-1.5 text-[12px] font-medium text-[#1c2620] hover:bg-white"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <dl className="divide-y divide-[#f0ebdc] text-[13.5px]">
                {[
                  ["Project", projectName],
                  ["Plot", `${plot.block ? plot.block + " · " : ""}Plot ${plot.number} · ${formatINR(plot.size)} Sq.Ft.`],
                  ["Plan", plan.title],
                  ["Paid now", `₹${formatINR(paid)}`],
                  ["Balance", `₹${formatINR(Math.max(0, pricing.net - paid))}`],
                  ["Status", (receipt?.status || "paid").toUpperCase()],
                  ...(receipt?.payment_date ? [["Date", receipt.payment_date]] : []),
                  ["Razorpay ID", receipt?.gateway_payment_id || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="font-semibold text-[#1c2620]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => router.push("/payments")}
                  className="flex-1 rounded-xl bg-[#1c2620] py-3.5 text-[13.5px] font-semibold text-white hover:bg-[#263d26]"
                >
                  View my payments
                </button>
                <Link
                  href="/projects"
                  className="flex flex-1 items-center justify-center rounded-xl border border-[#d8cdb0] py-3.5 text-[13.5px] font-semibold text-[#1c2620] hover:bg-[#f6f4ee]"
                >
                  Explore more plots
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  /* ─────────────── Checkout form ─────────────── */
  const steps = ["Plan & details", "Payment", "Confirmed"];

  return (
    <Shell>
      <div className="min-h-screen bg-[#f6f4ee]">
        {/* Header band */}
        <div className="bg-[#0f1b12] text-white">
          <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                <Link href="/dashboard" className="hover:text-white">
                  <Home className="h-3.5 w-3.5" />
                </Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/projects" className="hover:text-white">Projects</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/projects/${id}`} className="hover:text-white">{projectName}</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white">Reserve</span>
              </div>

              <div
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium tabular-nums ${
                  expired
                    ? "bg-rose-500/20 text-rose-200"
                    : secondsLeft < 120
                    ? "bg-amber-400/20 text-amber-200"
                    : "bg-white/10 text-white/80"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {expired ? "Hold expired" : `Plot held for ${mm}:${ss}`}
              </div>
            </div>

            <h1 className="mt-6 text-[30px] font-bold leading-tight sm:text-[36px]">
              Reserve Plot {plot.number}
            </h1>
            <p className="mt-1.5 max-w-xl text-[14px] text-white/60">
              Pick how you'd like to book, confirm your details and pay securely. It takes about two minutes.
            </p>

            {/* Stepper */}
            <ol className="mt-7 flex items-center gap-3">
              {steps.map((label, i) => {
                const n = i + 1;
                const active = step === n;
                const done = step > n;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                        done
                          ? "bg-[#e0bd6a] text-[#0f1b12]"
                          : active
                          ? "bg-white text-[#0f1b12]"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : n}
                    </span>
                    <span className={`text-[12.5px] ${active || done ? "text-white" : "text-white/45"}`}>{label}</span>
                    {n < steps.length && <span className="h-px w-8 bg-white/15 sm:w-14" />}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto -mt-8 grid max-w-[1180px] gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_380px]">
          {/* ───── Left: forms ───── */}
          <div className="space-y-5">
            {expired && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-700">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  Your hold on this plot has ended.{" "}
                  <Link href={`/projects/${id}`} className="font-semibold underline">
                    Go back to the layout
                  </Link>{" "}
                  to reserve it again.
                </div>
              </div>
            )}

            {!bookable && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                This plot is no longer available to book. Please choose another plot from the layout.
              </div>
            )}

            {/* 1. Booking plan */}
            <SectionCard title="How would you like to book?" subtitle="You can settle the balance after the agreement is signed.">
              <div className="grid gap-3">
                {BOOKING_CONFIG.plans.map((p) => {
                  const selected = p.id === planId;
                  const amountLabel =
                    p.kind === "choice"
                      ? `from ₹${formatINR(p.options[0])}`
                      : `₹${formatINR(Math.round((pricing.net * p.value) / 100))}`;
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-4 transition ${
                        selected ? "border-[#1c2620] bg-[#f8f6ef] ring-4 ring-[#1c2620]/5" : "border-[#e2dccb] hover:border-[#c9bf9f]"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setPlanId(p.id)}
                        className="flex w-full items-start gap-3 text-left"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-[#1c2620] bg-[#1c2620]" : "border-gray-300"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <span className="flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[14.5px] font-semibold text-[#1c2620]">{p.title}</span>
                            {p.badge && (
                              <span className="rounded-full bg-[#e0bd6a]/25 px-2 py-0.5 text-[10.5px] font-semibold text-[#7a5d1c]">
                                {p.badge}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] text-gray-500">{p.desc}</span>
                          <span className="mt-1 block text-[11.5px] text-[#4a7c59]">{p.holdNote}</span>
                        </span>
                        <span className="text-right text-[14px] font-bold tabular-nums text-[#1c2620]">{amountLabel}</span>
                      </button>

                      {selected && p.kind === "choice" && (
                        <div className="mt-3 flex flex-wrap gap-2 pl-8">
                          {p.options.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              disabled={busy}
                              onClick={() => setTokenAmt(amt)}
                              className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold tabular-nums transition ${
                                tokenAmt === amt
                                  ? "border-[#1c2620] bg-[#1c2620] text-white"
                                  : "border-[#d8cdb0] bg-white text-[#1c2620] hover:bg-[#f6f4ee]"
                              }`}
                            >
                              ₹{formatINR(amt)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* 2. Buyer details */}
            <SectionCard title="Your details" subtitle="We'll send your booking confirmation here." done={detailsOk}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full name (as on ID)" error={touched.name && errors.name}>
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      placeholder="e.g. Priya Sharma"
                      autoComplete="name"
                    />
                  </Field>
                </div>
                <Field label="Mobile number" error={touched.mobile && errors.mobile}>
                  <div className="flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-[#e2dccb] bg-[#f6f4ee] px-3 text-[13px] text-gray-500">
                      +91
                    </span>
                    <input
                      className={`${inputCls} rounded-l-none`}
                      value={form.mobile}
                      onChange={(e) => setField("mobile", e.target.value.replace(/[^\d+\s]/g, ""))}
                      onBlur={() => setTouched((t) => ({ ...t, mobile: true }))}
                      placeholder="98765 43210"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                </Field>
                <Field label="Email" error={touched.email && errors.email}>
                  <input
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="PAN (optional now)"
                    error={touched.pan && errors.pan}
                    hint="Needed later for registration. You can add it now to save time."
                  >
                    <input
                      className={`${inputCls} uppercase tracking-wider`}
                      value={form.pan}
                      onChange={(e) => setField("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                      onBlur={() => setTouched((t) => ({ ...t, pan: true }))}
                      placeholder="ABCDE1234F"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* 3. Payment method (preference — Razorpay collects the actual details) */}
            <SectionCard title="Payment method" subtitle="Choose how you'd like to pay. You'll enter the details in Razorpay's secure window.">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  const on = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={busy}
                      onClick={() => setMethod(m.id)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        on ? "border-[#1c2620] bg-[#1c2620] text-white" : "border-[#e2dccb] bg-white text-[#1c2620] hover:border-[#c9bf9f]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="mt-2 text-[13px] font-semibold">{m.label}</div>
                      <div className={`text-[11px] ${on ? "text-white/60" : "text-gray-400"}`}>{m.hint}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#f6f4ee] p-4 text-[12.5px] text-[#3d3a33]">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9c7a34]" />
                <p>
                  Payments are processed by Razorpay. Your card, UPI or bank details are never stored on our servers.
                </p>
              </div>
            </SectionCard>

            {/* 4. Coupon + terms */}
            <SectionCard title="Offers and confirmation">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl border border-[#cfe3d5] bg-[#f0f8f2] px-4 py-3">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#2f6b45]">
                    <Tag className="h-4 w-4" />
                    {coupon.code} applied · {coupon.label}
                  </div>
                  <button onClick={removeCoupon} disabled={busy} className="text-gray-400 hover:text-gray-600" aria-label="Remove code">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      className={`${inputCls} uppercase`}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Have a code?"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={busy}
                      className="rounded-xl border border-[#1c2620] px-5 text-[13px] font-semibold text-[#1c2620] hover:bg-[#1c2620] hover:text-white transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <div className="mt-1.5 text-[11.5px] text-rose-600">{couponError}</div>}
                </div>
              )}

              <label
                ref={agreeRef}
                className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl p-3 -mx-3 text-[12.5px] leading-relaxed text-gray-600 transition ${
                  agreeWarn && !agree ? "bg-amber-50 ring-2 ring-amber-300" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setAgreeWarn(false);
                  }}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded accent-[#1c2620]"
                />
                <span>
                  I've reviewed the plot details and agree to the booking terms and cancellation policy. Stamp duty and
                  registration charges are payable separately at registration.
                </span>
              </label>
            </SectionCard>
          </div>

          {/* ───── Right: summary ───── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-[#ebe5d3] bg-white shadow-[0_30px_60px_-30px_rgba(16,26,16,0.35)]">
              <div className="relative bg-[#12201a] px-6 pb-6 pt-6 text-white">
                {plot.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={plot.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                )}
                <div className="relative">
                  <div className="text-[12px] text-white/60">
                    {projectName}
                    {plot.block ? ` · ${plot.block}` : ""}
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <div className="text-[34px] font-bold leading-none">Plot {plot.number}</div>
                    <span className="rounded-full bg-[#e0bd6a] px-2.5 py-1 text-[10.5px] font-semibold text-[#0f1b12]">
                      {plot.type}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
                    {[
                      [Ruler, `${formatINR(plot.size)} Sq.Ft.`],
                      [Square, plot.dimensions],
                      [Compass, `${plot.facing} facing`],
                      [Route, `${plot.roadWidth} road`],
                    ].map(([Icon, text], i) => (
                      <div key={i} className="flex items-center gap-2 text-white/80">
                        <Icon className="h-3.5 w-3.5 text-[#e0bd6a]" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <dl className="space-y-2.5 text-[13.5px]">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Plot price</dt>
                    <dd className="font-medium tabular-nums text-[#1c2620]">₹{formatINR(pricing.listPrice)}</dd>
                  </div>
                  {pricing.offerSaving > 0 && (
                    <div className="flex justify-between text-[#2f6b45]">
                      <dt>Offer discount</dt>
                      <dd className="font-medium tabular-nums">− ₹{formatINR(pricing.offerSaving)}</dd>
                    </div>
                  )}
                  {pricing.couponSaving > 0 && (
                    <div className="flex justify-between text-[#2f6b45]">
                      <dt>Code {coupon.code}</dt>
                      <dd className="font-medium tabular-nums">− ₹{formatINR(pricing.couponSaving)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#f0ebdc] pt-2.5">
                    <dt className="font-medium text-[#1c2620]">Total price</dt>
                    <dd className="font-semibold tabular-nums text-[#1c2620]">₹{formatINR(pricing.net)}</dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-2xl bg-[#f6f4ee] p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-gray-500">Pay now · {plan.title.toLowerCase()}</span>
                  </div>
                  <div className="mt-1 text-[30px] font-bold leading-none tabular-nums text-[#1c2620]">
                    ₹{formatINR(pricing.payNow)}
                  </div>
                  <div className="mt-2 text-[12px] text-gray-500">
                    Balance ₹{formatINR(pricing.balance)} · {plan.holdNote.toLowerCase()}
                  </div>
                </div>

                {payError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="break-words">{payError}</span>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={busy}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[14px] font-semibold transition ${
                    canPay
                      ? "bg-[#1c2620] text-white shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:bg-[#263d26]"
                      : "bg-[#e9e5d8] text-gray-500"
                  }`}
                >
                  {stage === "processing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Opening secure payment…
                    </>
                  ) : stage === "verifying" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Pay ₹{formatINR(pricing.payNow)} securely
                    </>
                  )}
                </button>

                {!canPay && stage === "form" && !expired && (
                  <p className="mt-2.5 text-center text-[11.5px] text-gray-400">
                    {!detailsOk
                      ? "Complete your details to continue"
                      : !agree
                      ? "Tick the confirmation to continue"
                      : ""}
                  </p>
                )}

                {stage === "verifying" && (
                  <p className="mt-2.5 text-center text-[11.5px] text-gray-500">
                    Please don't close or refresh this page.
                  </p>
                )}

                <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Secured by Razorpay
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Instant confirmation
                  </span>
                </div>
                <p className="mt-3 text-center text-[11.5px] text-gray-400">
                  Questions? Call {BOOKING_CONFIG.supportPhone}
                </p>
              </div>
            </div>

            <Link
              href={`/projects/${id}`}
              className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Choose a different plot
            </Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
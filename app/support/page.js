// app/support/page.js

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { useAuth } from "@/lib/auth";
import {
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ChevronRight,
  Ticket,
  CheckCircle2,
  Clock,
  Smile,
  BookOpen,
  PlayCircle,
  Download,
  ArrowRight,
  Headphones,
} from "lucide-react";

/* ───────────────────────────── Config ──────────────────────────────── */

const API_BASE = "https://api.crazystory.in/api/customer";

/* ───────────────────────────── Fallback Data ───────────────────────── */

const FALLBACK_FAQS = [
  { q: "How can I book a plot?", a: "Select a plot from any project's layout page, click 'Book This Plot', and follow the booking steps to complete your reservation with a token payment." },
  { q: "What are the payment options available?", a: "We accept bank transfers, UPI, cheques, and financing through our partner banks. EMI options are also available for eligible plots." },
  { q: "How do I schedule a site visit?", a: "Go to any project's plot selection page and click 'Schedule Site Visit', or contact our support team to arrange a convenient time." },
  { q: "What documents are required for booking?", a: "You'll need a valid government ID, PAN card, address proof, and passport-size photographs. Our team will guide you through the complete list." },
  { q: "How can I check my booking status?", a: "Visit 'My Bookings' from your dashboard to see real-time status updates on all your plot bookings and payments." },
];

const FALLBACK_TICKETS = [
  { id: "TK-2458", title: "Payment not reflecting", date: "12 May 2024", status: "Open" },
  { id: "TK-2411", title: "Document verification status", date: "08 May 2024", status: "In Progress" },
  { id: "TK-2367", title: "Site visit reschedule", date: "02 May 2024", status: "Resolved" },
];

const FALLBACK_SUMMARY = {
  open_tickets: 3,
  resolved_tickets: 7,
  avg_response_hours: 24,
  satisfaction_rate: 98,
};

const STATUS_STYLES = {
  Open: "bg-orange-100 text-orange-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
};

const HELP_RESOURCES = [
  { icon: BookOpen, label: "User Guide", sub: "Step-by-step guides" },
  { icon: PlayCircle, label: "Video Tutorials", sub: "Watch helpful videos" },
  { icon: Download, label: "Download Center", sub: "Forms, brochures & more" },
];

/* ───────────────────────────── Component ───────────────────────────── */

export default function SupportPage() {
  const { user } = useAuth();

  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const [tickets, setTickets] = useState(FALLBACK_TICKETS);
  const [summary, setSummary] = useState(FALLBACK_SUMMARY);
  const [contact, setContact] = useState({
    phone: "+91 76677 77737",
    email: "support@srihousinginfra.com",
  });
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const userName = user?.name || "Priya Sharma";
  const firstName = userName.split(" ")[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    async function fetchSupportData() {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token") || localStorage.getItem("token")
            : null;

        const res = await fetch(`${API_BASE}/support`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error("API returned success: false");

        const data = json.data || {};

        if (Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs.map((f) => ({ q: f.question || f.q, a: f.answer || f.a })));
        }
        if (Array.isArray(data.tickets) && data.tickets.length > 0) {
          setTickets(
            data.tickets.map((t) => ({
              id: t.ticket_number || t.id,
              title: t.subject || t.title,
              date: t.created_at || t.date,
              status: t.status,
            }))
          );
        }
        if (data.summary) setSummary(data.summary);
        if (data.contact) setContact(data.contact);
      } catch (err) {
        console.error("Error fetching support data:", err);
        // Keep fallback data — page stays fully usable
      } finally {
        setLoading(false);
      }
    }

    fetchSupportData();
  }, []);

  function toggleFaq(index) {
    setOpenFaq((prev) => (prev === index ? null : index));
  }

  const summaryCards = [
    { icon: Ticket, value: summary.open_tickets, label: "Open Tickets", bg: "bg-orange-100", color: "text-orange-600" },
    { icon: CheckCircle2, value: summary.resolved_tickets, label: "Resolved Tickets", bg: "bg-green-100", color: "text-green-600" },
    { icon: Clock, value: `${summary.avg_response_hours} hrs`, label: "Avg. Response Time", bg: "bg-blue-100", color: "text-blue-600" },
    { icon: Smile, value: `${summary.satisfaction_rate}%`, label: "Satisfaction Rate", bg: "bg-yellow-100", color: "text-yellow-600" },
  ];

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN */}
        <div>
          {/* Support Center Banner */}
          <div
            className="relative rounded-2xl overflow-hidden flex items-center justify-between p-8 bg-cover bg-center border border-gray-200"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.3) 100%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')",
            }}
          >
            <div className="flex items-start gap-4 max-w-lg">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Headphones size={22} className="text-orange-500" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1.5">Support Center</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Find answers, connect with our experts, and get the help you need.
                </p>
              </div>
            </div>
          </div>

          {/* How can we help you */}
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-4">How can we help you?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Chat with Us */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <MessageCircle size={20} className="text-green-600" strokeWidth={1.75} />
                </div>
                <div className="font-bold text-[15px] mb-1.5">Chat with Us</div>
                <div className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Chat live with our support executive.
                </div>
                <button className="w-full bg-[#1B2B1B] hover:bg-[#263d26] text-white py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-2">
                  Start Chat
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  We're Online
                </div>
              </div>

              {/* Call Us */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <Phone size={20} className="text-green-600" strokeWidth={1.75} />
                </div>
                <div className="font-bold text-[15px] mb-1.5">Call Us</div>
                <div className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Speak with our support team instantly.
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="w-full block text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-2"
                >
                  Call Now
                </a>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Phone size={11} />
                  {contact.phone}
                </div>
              </div>

              {/* Email Us */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <Mail size={20} className="text-green-600" strokeWidth={1.75} />
                </div>
                <div className="font-bold text-[15px] mb-1.5">Email Us</div>
                <div className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Share your queries and we'll reply back.
                </div>
                <a
                  href={`mailto:${contact.email}`}
                  className="w-full block text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-2"
                >
                  Send Email
                </a>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Mail size={11} />
                  {contact.email}
                </div>
              </div>

              {/* Raise a Ticket */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <FileText size={20} className="text-green-600" strokeWidth={1.75} />
                </div>
                <div className="font-bold text-[15px] mb-1.5">Raise a Ticket</div>
                <div className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Submit your issue and track its status.
                </div>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-[13px] font-semibold transition-colors mb-2">
                  Raise Ticket
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock size={11} />
                  Usually replies in 24 hrs
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Frequently Asked Questions</h2>
              <Link href="/support/faqs" className="text-sm text-green-600 font-semibold flex items-center gap-1">
                View All FAQs <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 flex-shrink-0 ml-3 transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 -mt-1">
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Still need help */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-gray-600" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-0.5">Still need help?</div>
                <div className="text-xs text-gray-500">
                  Our support team is available from 9:30 AM – 7:00 PM
                  <br />
                  (Monday to Saturday)
                </div>
              </div>
            </div>
            <button className="bg-[#1B2B1B] hover:bg-[#263d26] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2 whitespace-nowrap">
              Talk to an Expert <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          {/* Support Summary */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold mb-3">Your Support Summary</h3>
            {summaryCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 py-2.5 border-t border-gray-100 first:border-t-0"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                    <Icon size={16} className={s.color} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold leading-tight">{loading ? "…" : s.value}</div>
                    <div className="text-[11px] text-gray-400">{s.label}</div>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-gray-300" />
                </div>
              );
            })}
          </div>

          {/* My Recent Tickets */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">My Recent Tickets</h3>
              <Link href="/support/tickets" className="text-xs text-green-600 font-semibold flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="text-xs text-gray-400 text-center py-4 border-t border-gray-100">
                Loading tickets…
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((t) => (
                <div key={t.id} className="py-3 border-t border-gray-100 first:border-t-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-gray-800">#{t.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        STATUS_STYLES[t.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[13px] text-gray-700 mb-1">{t.title}</div>
                  <div className="text-[11px] text-gray-400">
                    {t.date} · {t.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center py-4 border-t border-gray-100">
                No tickets yet
              </div>
            )}
            <Link
              href="/support/tickets"
              className="block w-full mt-3 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-lg text-xs font-semibold text-center transition-colors"
            >
              View All Tickets →
            </Link>
          </div>

          {/* Help Resources */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold mb-3">Help Resources</h3>
            {HELP_RESOURCES.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.label}
                  href="#"
                  className="flex items-center gap-3 py-2.5 border-t border-gray-100 first:border-t-0 hover:bg-gray-50 -mx-5 px-5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-green-700" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{r.label}</div>
                    <div className="text-[11px] text-gray-400">{r.sub}</div>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-gray-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
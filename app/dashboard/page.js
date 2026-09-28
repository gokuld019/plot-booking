// app/dashboard/page.js

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { useAuth } from "@/lib/auth";
import {
  getDashboardStatistics,
  getFeaturedProjects,
  getAllProjects,
} from "@/lib/api";
import {
  Home,
  Building2,
  Users,
  HardHat,
  Heart,
  ClipboardList,
  CreditCard,
  Settings,
  MapPin,
  ShieldCheck,
  DollarSign,
  RefreshCw,
  HeadphonesIcon,
  FileText,
  ChevronRight,
  Phone,
  Mail,
  UsersRound,
  AlertTriangle,
} from "lucide-react";

const SIDE_LINKS = [
  { icon: ClipboardList, label: "My Bookings", href: "/bookings" },
  { icon: CreditCard, label: "Payment History", href: "/payments" },
  { icon: Heart, label: "Saved Plots", href: "/inventory" },
  { icon: Settings, label: "Profile Settings", href: "/profile" },
];

const WHY_US = [
  { icon: MapPin, label: "Prime Locations", sub: "Well connected & developed areas" },
  { icon: ShieldCheck, label: "Legal Approved", sub: "100% Clear Titles & Documentation" },
  { icon: DollarSign, label: "Best Prices", sub: "Competitive pricing guaranteed" },
  { icon: RefreshCw, label: "Easy Booking", sub: "Simple & transparent process" },
  { icon: HeadphonesIcon, label: "After Sales Support", sub: "Dedicated support always" },
];

const STAT_CONFIG = [
  { key: "total_projects", icon: Home, label: "Total Projects", sub: "Across all cities", bg: "bg-red-100", color: "text-red-700" },
  { key: "available_plots", icon: Building2, label: "Available Plots", sub: "Book your choice", bg: "bg-yellow-100", color: "text-yellow-700" },
  { key: "happy_customers", icon: Users, label: "Happy Customers", sub: "Trust our legacy", bg: "bg-blue-100", color: "text-blue-700" },
  { key: "ongoing_projects", icon: HardHat, label: "Ongoing Projects", sub: "High Appreciation", bg: "bg-red-100", color: "text-red-700" },
];

const TAG_COLORS = {
  "New Launch": "bg-red-700",
  "Premium": "bg-yellow-600",
  "Best Seller": "bg-purple-600",
  "Upcoming": "bg-blue-600",
};

const STATUS_STYLES = {
  Confirmed: "text-green-700 bg-green-100",
  "On Hold": "text-yellow-700 bg-yellow-100",
  "Payment Pending": "text-blue-700 bg-blue-100",
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAllProjects, setLoadingAllProjects] = useState(true);

  const [statsError, setStatsError] = useState(null);
  const [projectsError, setProjectsError] = useState(null);
  const [allProjectsError, setAllProjectsError] = useState(null);

  useEffect(() => {
    setLoadingStats(true);
    getDashboardStatistics()
      .then((res) => {
        const data = res?.data || res;
        setStats(data?.statistics || data || null);
        if (data?.recent_bookings) setRecentBookings(data.recent_bookings);
        setStatsError(null);
      })
      .catch(() => {
        setStatsError("Unable to load dashboard statistics.");
      })
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingProjects(true);
    getFeaturedProjects()
      .then((res) => {
        const data = res?.data || res;
        const list = data?.projects || data?.data || data;
        setProjects(Array.isArray(list) ? list : []);
        setProjectsError(null);
      })
      .catch(() => {
        setProjectsError("Unable to load featured projects.");
        setProjects([]);
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    setLoadingAllProjects(true);
    getAllProjects()
      .then((res) => {
        const data = res?.data || res;
        const list = data?.projects || data?.data || data;
        setAllProjects(Array.isArray(list) ? list : []);
        setAllProjectsError(null);
      })
      .catch(() => {
        setAllProjectsError("Unable to load projects.");
        setAllProjects([]);
      })
      .finally(() => setLoadingAllProjects(false));
  }, []);

  const userName = user?.name || "";
  const firstName = userName ? userName.split(" ")[0] : "there";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const renderProjectCard = (p) => (
    <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div
        className="h-32 bg-cover bg-center relative bg-gray-200"
        style={p.cover_image || p.image ? { backgroundImage: `url(${p.cover_image || p.image})` } : {}}
      >
        {p.tag && (
          <span className={`absolute top-2.5 left-2.5 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[p.tag] || "bg-gray-600"}`}>
            {p.tag}
          </span>
        )}
        <span className="absolute top-2.5 right-2.5 bg-white w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
          <Heart size={14} className="text-gray-500" />
        </span>
      </div>
      <div className="p-3.5">
        <div className="font-bold text-[15px] mb-0.5">{p.name || p.title}</div>
        <div className="text-xs text-gray-400 mb-2.5">{p.location}</div>
        {(p.display_price || p.price_range?.price_per_sqft || p.price_per_sqft) && (
          <div className="text-xs text-gray-500 mb-3">
            {p.display_price ? (
              <b className="text-red-700 text-sm">{p.display_price}</b>
            ) : (
              <>
                Plots from{" "}
                <b className="text-red-700 text-sm">
                  ₹{Number(p.price_range?.price_per_sqft || p.price_per_sqft).toLocaleString()} / Sq.Ft
                </b>
              </>
            )}
          </div>
        )}
        <Link
          href={`/projects/${p.id}`}
          className="block w-full text-center border border-red-700 text-red-700 hover:bg-red-50 py-2 rounded-lg text-[13px] font-semibold transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  const statValue = (key) => {
    if (loadingStats) return "…";
    const v = stats?.[key];
    return v === undefined || v === null ? "—" : v;
  };

  return (
    <Shell>
      {(statsError || projectsError || allProjectsError) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{statsError || projectsError || allProjectsError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN */}
        <div>
          {/* Hero */}
          <div
            className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-center p-8 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(253,243,242,0.9), rgba(250,232,230,0.85)), url('https://images.unsplash.com/photo-1592595896616-c37162298647?w=1200')",
            }}
          >
            <div>
              <h1 className="text-3xl font-bold mb-3">
                Find Your <span className="text-red-700">Perfect Plot</span>
              </h1>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Premium plots. Prime locations.
                <br />
                Trusted by our happy customers.
              </p>
              <Link
                href="/projects"
                className="inline-block bg-red-800 hover:bg-red-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Explore Projects →
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            {STAT_CONFIG.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center mb-3 ${s.bg}`}>
                    <Icon size={18} className={s.color} strokeWidth={2} />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className="text-2xl font-bold mb-0.5">{statValue(s.key)}</div>
                  <div className="text-[11px] text-gray-400">{s.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Projects header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Explore Our Projects</h2>
            <Link href="/projects" className="text-sm text-red-700 font-semibold">
              View All Projects →
            </Link>
          </div>

          {/* Project cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingProjects ? (
              <div className="col-span-3 text-center text-gray-400 text-sm py-8">
                Loading projects…
              </div>
            ) : projects.length > 0 ? (
              projects.map((p) => renderProjectCard(p))
            ) : (
              <div className="col-span-3 text-center text-gray-400 text-sm py-8">
                No featured projects available
              </div>
            )}
          </div>

          {/* Why choose us */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 mt-6">
            <h3 className="text-[15px] font-bold mb-4">Why Choose Sri Housing Infra?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {WHY_US.map((w) => {
                const Icon = w.icon;
                return (
                  <div key={w.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon size={20} className="text-red-700" strokeWidth={1.75} />
                    </div>
                    <div className="text-xs font-semibold mb-1">{w.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{w.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Projects Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">All Projects</h2>
              <span className="text-xs text-gray-400">
                {loadingAllProjects ? "…" : `${allProjects.length} projects`}
              </span>
            </div>
            {loadingAllProjects ? (
              <div className="text-center text-gray-400 text-sm py-8">
                Loading projects…
              </div>
            ) : allProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allProjects.slice(0, 4).map((p) => renderProjectCard(p))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">
                No projects available
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          {/* User Menu */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="font-bold mb-1">{getGreeting()}, {firstName}!</div>
            <div className="text-xs text-gray-500 mb-4">Manage your bookings and stay updated.</div>
            {SIDE_LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className="flex items-center gap-2.5 py-2.5 border-t border-gray-200 hover:bg-gray-100 -mx-5 px-5 transition-colors"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Icon size={16} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{l.label}</div>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-gray-400" />
                </Link>
              );
            })}
          </div>

          {/* Promo Box */}
          <div className="bg-gradient-to-br from-red-800 to-red-800 rounded-xl p-5 text-white">
            <div className="font-bold mb-1.5">Own Your Dream Plot</div>
            <div className="text-xs opacity-85 mb-4">Easy booking. Secure investment. Bright future.</div>
            <button className="bg-white text-red-700 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-gray-100 transition-colors">
              Book a Site Visit →
            </button>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold">Recent Bookings</h3>
              <Link href="/bookings" className="text-xs text-red-700">View All</Link>
            </div>
            {loadingStats ? (
              <div className="text-xs text-gray-400 text-center py-4 border-t border-gray-100">
                Loading bookings…
              </div>
            ) : recentBookings.length > 0 ? (
              recentBookings.map((b, i) => (
                <div key={b.id || i} className="flex items-center gap-2.5 py-2.5 border-t border-gray-100">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-gray-600" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{b.plot || b.plot_number}</div>
                    <div className="text-[11px] text-gray-400">{b.project || b.project_name}</div>
                  </div>
                  <span
                    className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded-full ${
                      STATUS_STYLES[b.status] || "text-gray-700 bg-gray-100"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center py-4 border-t border-gray-100">
                No recent bookings
              </div>
            )}
            <Link
              href="/bookings"
              className="block w-full mt-2.5 bg-gray-100 py-2.5 rounded-lg text-xs font-semibold text-center hover:bg-gray-200 transition-colors"
            >
              Go to My Bookings →
            </Link>
          </div>

          {/* Help Section */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 relative overflow-hidden">
            <div className="text-sm font-semibold mb-1">Need Help?</div>
            <div className="text-xs text-gray-500 mb-3">We're here to assist you</div>
            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1.5">
              <Phone size={12} className="text-gray-500" /> +91 76677 77737
            </div>
            <div className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
              <Mail size={12} className="text-gray-500" /> support@srihousinginfra.com
            </div>
            <div className="flex justify-center">
              <UsersRound size={36} className="text-orange-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
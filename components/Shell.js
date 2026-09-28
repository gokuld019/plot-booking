"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";
import {
  LayoutDashboard,
  Building2,
  Map,
  ClipboardList,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  Bell,
  Search,
  LogOut,
  Phone,
  Mail,
  Users,
} from "lucide-react";

// Brand colours (same as the dashboard)
const RED = "#b3261e";
const RED_DARK = "#8c1c16";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Our Projects", href: "/allprojects", icon: Building2 },
  { label: "Plot Inventory", href: "/inventory", icon: Map },
  { label: "Bookings", href: "/bookings", icon: ClipboardList },
  { label: "My Documents", href: "/documents", icon: FileText },
  { label: "Payments", href: "/payments", icon: CreditCard },
  // { label: "Offers & Benefits", href: "/offers", icon: Settings },
  { label: "Support", href: "/support", icon: HelpCircle },
];

export default function Shell({ children }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const userName = user?.name || "User";
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  // Active when on the page itself or a page inside it (e.g. /projects/1 under Our Projects)
  function isActive(href) {
    if (pathname === href) return true;
    if (href === "/allprojects" && pathname?.startsWith("/projects")) return true;
    return pathname?.startsWith(`${href}/`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Company logo — the image file is public/logo.png */}
        <div className="mb-8 pl-1">
          <BrandLogo height={70} />
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
                style={active ? { background: "#fdeceb", color: RED } : undefined}
              >
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                    style={{ background: RED }}
                  />
                )}
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Need Help — red instead of orange */}
        <div className="mt-auto pt-4">
          <div
            className="rounded-xl p-4 relative overflow-hidden border"
            style={{ background: "#fdf1f0", borderColor: "#f6d3cf" }}
          >
            <div className="text-sm font-semibold mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" style={{ color: RED }} />
              Need Help?
            </div>
            <div className="text-xs text-gray-500 mb-3">We're here to assist you</div>
            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: RED }} />
              +91 76677 77737
            </div>
            <div className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: RED }} />
              support@srihousinginfra.com
            </div>
            <div className="text-4xl text-center flex justify-center">
              <Users className="w-10 h-10" style={{ color: RED, opacity: 0.8 }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 gap-4">
          <div>
            <div className="text-[15px] font-semibold flex items-center gap-2">
              {greeting}, {userName.split(" ")[0]}!
              <span className="text-lg">👋</span>
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">
              Let's help you find the perfect plot for your dream home.
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, locations..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-600" />
              <span
                className="absolute -top-1 -right-1 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold"
                style={{ background: RED }}
              >
                3
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full font-semibold flex items-center justify-center overflow-hidden"
                style={{ background: "#fdeceb", color: RED_DARK }}
              >
                {userName.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:block">{userName}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1.5"
              style={{ color: RED }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
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
  User,
  Phone,
  Mail,
  Users,
  Home,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Our Projects", href: "/allprojects", icon: Building2 },
  { label: "Plot Inventory", href: "/inventory", icon: Map },
  { label: "Bookings", href: "/bookings", icon: ClipboardList },
  { label: "My Documents", href: "/documents", icon: FileText },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Offers & Benefits", href: "/offers", icon: Settings },
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
        <div className="mb-8 pl-1">
          <div className="text-[13px] font-bold tracking-tight text-gray-900 leading-tight whitespace-nowrap flex items-center gap-2">
            <Home className="w-4 h-4 text-green-700" />
            SRI HOUSING INFRA
          </div>
          <div className="text-[9px] text-yellow-700 tracking-widest mt-0.5">• TRUSTED LEGACY •</div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-green-50 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 relative overflow-hidden">
            <div className="text-sm font-semibold mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-600" />
              Need Help?
            </div>
            <div className="text-xs text-gray-500 mb-3">We're here to assist you</div>
            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              +91 76677 77737
            </div>
            <div className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              support@srihousinginfra.com
            </div>
            <div className="text-4xl text-center flex justify-center">
              <Users className="w-10 h-10 text-orange-400" />
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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                3
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-orange-200 text-orange-800 font-semibold flex items-center justify-center overflow-hidden">
                {userName.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:block">{userName}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1.5"
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
"use client";

import {
  Building2, CalendarDays, Wallet, Gift, Search, Bell, ChevronDown,
  Crown, Clock, CreditCard, Percent, User, ArrowRight, Calendar, CheckCircle2
} from "lucide-react";
import Shell from "@/components/Shell";


const stats = [
  { icon: Percent, tint: "bg-emerald-50 text-emerald-700", label: "Active Offers", value: "6", sub: "View All" },
  { icon: Wallet, tint: "bg-amber-50 text-amber-700", label: "Total Savings", value: "₹ 2,45,000", sub: "View Details" },
  { icon: User, tint: "bg-violet-50 text-violet-700", label: "Referrals Done", value: "2", sub: "View Referrals" },
  { icon: Gift, tint: "bg-rose-50 text-rose-700", label: "Rewards Earned", value: "₹ 15,000", sub: "Wallet Balance" },
];

const offers = [
  { tag: "Limited Time", save: "₹ 75,000", title: "Spot Booking Discount", desc: "Book your plot today and get an instant discount on the total cost.", valid: "Valid till 31 May 2024", img: "/offer-1.jpg" },
  { tag: "Best Value", save: "₹ 1,25,000", title: "Early Bird Offer", desc: "Book early and enjoy special benefits on selected premium plots.", valid: "Valid till 30 Jun 2024", img: "/offer-2.jpg" },
  { tag: "Festive Offer", save: "₹ 45,000", title: "Festive Special Offer", desc: "Celebrate the season with amazing offers on select plots.", valid: "Valid till 15 Jun 2024", img: "/offer-3.jpg" },
];

const benefits = [
  { icon: Crown, title: "Gold Member", desc: "Exclusive member benefits" },
  { icon: Clock, title: "Priority Access", desc: "Early access to new launches" },
  { icon: CreditCard, title: "Flexible Payments", desc: "Easy & flexible payment plans" },
  { icon: Percent, title: "Special Discounts", desc: "Extra discounts on select projects" },
  { icon: User, title: "Dedicated Support", desc: "Personal relationship manager" },
];

const referrals = [
  { name: "Rohit Kumar", meta: "Referred on 10 May 2024  •  Plot P-118", amount: "₹ 10,000", avatar: "/av1.jpg" },
  { name: "Anita Verma", meta: "Referred on 25 Apr 2024  •  Plot P-101", amount: "₹ 5,000", avatar: "/av2.jpg" },
];

export default function OffersPage() {
  return (
    <Shell>
    <div className="min-h-screen bg-[#f7f7f5] text-[#1c2b23]">
      <main className="px-6 py-6 lg:px-8">
        {/* Topbar */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold">Good morning, Priya! 👋</h1>
            <p className="text-sm text-neutral-500">Enjoy exclusive offers and exciting benefits.</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                placeholder="Search projects, locations..."
                className="h-11 w-[320px] rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm outline-none focus:border-emerald-700/40"
              />
            </div>
            <button className="relative">
              <Bell className="h-5 w-5 text-neutral-600" />
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
            </button>
            <button className="flex items-center gap-2">
              <img src="/priya.jpg" alt="" className="h-9 w-9 rounded-full object-cover" />
              <span className="text-sm font-semibold">Priya Sharma</span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </button>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Hero */}
            <section className="overflow-hidden rounded-2xl border border-black/5 bg-white">
              <div className="relative">
                <img src="/hero.jpg" alt="" className="h-[120px] w-full object-cover object-right" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-6">
                  <h2 className="text-[26px] font-bold">Offers &amp; Benefits</h2>
                  <p className="text-sm text-neutral-600">Explore exclusive offers, rewards and benefits designed for you.</p>
                </div>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ icon: Icon, tint, label, value, sub }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-black/5 p-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tint}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">{label}</p>
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-[11px] text-neutral-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Offers */}
            <section className="rounded-2xl border border-black/5 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Exclusive Offers for You</h3>
                <a href="#" className="flex items-center gap-1 text-sm font-medium text-emerald-800">
                  View All Offers <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {offers.map((o) => (
                  <article key={o.title} className="overflow-hidden rounded-xl border border-black/5">
                    <div className="relative">
                      <img src={o.img} alt="" className="h-[150px] w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {o.tag}
                      </span>
                      <div className="absolute -bottom-4 right-3 rounded-lg bg-white px-4 py-2 text-center shadow-md">
                        <p className="text-[11px] text-neutral-500">Save</p>
                        <p className="text-sm font-bold">{o.save}</p>
                      </div>
                    </div>
                    <div className="space-y-2 p-4 pt-6">
                      <h4 className="font-bold">{o.title}</h4>
                      <p className="text-[13px] leading-relaxed text-neutral-500">{o.desc}</p>
                      <p className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="h-3.5 w-3.5" /> {o.valid}
                      </p>
                      <button className="mt-2 w-full rounded-lg border border-emerald-800/30 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50">
                        View Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Referral rewards */}
            <section className="rounded-2xl border border-black/5 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Referral Rewards</h3>
                <a href="#" className="flex items-center gap-1 text-sm font-medium text-emerald-800">
                  View All Referrals <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="divide-y divide-black/5 rounded-xl border border-black/5">
                {referrals.map((r) => (
                  <div key={r.name} className="flex items-center gap-4 p-4">
                    <img src={r.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="flex items-center gap-2 font-semibold">
                        {r.name}
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">Completed</span>
                      </p>
                      <p className="text-xs text-neutral-500">{r.meta}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{r.amount}</p>
                      <p className="text-[11px] text-neutral-500">Reward Earned</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" strokeWidth={1.6} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="mb-4 text-lg font-bold">Your Benefits</h3>
              <ul className="space-y-4">
                {benefits.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50">
                      <Icon className="h-5 w-5 text-amber-600" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-neutral-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-5 w-full rounded-lg bg-[#173d2c] py-3 text-sm font-semibold text-white transition hover:bg-[#0f2b1e]">
                Explore All Benefits
              </button>
            </section>

            <section className="overflow-hidden rounded-2xl bg-[#173d2c] p-5 text-white">
              <h3 className="text-lg font-bold">Refer &amp; Earn</h3>
              <p className="mt-1 text-sm text-white/70">Refer your friends and family and earn exciting rewards.</p>
              <img src="/gift.png" alt="" className="mx-auto my-5 h-32 object-contain" />
              <div className="overflow-hidden rounded-xl bg-white text-[#1c2b23]">
                <div className="grid grid-cols-2 divide-x divide-black/5">
                  <div className="p-4 text-center">
                    <p className="text-lg font-bold">2</p>
                    <p className="text-[11px] text-neutral-500">Referrals Done</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-lg font-bold">₹ 15,000</p>
                    <p className="text-[11px] text-neutral-500">Rewards Earned</p>
                  </div>
                </div>
                <button className="flex w-full items-center justify-center gap-2 border-t border-black/5 py-3 text-sm font-semibold">
                  Refer Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="mb-4 font-bold">How it works?</h3>
              <div className="flex items-start justify-between gap-2">
                {[
                  { icon: User, t: "Refer", d: "Share with your friends" },
                  { icon: CalendarDays, t: "They Book", d: "They book a plot with us" },
                  { icon: Gift, t: "You Earn", d: "You earn exciting rewards" },
                ].map(({ icon: Icon, t, d }, i, arr) => (
                  <div key={t} className="flex flex-1 items-start gap-2">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-100">
                      <Icon className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{t}</p>
                      <p className="text-[10px] leading-tight text-neutral-500">{d}</p>
                    </div>
                    {i < arr.length - 1 && <ArrowRight className="mt-3 h-3 w-3 shrink-0 text-neutral-300" />}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom banner */}
        <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#faf6ed] px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#173d2c]">
              <Percent className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Stay Updated!</p>
              <p className="text-sm text-neutral-600">Enable notifications to never miss an exclusive offer.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[#173d2c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2b1e]">
            Enable Notifications <Bell className="h-4 w-4" />
          </button>
        </section>
      </main>
    </div>
    </Shell>
  );
}
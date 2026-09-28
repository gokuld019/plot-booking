import { useState } from "react";
import {
  X, Ruler, Square, Compass, Route, CornerDownRight,
  ShieldCheck, Layers, Building2, Phone, Tag,
} from "lucide-react";

/**
 * Full-detail plot modal.
 * Pass the raw `plot` object exactly as it comes back from
 * GET /api/customer/projects/:id  →  data.plots[i]
 * and `contact` from data.contact ({ phone, email }).
 *
 * <PlotDetailModal plot={plot} contact={contact} onClose={() => setOpen(false)} />
 */
export default function PlotDetailModal({ plot, contact, onClose }) {
  const [activeImage, setActiveImage] = useState(
    plot.image || plot.images?.[0] || null
  );

  if (!plot) return null;

  const hasDiscount = Number(plot.discount) > 0;
  const statusColorMap = {
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    gray: "bg-gray-100 text-gray-700",
  };
  const statusClass =
    statusColorMap[plot.status_color] || "bg-gray-100 text-gray-700";

  const detailItems = [
    { icon: Ruler, label: "Plot size", value: `${Number(plot.area_sqft).toLocaleString()} Sq.Ft.` },
    { icon: Square, label: "Dimensions", value: plot.dimension },
    { icon: Compass, label: "Facing", value: plot.facing },
    { icon: Route, label: "Road access", value: plot.road_access },
    { icon: CornerDownRight, label: "Corner plot", value: plot.corner },
    { icon: ShieldCheck, label: "Boundary wall", value: plot.boundary_wall },
    { icon: Layers, label: "Floor", value: plot.floor },
    { icon: Building2, label: "Block", value: plot.block_name },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid md:grid-cols-[1.1fr_1.4fr]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-1.5 text-gray-500 shadow hover:bg-white md:right-4"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Left: visual panel */}
        <div className="flex flex-col justify-between bg-emerald-950 p-6 text-white">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-emerald-300">{plot.block_name} · {plot.plot_type}</span>
            </div>
            <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-emerald-800 bg-emerald-900">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={plot.plot_number}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-4xl font-bold tracking-wide">
                  {plot.plot_number?.replace("PLOT-", "")}
                </span>
              )}
            </div>
          </div>

          {plot.images?.length > 1 && (
            <div className="mt-4 flex gap-2">
              {plot.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === img ? "border-emerald-300" : "border-transparent opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-900/80 px-3 py-1 text-xs text-emerald-200">
            {plot.facing} facing
          </div>
        </div>

        {/* Right: details panel */}
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{plot.plot_number}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
              {plot.status_badge}
            </span>
          </div>
          <p className="mb-4 text-sm text-gray-500">{plot.plot_type} plot</p>

          <div className="mb-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                ₹ {Number(plot.final_price.replace ? plot.final_price.replace(/,/g, "") : plot.final_price).toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-base text-gray-400 line-through">
                  ₹ {Number(plot.total_price.replace ? plot.total_price.replace(/,/g, "") : plot.total_price).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span>₹ {plot.price_per_sqft} / Sq.Ft.</span>
              {hasDiscount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
                  <Tag size={12} /> {plot.discount}% off
                </span>
              )}
            </div>
          </div>

          {plot.description && (
            <p className="mb-5 text-sm leading-relaxed text-gray-600">{plot.description}</p>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3">
            {detailItems
              .filter((d) => d.value)
              .map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-gray-200 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Icon size={14} /> {label}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{value}</div>
                </div>
              ))}
          </div>

          {plot.features?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {plot.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 rounded-xl bg-emerald-950 py-3 text-sm font-semibold text-white hover:bg-emerald-900">
              Book Now →
            </button>
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Phone size={16} /> Call us
              </a>
            )}
          </div>
          {contact?.phone && (
            <p className="mt-3 text-center text-xs text-gray-400">
              Need help choosing? Our team is at {contact.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
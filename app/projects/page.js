"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { getAllProjects } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllProjects()
      .then((data) => {
        const list = data.projects || data.data || data;
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Our Projects</h1>
        <p className="text-sm text-gray-500">
          Explore all available projects and find your perfect plot
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-10 bg-gray-200 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div
                className="h-40 bg-cover bg-center relative bg-gray-200"
                style={p.image ? { backgroundImage: `url(${p.image})` } : {}}
              >
                {p.tag && (
                  <span className="absolute top-3 left-3 text-white text-[11px] font-semibold px-3 py-1 rounded-full bg-green-600">
                    {p.tag}
                  </span>
                )}
                {p.status && (
                  <span className="absolute top-3 right-3 text-white text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-700">
                    {p.status}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base mb-1">{p.name || p.title}</h3>
                <div className="text-xs text-gray-400 mb-1">📍 {p.location}</div>
                {p.total_plots && (
                  <div className="text-xs text-gray-500 mb-2">
                    {p.available_plots ?? p.total_plots} plots available out of {p.total_plots}
                  </div>
                )}
                {(p.price_per_sqft || p.price) && (
                  <div className="text-sm text-gray-600 mb-3">
                    From <b className="text-green-600">₹{p.price_per_sqft || p.price} / Sq.Ft</b>
                  </div>
                )}
                <Link
                  href={`/projects/${p.id}`}
                  className="block w-full text-center bg-green-800 hover:bg-green-900 text-white py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏗️</div>
          <div className="text-gray-500 text-sm">No projects available at the moment</div>
        </div>
      )}
    </Shell>
  );
}

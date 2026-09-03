"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const data = await registerCustomer(form);
      setSuccess({
        message: data.message,
        password: data.password,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-lg font-bold tracking-tight text-gray-900">
            SRI HOUSING INFRA
          </div>
          <div className="text-[10px] text-yellow-700 tracking-widest">
            • TRUSTED LEGACY •
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-center mb-1">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Register to explore and book your dream plot
          </p>

          {/* Success message with generated password */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                ✅ {success.message}
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">
                  Your generated password:
                </div>
                <div className="text-lg font-bold text-gray-900 font-mono tracking-wide">
                  {success.password}
                </div>
                <div className="text-[11px] text-red-500 mt-1">
                  ⚠️ Save this password! You'll need it to login.
                </div>
              </div>
              <Link
                href="/login"
                className="mt-3 block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Go to Login →
              </Link>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              ❌ {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

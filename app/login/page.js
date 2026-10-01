"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginCustomer, saveAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginCustomer(form);
      saveAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
        background: "#f9fafb",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Background image */}
      <Image
        src="/intro1.jpeg"
        alt="Sri Housing Infra"
        fill
        priority
        style={{ objectFit: "contain", objectPosition: "center", zIndex: 0 }}
      />

      {/* Login card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "460px",
          margin: "0 90px 0 0",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          padding: "40px 40px 32px",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          marginRight: "280px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#231F20",
            textAlign: "center",
            margin: "0 0 6px",
          }}
        >
          Welcome Back
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#6B6B6B",
            margin: "0 0 24px",
          }}
        >
          Login to manage your plot bookings
        </p>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fdecec",
              border: "1px solid #f5c2c2",
              color: "#b3261e",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "13.5px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#991B1B",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              !
            </span>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13.5px",
                fontWeight: 600,
                color: "#231F20",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "15px",
                }}
              >
                ✉️
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px 12px 40px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.border = "1px solid #991B1B")
                }
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13.5px",
                fontWeight: 600,
                color: "#231F20",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "15px",
                }}
              >
                🔒
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 44px 12px 40px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.border = "1px solid #991B1B")
                }
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px",
                  color: "#9ca3af",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "13px",
                  color: "#991B1B",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#C25B5B" : "#991B1B",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#7F1D1D";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#991B1B";
            }}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "22px 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#4b5563",
            margin: "0 0 20px",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "#991B1B",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Register
          </Link>
        </p>

        {/* Footer illustration */}
        <div style={{ position: "relative", textAlign: "center" }}>
          <svg
            viewBox="0 0 400 90"
            style={{ width: "100%", height: "70px" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,90 Q50,40 100,70 T200,60 T300,75 T400,50 L400,90 Z"
              fill="#fee2e2"
            />
            <path
              d="M0,90 Q60,55 130,78 T260,65 T400,80 L400,90 Z"
              fill="#fecaca"
            />
            <g stroke="#231F20" strokeWidth="2" fill="none">
              <path d="M170 55 L170 30" />
              <path d="M160 30 L180 30 L170 15 Z" fill="#231F20" stroke="none" />
              <rect x="165" y="42" width="10" height="13" fill="#231F20" stroke="none" />
              <line x1="140" y1="55" x2="140" y2="40" />
              <circle cx="140" cy="35" r="6" />
              <line x1="205" y1="55" x2="205" y2="38" />
              <circle cx="205" cy="32" r="7" />
            </g>
          </svg>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "2.5px",
              color: "#231F20",
              fontWeight: 600,
              marginTop: "-6px",
            }}
          >
            PLOTS FOR A BETTER TOMORROW
          </div>
        </div>
      </div>
    </div>
  );
}
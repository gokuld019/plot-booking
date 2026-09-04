"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Background image */}
      <Image
        src="/intro.png"
        alt="Sri Housing Infra"
        fill
        priority
        style={{ objectFit: "cover", zIndex: 0 }}
      />

      {/* Overlay content: logo + tagline on the left */}
     

      {/* Register card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "460px",
          margin: "40px 90px 40px 0",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          padding: "40px 40px 32px",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          maxHeight: "90vh",
          overflowY: "auto",
          marginRight: "259px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#12352b",
            textAlign: "center",
            margin: "0 0 6px",
          }}
        >
          Create Account
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#6b7280",
            margin: "0 0 24px",
          }}
        >
          Register to explore and book your dream plot
        </p>

        {/* Success message with generated password */}
        {success && (
          <div
            style={{
              background: "#f0faf1",
              border: "1px solid #bbe8c0",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#166534",
                fontWeight: 700,
                fontSize: "14px",
                marginBottom: "10px",
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
                  background: "#16a34a",
                  color: "#fff",
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              {success.message}
            </div>
            <div
              style={{
                background: "#ffffff",
                borderRadius: "10px",
                padding: "12px 14px",
                border: "1px solid #bbe8c0",
              }}
            >
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                Your generated password:
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#12352b",
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                }}
              >
                {success.password}
              </div>
              <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "6px" }}>
                ⚠️ Save this password! You&apos;ll need it to login.
              </div>
            </div>
            <Link
              href="/login"
              style={{
                marginTop: "14px",
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                background: "#12352b",
                color: "#fff",
                textAlign: "center",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to Login →
            </Link>
          </div>
        )}

        {/* Error message */}
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
                background: "#e11d2e",
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

        {!success && (
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
                  color: "#12352b",
                  marginBottom: "8px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #12352b")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#12352b",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
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
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #12352b")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#12352b",
                  marginBottom: "8px",
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #12352b")}
                onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#3d5c50" : "#12352b",
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
            >
              {loading ? "Registering..." : "Register"}
              {!loading && <span>→</span>}
            </button>
          </form>
        )}

        {!success && (
          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#4b5563",
              margin: "20px 0 0",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#166534",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, saveAuth, clearAuth, getProfile, logoutCustomer } from "@/lib/api";

const AuthContext = createContext(null);

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      setLoading(false);
      if (!PUBLIC_PATHS.includes(pathname)) {
        router.replace("/login");
      }
      return;
    }

    // Set cached user immediately
    setUser(auth.user);

    // Fetch fresh profile
    getProfile()
      .then((data) => {
        const freshUser = data.user || data;
        setUser(freshUser);
        saveAuth(auth.token, freshUser);
      })
      .catch(() => {
        // Token might be expired
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } catch {
      // ignore logout API errors
    }
    clearAuth();
    setUser(null);
    router.replace("/login");
  }, [router]);

  // Redirect logged-in users away from public pages
  useEffect(() => {
    if (!loading && user && PUBLIC_PATHS.includes(pathname)) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

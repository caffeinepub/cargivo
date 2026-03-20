import { useEffect, useState } from "react";

const ADMIN_SESSION_KEY = "cargivo_admin_session";

export interface AdminSession {
  email: string;
  password: string;
}

export function useAdminAuth() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAdminAuthenticated = !!adminSession;

  const adminLogin = (email: string, password: string) => {
    const session: AdminSession = { email, password };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    setAdminSession(session);
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminSession(null);
  };

  return { adminSession, isAdminAuthenticated, adminLogin, adminLogout };
}

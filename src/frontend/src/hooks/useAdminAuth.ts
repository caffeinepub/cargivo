import { useActor } from "@/hooks/useActor";
import { useCallback, useState } from "react";

const STORAGE_KEY = "adminAuth";

interface AdminAuthData {
  email: string;
  password: string;
}

function loadFromStorage(): AdminAuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminAuthData;
  } catch {
    return null;
  }
}

export function useAdminAuth() {
  const [authData, setAuthData] = useState<AdminAuthData | null>(
    loadFromStorage,
  );
  const { actor } = useActor();

  const adminLogin = useCallback(
    async (email: string, password: string) => {
      if (!actor) return { success: false, error: "Backend not ready" };
      const result = await actor.verifyAdminLogin(email, password);
      if (result.__kind__ === "ok") {
        const data: AdminAuthData = { email, password };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setAuthData(data);
        return { success: true };
      }
      return { success: false, error: "Invalid admin credentials" };
    },
    [actor],
  );

  const adminLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthData(null);
  }, []);

  return {
    isAdminAuthenticated: authData !== null,
    adminLogin,
    adminLogout,
    adminEmail: authData?.email ?? "",
    adminPassword: authData?.password ?? "",
    // Compat with useQueries
    adminSession: authData
      ? { email: authData.email, password: authData.password }
      : null,
  };
}

import type { CustomerProfile, RegisterEmailUserArgs } from "@/backend.d";
import { createActorWithConfig } from "@/config";
import { useEffect, useState } from "react";

const SESSION_KEY = "cargivo_email_session";

interface EmailSession {
  email: string;
  password: string;
  profile: CustomerProfile;
}

function loadSession(): EmailSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as EmailSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: EmailSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Notify all hook instances in the same tab
  window.dispatchEvent(new CustomEvent("cargivo_auth_change"));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("cargivo_auth_change"));
}

async function getActor() {
  return createActorWithConfig();
}

export function useEmailAuth() {
  const [session, setSession] = useState<EmailSession | null>(loadSession);

  // Re-sync state whenever another instance updates localStorage
  useEffect(() => {
    const handler = () => setSession(loadSession());
    window.addEventListener("cargivo_auth_change", handler);
    return () => window.removeEventListener("cargivo_auth_change", handler);
  }, []);

  const emailUser = session?.profile ?? null;
  const isEmailAuthenticated = session !== null;

  const emailLogin = async (email: string, password: string) => {
    const actor = await getActor();
    const result = await actor.loginEmailUser({ email, password });
    if (result.__kind__ === "ok") {
      const newSession: EmailSession = { email, password, profile: result.ok };
      saveSession(newSession);
      setSession(newSession);
    }
    return result;
  };

  const emailRegister = async (args: RegisterEmailUserArgs) => {
    const actor = await getActor();
    return actor.registerEmailUser(args);
  };

  const emailLogout = () => {
    clearSession();
    setSession(null);
  };

  return {
    emailUser,
    emailLogin,
    emailRegister,
    emailLogout,
    isEmailAuthenticated,
  };
}

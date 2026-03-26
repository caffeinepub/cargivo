import type { CustomerProfile, RegisterEmailUserArgs } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useCallback, useState } from "react";

const STORAGE_KEY = "emailAuth";

interface EmailAuthData {
  email: string;
  password: string;
  profile: CustomerProfile;
}

function loadFromStorage(): EmailAuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EmailAuthData;
  } catch {
    return null;
  }
}

export function useEmailAuth() {
  const [authData, setAuthData] = useState<EmailAuthData | null>(
    loadFromStorage,
  );
  const { actor } = useActor();

  const emailLogin = useCallback(
    async (email: string, password: string) => {
      if (!actor) return { success: false, error: "Backend not ready" };
      const result = await actor.loginEmailUser({ email, password });
      if (result.__kind__ === "ok") {
        const data: EmailAuthData = { email, password, profile: result.ok };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setAuthData(data);
        return { success: true, profile: result.ok };
      }
      return {
        success: false,
        error:
          result.__kind__ === "errWrongPassword"
            ? "Wrong password"
            : "Account not found",
      };
    },
    [actor],
  );

  const emailSignup = useCallback(
    async (args: RegisterEmailUserArgs) => {
      if (!actor) return { success: false, error: "Backend not ready" };
      const result = await actor.registerEmailUser(args);
      if (result.__kind__ === "ok") {
        const loginResult = await actor.loginEmailUser({
          email: args.email,
          password: args.password,
        });
        if (loginResult.__kind__ === "ok") {
          const data: EmailAuthData = {
            email: args.email,
            password: args.password,
            profile: loginResult.ok,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setAuthData(data);
          return { success: true, profile: loginResult.ok };
        }
        return { success: true };
      }
      if (result.__kind__ === "errEmailTaken")
        return { success: false, error: "Email already registered" };
      return { success: false, error: "Registration failed" };
    },
    [actor],
  );

  const emailLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthData(null);
  }, []);

  return {
    emailUser: authData?.profile ?? null,
    emailCredentials: authData
      ? { email: authData.email, password: authData.password }
      : null,
    isEmailAuthenticated: authData !== null,
    emailLogin,
    emailLogout,
    emailSignup,
    // Compat with useQueries
    emailSession: authData
      ? { email: authData.email, password: authData.password }
      : null,
  };
}

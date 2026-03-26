import { Toaster } from "@/components/ui/sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLoginPage from "@/pages/AdminLoginPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import { useCallback, useState } from "react";

export type NavigateFn = (path: string) => void;

export default function App() {
  const [path, setPath] = useState(
    () => window.location.pathname.replace(/^\/cargivo/, "") || "/",
  );

  const navigate: NavigateFn = useCallback((to: string) => {
    const full = to;
    history.pushState(null, "", full);
    setPath(to);
  }, []);

  const {
    isEmailAuthenticated,
    isActorReady,
    emailLogin,
    emailLogout,
    emailSignup,
    emailUser,
    emailCredentials,
  } = useEmailAuth();
  const {
    isAdminAuthenticated,
    isActorReady: isAdminActorReady,
    adminLogin,
    adminLogout,
    adminEmail,
    adminPassword,
  } = useAdminAuth();

  // Route guards
  if (path === "/dashboard" && !isEmailAuthenticated) {
    return (
      <LoginPage
        navigate={navigate}
        isActorReady={isActorReady}
        emailLogin={emailLogin}
        adminLogin={adminLogin}
        emailSignup={emailSignup}
      />
    );
  }
  if (path === "/admin" && !isAdminAuthenticated) {
    return (
      <AdminLoginPage
        navigate={navigate}
        isActorReady={isAdminActorReady}
        adminLogin={adminLogin}
      />
    );
  }

  switch (path) {
    case "/login":
      return (
        <>
          <LoginPage
            navigate={navigate}
            isActorReady={isActorReady}
            emailLogin={emailLogin}
            adminLogin={adminLogin}
            emailSignup={emailSignup}
          />
          <Toaster />
        </>
      );
    case "/admin-login":
      return (
        <>
          <AdminLoginPage
            navigate={navigate}
            isActorReady={isAdminActorReady}
            adminLogin={adminLogin}
          />
          <Toaster />
        </>
      );
    case "/dashboard":
      return (
        <>
          <CustomerDashboard
            navigate={navigate}
            emailLogout={emailLogout}
            emailUser={emailUser}
            emailCredentials={emailCredentials}
          />
          <Toaster />
        </>
      );
    case "/admin":
      return (
        <>
          <AdminDashboard
            navigate={navigate}
            adminLogout={adminLogout}
            adminEmail={adminEmail}
            adminPassword={adminPassword}
          />
          <Toaster />
        </>
      );
    case "/privacy-policy":
      return (
        <>
          <PrivacyPolicyPage navigate={navigate} />
          <Toaster />
        </>
      );
    case "/terms":
      return (
        <>
          <TermsOfServicePage navigate={navigate} />
          <Toaster />
        </>
      );
    case "/refund-policy":
      return (
        <>
          <RefundPolicyPage navigate={navigate} />
          <Toaster />
        </>
      );
    default:
      return (
        <>
          <LandingPage
            navigate={navigate}
            isEmailAuthenticated={isEmailAuthenticated}
            emailSignup={emailSignup}
          />
          <Toaster />
        </>
      );
  }
}

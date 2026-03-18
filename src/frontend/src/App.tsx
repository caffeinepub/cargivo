import { OnboardingModal } from "@/components/OnboardingModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetMyProfile, useIsCallerAdmin } from "@/hooks/useQueries";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { CustomerDashboard } from "@/pages/CustomerDashboard";
import { InvoicePage } from "@/pages/InvoicePage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { useEffect, useState } from "react";

function useRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = (to: string) => {
    history.pushState({}, "", to);
    setPath(to);
  };

  return { path, navigate };
}

function AppLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-3 w-64">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

export default function App() {
  const { path, navigate } = useRouter();
  const { identity, login, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetMyProfile();

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const showOnboarding =
    isAuthenticated && profileFetched && !profileLoading && profile === null;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (profileLoading || adminLoading) return;
    if (profile === null) return;
    if (path === "/" || path === "" || path === "/login") {
      navigate(isAdmin ? "/admin" : "/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    profile,
    profileLoading,
    adminLoading,
    isAdmin,
    path,
    navigate,
  ]);

  if (isInitializing || (isAuthenticated && (profileLoading || adminLoading))) {
    return <AppLoader />;
  }

  const invoiceMatch = path.match(/^\/invoice\/(.+)$/);
  if (invoiceMatch) {
    if (!isAuthenticated) {
      navigate("/");
      return null;
    }
    const requestId = BigInt(invoiceMatch[1]);
    return (
      <>
        <InvoicePage requestId={requestId} onNavigate={navigate} />
        <Toaster richColors />
      </>
    );
  }

  if (path === "/admin") {
    if (!isAuthenticated) {
      navigate("/");
      return null;
    }
    return (
      <>
        <AdminDashboard onNavigate={navigate} />
        <Toaster richColors />
      </>
    );
  }

  if (path === "/dashboard") {
    if (!isAuthenticated) {
      navigate("/");
      return null;
    }
    return (
      <>
        <CustomerDashboard onNavigate={navigate} />
        {showOnboarding && <OnboardingModal open />}
        <Toaster richColors />
      </>
    );
  }

  if (path === "/login") {
    return (
      <>
        <LoginPage onNavigate={navigate} />
        <Toaster richColors />
      </>
    );
  }

  return (
    <>
      <LandingPage onNavigate={navigate} onLogin={login} />
      {showOnboarding && <OnboardingModal open />}
      <Toaster richColors />
    </>
  );
}

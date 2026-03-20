import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin } = useAdminAuth();
  const { actor } = useActor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await actor.loginEmailUser({ email, password });
      if (result.__kind__ === "ok") {
        adminLogin(email, password);
        toast.success("Welcome to Admin Panel");
        onNavigate("/admin");
      } else {
        toast.error("Invalid admin credentials");
      }
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className="absolute top-6 left-6 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
      >
        ← Back to Home
      </button>

      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 border border-gray-700/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <img
              src="/assets/uploads/image-4-1.png"
              alt="Cargivo"
              className="h-14 w-auto mx-auto mb-4 object-contain"
            />
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-orange-400" />
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            </div>
            <p className="text-gray-400 text-sm">Authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Admin Email</Label>
              <Input
                type="email"
                placeholder="admin@cargivo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/60 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold h-11 rounded-xl transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Login to Admin Panel
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-xs text-orange-300/80 text-center">
              This portal is for Cargivo administrators only. Unauthorized
              access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

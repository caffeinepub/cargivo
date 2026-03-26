import type { NavigateFn } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: NavigateFn;
  isActorReady: boolean;
  adminLogin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminLoginPage({
  navigate,
  isActorReady,
  adminLogin,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await adminLogin(email, password);
    setIsLoading(false);
    if (result.success) {
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else {
      toast.error(result.error ?? "Invalid credentials");
    }
  };

  const isSubmitDisabled = isLoading || !isActorReady;

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <div className="p-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="admin_login.back.link"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">
              Access the Cargivo admin dashboard
            </p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-xs border border-border p-8"
            data-ocid="admin_login.panel"
          >
            <div className="mb-6 p-3 bg-accent rounded-xl">
              <p className="text-xs text-muted-foreground text-center">
                Default: admin@cargivo.com / Cargivo@2024
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Also: lovepreet_singh@cargivo.shop / Cargivo@2024
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cargivo.com"
                  className="mt-1"
                  data-ocid="admin_login.input"
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    data-ocid="admin_login.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={isSubmitDisabled}
                data-ocid="admin_login.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
                    in...
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  "Login to Admin"
                )}
              </Button>
              {!isActorReady && (
                <p
                  className="text-center text-xs text-muted-foreground"
                  data-ocid="admin_login.loading_state"
                >
                  Connecting to server, please wait…
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

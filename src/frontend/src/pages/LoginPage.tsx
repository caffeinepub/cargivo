import type { NavigateFn } from "@/App";
import type { RegisterEmailUserArgs } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: NavigateFn;
  isActorReady: boolean;
  emailLogin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  emailSignup: (
    args: RegisterEmailUserArgs,
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginPage({
  navigate,
  isActorReady,
  emailLogin,
  adminLogin,
  emailSignup,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupForm, setSignupForm] = useState({
    companyName: "",
    gstNumber: "",
    email: "",
    password: "",
    pincode: "",
    state: "",
    city: "",
    landmark: "",
    building: "",
    phone: "",
    contactName: "",
  });

  const ADMIN_EMAILS = ["admin@cargivo.com", "lovepreet_singh@cargivo.shop"];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (ADMIN_EMAILS.includes(email.toLowerCase())) {
        const result = await adminLogin(email, password);
        if (result.success) {
          toast.success("Welcome, Admin!");
          navigate("/admin");
          return;
        }
        toast.error(result.error ?? "Invalid admin credentials");
        return;
      }
      const result = await emailLogin(email, password);
      if (result.success) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(result.error ?? "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    const address = `${signupForm.building}, ${signupForm.landmark}, ${signupForm.city}, ${signupForm.state} - ${signupForm.pincode}`;
    const result = await emailSignup({
      companyName: signupForm.companyName,
      gstNumber: signupForm.gstNumber,
      email: signupForm.email,
      password: signupForm.password,
      address,
      phone: signupForm.phone,
      contactName: signupForm.contactName,
    });
    setIsSigningUp(false);
    if (result.success) {
      toast.success("Account created! Welcome to Cargivo.");
      setShowSignup(false);
      navigate("/dashboard");
    } else {
      toast.error(result.error ?? "Signup failed");
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
          data-ocid="login.back.link"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/assets/uploads/cargivo_logo_with_motion_trails-019d2b28-4cc6-7378-aae8-b18db2273b4e-1.png"
              alt="Cargivo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-display font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-1">
              Sign in to your Cargivo account
            </p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-xs border border-border p-8"
            data-ocid="login.panel"
          >
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1"
                  data-ocid="login.input"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    data-ocid="login.input"
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
                data-ocid="login.submit_button"
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
                  "Login"
                )}
              </Button>
              {!isActorReady && (
                <p
                  className="text-center text-xs text-muted-foreground"
                  data-ocid="login.loading_state"
                >
                  Connecting to server, please wait…
                </p>
              )}
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setShowSignup(true)}
                data-ocid="login.signup.link"
              >
                Signup
              </button>
            </p>
            <div className="border-t border-border mt-6 pt-4 text-center">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => navigate("/admin-login")}
                data-ocid="login.admin.link"
              >
                Admin Portal →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="signup.modal"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">
              Create Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignup} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="ls-company">Company Name *</Label>
                <Input
                  id="ls-company"
                  required
                  value={signupForm.companyName}
                  onChange={(e) =>
                    setSignupForm((f) => ({
                      ...f,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="ABC Exports Pvt Ltd"
                  data-ocid="signup.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ls-gst">GST Number *</Label>
                <Input
                  id="ls-gst"
                  required
                  value={signupForm.gstNumber}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, gstNumber: e.target.value }))
                  }
                  placeholder="22AAAAA0000A1Z5"
                  data-ocid="signup.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ls-email">Email *</Label>
                <Input
                  id="ls-email"
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@company.com"
                  data-ocid="signup.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ls-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="ls-password"
                    type={showSignupPw ? "text" : "password"}
                    required
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    data-ocid="signup.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowSignupPw((p) => !p)}
                  >
                    {showSignupPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-3">Address</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ls-pincode">Pincode *</Label>
                  <Input
                    id="ls-pincode"
                    required
                    value={signupForm.pincode}
                    onChange={(e) =>
                      setSignupForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                    placeholder="400001"
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label htmlFor="ls-state">State *</Label>
                  <Input
                    id="ls-state"
                    required
                    value={signupForm.state}
                    onChange={(e) =>
                      setSignupForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="Maharashtra"
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label htmlFor="ls-city">City *</Label>
                  <Input
                    id="ls-city"
                    required
                    value={signupForm.city}
                    onChange={(e) =>
                      setSignupForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Mumbai"
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label htmlFor="ls-landmark">Landmark *</Label>
                  <Input
                    id="ls-landmark"
                    required
                    value={signupForm.landmark}
                    onChange={(e) =>
                      setSignupForm((f) => ({ ...f, landmark: e.target.value }))
                    }
                    placeholder="Near Station"
                    data-ocid="signup.input"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="ls-building">Building / Shop No *</Label>
                  <Input
                    id="ls-building"
                    required
                    value={signupForm.building}
                    onChange={(e) =>
                      setSignupForm((f) => ({ ...f, building: e.target.value }))
                    }
                    placeholder="Shop 12, Andheri Plaza"
                    data-ocid="signup.input"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ls-phone">Phone Number *</Label>
                <Input
                  id="ls-phone"
                  required
                  value={signupForm.phone}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 9876543210"
                  data-ocid="signup.input"
                />
              </div>
              <div>
                <Label htmlFor="ls-contact">Contact Name *</Label>
                <Input
                  id="ls-contact"
                  required
                  value={signupForm.contactName}
                  onChange={(e) =>
                    setSignupForm((f) => ({
                      ...f,
                      contactName: e.target.value,
                    }))
                  }
                  placeholder="Rahul Sharma"
                  data-ocid="signup.input"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={isSigningUp || !isActorReady}
              data-ocid="signup.submit_button"
            >
              {isSigningUp ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

const emptyLoginForm = { email: "", password: "" };
const emptyRegForm = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  phone: "",
  gstNumber: "",
  address: "",
};

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [form, setForm] = useState(emptyLoginForm);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState(emptyRegForm);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const { emailLogin, emailRegister } = useEmailAuth();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLoginError("");
  }

  function handleRegChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setRegForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRegError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const result = await emailLogin(form.email, form.password);
      if (result.__kind__ === "ok") {
        toast.success("Logged in successfully! Welcome back.");
        setForm(emptyLoginForm);
        onNavigate("/dashboard");
      } else if (result.__kind__ === "errNotFound") {
        setLoginError("Email not found. Please check or sign up.");
      } else if (result.__kind__ === "errWrongPassword") {
        setLoginError("Wrong password. Please try again.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      const result = await emailRegister({
        email: regForm.email,
        password: regForm.password,
        companyName: regForm.companyName,
        gstNumber: regForm.gstNumber,
        address: regForm.address,
        phone: regForm.phone,
        contactName: regForm.contactName,
      });
      if (result.__kind__ === "ok") {
        // Auto-login after successful registration
        const loginResult = await emailLogin(regForm.email, regForm.password);
        setShowRegister(false);
        setRegForm(emptyRegForm);
        if (loginResult.__kind__ === "ok") {
          toast.success("Account created! Welcome to Cargivo.");
          onNavigate("/dashboard");
        } else {
          toast.success("Account created! Please log in.");
          setForm((prev) => ({ ...prev, email: regForm.email }));
        }
      } else if (result.__kind__ === "errEmailTaken") {
        setRegError("Email already registered. Please log in.");
      } else {
        setRegError("Invalid details. Please check your information.");
      }
    } catch {
      setRegError("Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-background to-blue-600/10" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-400/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute inset-0 grid-noise opacity-30" />

      {/* Back to Home */}
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        data-ocid="login.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Registration Modal */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="register.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Your Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-companyName">Company Name</Label>
                <Input
                  id="reg-companyName"
                  name="companyName"
                  placeholder="Acme Logistics Pvt Ltd"
                  value={regForm.companyName}
                  onChange={handleRegChange}
                  required
                  data-ocid="register.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-contactName">Contact Name</Label>
                <Input
                  id="reg-contactName"
                  name="contactName"
                  placeholder="Rajesh Kumar"
                  value={regForm.contactName}
                  onChange={handleRegChange}
                  required
                  data-ocid="register.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email Address</Label>
              <Input
                id="reg-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={regForm.email}
                onChange={handleRegChange}
                required
                data-ocid="register.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={regForm.password}
                onChange={handleRegChange}
                required
                data-ocid="register.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone">Phone Number</Label>
                <Input
                  id="reg-phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={regForm.phone}
                  onChange={handleRegChange}
                  required
                  data-ocid="register.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-gst">GST Number</Label>
                <Input
                  id="reg-gst"
                  name="gstNumber"
                  placeholder="22AAAAA0000A1Z5"
                  value={regForm.gstNumber}
                  onChange={handleRegChange}
                  required
                  data-ocid="register.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-address">Business Address</Label>
              <Textarea
                id="reg-address"
                name="address"
                placeholder="123 Industrial Area, Mumbai, Maharashtra 400001"
                value={regForm.address}
                onChange={handleRegChange}
                required
                rows={3}
                data-ocid="register.textarea"
              />
            </div>
            {regError && (
              <p
                className="text-sm text-red-500"
                data-ocid="register.error_state"
              >
                {regError}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowRegister(false)}
                disabled={regLoading}
                data-ocid="register.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-orange"
                disabled={regLoading}
                data-ocid="register.submit_button"
              >
                {regLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                    up...
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={() => onNavigate("/")}
              className="focus:outline-none"
            >
              <img
                src="/assets/generated/logo-transparent.png"
                alt="Cargivo"
                className="h-16 w-auto"
              />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Login to manage your cargo box quotes
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-ocid="login.dialog"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                data-ocid="login.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                data-ocid="login.input"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500" data-ocid="login.error_state">
                {loginError}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-orange h-11 text-base"
              disabled={loginLoading}
              data-ocid="login.submit_button"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
                  in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-primary font-semibold hover:underline"
              data-ocid="login.register_link"
            >
              Signup
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

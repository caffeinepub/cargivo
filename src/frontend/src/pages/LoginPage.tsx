import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

const emptyForm = { email: "", password: "" };

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [form, setForm] = useState(emptyForm);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Logged in successfully! Welcome back.");
    setForm(emptyForm);
    onNavigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-background to-blue-600/10" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-400/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute inset-0 grid-noise opacity-30" />

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
                src="/assets/uploads/image-1-2.png"
                alt="Cargivo"
                className="h-12 w-auto"
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
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-orange h-11 text-base"
              data-ocid="login.submit_button"
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("/")}
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

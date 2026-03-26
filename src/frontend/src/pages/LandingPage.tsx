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
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Package,
  Quote,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: NavigateFn;
  isEmailAuthenticated: boolean;
  emailSignup: (
    args: RegisterEmailUserArgs,
  ) => Promise<{ success: boolean; error?: string }>;
}

function LogoImage({ className }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return (
      <span
        className={`font-bold text-primary text-2xl tracking-wide ${className ?? ""}`}
      >
        CARGIVO
      </span>
    );
  }

  return (
    <img
      src="/assets/generated/cargivo-logo-transparent.dim_200x60.png"
      alt="Cargivo"
      className={className}
      onError={() => setUseFallback(true)}
    />
  );
}

export default function LandingPage({
  navigate,
  isEmailAuthenticated,
  emailSignup,
}: Props) {
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    gstNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    pincode: "",
    state: "",
    city: "",
    landmark: "",
    building: "",
    phone: "",
    contactName: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    const address = `${form.building}, ${form.landmark}, ${form.city}, ${form.state} - ${form.pincode}`;
    const result = await emailSignup({
      companyName: form.companyName,
      gstNumber: form.gstNumber,
      email: form.email,
      password: form.password,
      address,
      phone: form.phone,
      contactName: form.contactName,
    });
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Account created! Welcome to Cargivo.");
      setShowSignup(false);
      navigate("/dashboard");
    } else {
      toast.error(result.error ?? "Signup failed");
    }
  };

  const handleRequestQuote = () => {
    if (isEmailAuthenticated) navigate("/dashboard");
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 bg-white border-b border-border shadow-xs"
        data-ocid="nav.panel"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <LogoImage className="h-14 w-auto" />
              <nav className="hidden md:flex items-center gap-6">
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                  data-ocid="nav.link"
                >
                  How It Works
                </a>
                <a
                  href="#box-types"
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                  data-ocid="nav.link"
                >
                  Box Types
                </a>
                <a
                  href="#industries"
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                  data-ocid="nav.link"
                >
                  Industries
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-accent"
                onClick={() => navigate("/login")}
                data-ocid="nav.login.button"
              >
                Login
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowSignup(true)}
                data-ocid="nav.signup.button"
              >
                Signup
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="hero-gradient text-white py-24 px-4"
        data-ocid="hero.section"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="h-3.5 w-3.5" /> Quotes in under 20 minutes
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Fast Custom Box Quotes
          </h1>
          <p className="text-xl md:text-2xl text-white/85 mb-10 max-w-2xl mx-auto">
            Connect with verified fabricators for Metal, Wooden, Plastic &
            Custom cargo boxes. Get competitive quotes fast.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-6 rounded-full shadow-lg"
              onClick={handleRequestQuote}
              data-ocid="hero.primary_button"
            >
              Request a Quote <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-full"
              onClick={() => setShowSignup(true)}
              data-ocid="hero.secondary_button"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary font-display">500+</p>
            <p className="text-sm text-muted-foreground mt-1">
              Active Suppliers
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary font-display">
              &lt;20 min
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Average Quote Time
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary font-display">
              10,000+
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Orders Fulfilled
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary font-display">50+</p>
            <p className="text-sm text-muted-foreground mt-1">Cities Served</p>
          </div>
        </div>
      </section>

      {/* Why Choose Cargivo */}
      <section className="py-20 px-4 bg-white" data-ocid="why_cargivo.section">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            Why Choose Cargivo?
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            India's most trusted platform for custom cargo box fabrication
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Suppliers",
                desc: "Only verified, GST-registered fabricators on our platform. Every supplier is vetted for quality and reliability.",
                color: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                icon: FileText,
                title: "Transparent Pricing",
                desc: "No hidden costs. Get itemized quotes with base price, GST breakdown, and delivery charges upfront.",
                color: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                icon: Zap,
                title: "Fast Turnaround",
                desc: "Production starts within 24 hours of advance payment. Most orders delivered within 7–10 working days.",
                color: "bg-orange-50",
                iconColor: "text-primary",
              },
            ].map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div
                key={title}
                className="rounded-2xl p-8 border border-border shadow-xs hover:shadow-md transition-all hover:-translate-y-1 text-center"
              >
                <div
                  className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5`}
                >
                  <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 px-4 bg-secondary/40"
        data-ocid="how_it_works.section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Three simple steps to get your custom boxes
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                step: "1",
                title: "Submit Request",
                desc: "Fill in your box specs — type, dimensions, quantity, and delivery location.",
              },
              {
                icon: Clock,
                step: "2",
                title: "Get Quotes in 20 mins",
                desc: "Our admin collects quotes from verified suppliers and sends you the best price.",
              },
              {
                icon: Truck,
                step: "3",
                title: "Confirm & Manufacture",
                desc: "Pay 50% advance, we manufacture and deliver with GST-compliant invoice.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="bg-white rounded-2xl p-8 shadow-xs border border-border text-center relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {step}
                </div>
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section
        id="industries"
        className="py-20 px-4 bg-white"
        data-ocid="industries.section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            Industries We Serve
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-lg">
            Trusted by businesses across every major sector
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "Automotive", emoji: "🚗" },
              { label: "Pharmaceuticals", emoji: "💊" },
              { label: "Electronics", emoji: "💻" },
              { label: "Food & Beverage", emoji: "🍱" },
              { label: "Textile", emoji: "🧵" },
              { label: "Machinery", emoji: "⚙️" },
              { label: "Agriculture", emoji: "🌾" },
              { label: "Retail", emoji: "🛍️" },
            ].map(({ label, emoji }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-secondary/60 border border-border rounded-full px-5 py-2.5 font-medium text-sm hover:bg-accent hover:border-primary hover:text-primary transition-all cursor-default"
              >
                <span className="text-lg">{emoji}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Box Types */}
      <section
        id="box-types"
        className="py-20 px-4 bg-secondary/40"
        data-ocid="box_types.section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            Box Types We Fabricate
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Custom dimensions for every industry need
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Metal Boxes",
                color: "from-slate-500 to-slate-700",
                emoji: "🏗️",
                desc: "Heavy-duty industrial grade",
              },
              {
                label: "Wooden Boxes",
                color: "from-amber-600 to-amber-800",
                emoji: "🪵",
                desc: "Natural & sustainable",
              },
              {
                label: "Plastic Boxes",
                color: "from-blue-500 to-blue-700",
                emoji: "📦",
                desc: "Lightweight & weatherproof",
              },
              {
                label: "Custom Boxes",
                color: "from-primary to-orange-600",
                emoji: "⚙️",
                desc: "Any material, any spec",
              },
            ].map(({ label, color, emoji, desc }) => (
              <div
                key={label}
                className="rounded-2xl overflow-hidden border border-border shadow-xs hover:shadow-md transition-shadow"
              >
                <div
                  className={`bg-gradient-to-br ${color} p-8 text-center text-4xl`}
                >
                  {emoji}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-display font-semibold">{label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Pricing Works */}
      <section className="py-20 px-4 bg-white" data-ocid="pricing.section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            How Pricing Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Simple, transparent, GST-compliant process
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Package,
                title: "Submit Specs → Get Quote",
                desc: "Share your box requirements. We collect competitive quotes from verified suppliers within 20 minutes.",
                highlight: "Free to request",
              },
              {
                step: "2",
                icon: CheckCircle,
                title: "Pay 50% Advance → Production Starts",
                desc: "Approve the quote and pay 50% advance. Manufacturing begins within 24 hours of payment confirmation.",
                highlight: "50% advance",
              },
              {
                step: "3",
                icon: FileText,
                title: "Delivery + Balance → GST Invoice",
                desc: "Receive your order, inspect it, and pay the remaining 50% balance. GST-compliant invoice provided.",
                highlight: "GST invoice included",
              },
            ].map(({ step, icon: Icon, title, desc, highlight }) => (
              <div
                key={step}
                className="relative rounded-2xl border-2 border-primary/20 p-6 bg-gradient-to-b from-orange-50/50 to-white"
              >
                <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Step {step}
                </div>
                <div className="mt-4 mb-3">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {desc}
                </p>
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="py-20 px-4 bg-secondary/40"
        data-ocid="testimonials.section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Thousands of businesses trust Cargivo for their packaging needs
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Got a quote in 15 minutes. Best service for bulk metal boxes. The quality exceeded our expectations and delivery was on time.",
                name: "Rajesh Kumar",
                company: "Kumar Industries",
                city: "Mumbai",
                rating: 5,
              },
              {
                quote:
                  "Quality wooden boxes delivered on time. Will order again. The auto-saved address feature saved us so much time on repeat orders.",
                name: "Priya Shah",
                company: "Shah Exports Pvt Ltd",
                city: "Ahmedabad",
                rating: 5,
              },
              {
                quote:
                  "Custom plastic boxes exactly as specified. Great supplier network. Our pharmaceutical packaging requirements were met perfectly.",
                name: "Amit Patel",
                company: "Patel Pharma Logistics",
                city: "Pune",
                rating: 5,
              },
            ].map(({ quote, name, company, city }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-6 shadow-xs border border-border flex flex-col gap-4"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-primary/30" />
                <p className="text-foreground/80 text-sm leading-relaxed flex-1 italic">
                  "{quote}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company} · {city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 hero-gradient text-white text-center">
        <h2 className="text-4xl font-display font-bold mb-4">
          Ready to get started?
        </h2>
        <p className="text-white/85 text-lg mb-8">
          Join hundreds of businesses using Cargivo for custom box fabrication
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 rounded-full"
            onClick={() => setShowSignup(true)}
            data-ocid="cta.signup.button"
          >
            Signup Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 rounded-full"
            onClick={() => navigate("/login")}
            data-ocid="cta.login.button"
          >
            Login
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <LogoImage className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <a
              href="https://www.linkedin.com/company/cargivo/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
              aria-label="Cargivo on LinkedIn"
              data-ocid="footer.link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="img"
                aria-label="LinkedIn"
              >
                <title>LinkedIn</title>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
          {/* Bottom row - links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
            <a href="#how-it-works" className="hover:text-primary">
              How It Works
            </a>
            <button
              type="button"
              onClick={() => navigate("/privacy-policy")}
              className="hover:text-primary cursor-pointer"
              data-ocid="footer.link"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="hover:text-primary cursor-pointer"
              data-ocid="footer.link"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => navigate("/refund-policy")}
              className="hover:text-primary cursor-pointer"
              data-ocid="footer.link"
            >
              Refund Policy
            </button>
          </div>
        </div>
      </footer>

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
                <Label htmlFor="s-company">Company Name *</Label>
                <Input
                  id="s-company"
                  required
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, companyName: e.target.value }))
                  }
                  placeholder="ABC Exports Pvt Ltd"
                  data-ocid="signup.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="s-gst">GST Number *</Label>
                <Input
                  id="s-gst"
                  required
                  value={form.gstNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, gstNumber: e.target.value }))
                  }
                  placeholder="22AAAAA0000A1Z5"
                  data-ocid="signup.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="s-email">Email *</Label>
                <Input
                  id="s-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@company.com"
                  data-ocid="signup.input"
                />
              </div>
              <div>
                <Label htmlFor="s-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="s-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    data-ocid="signup.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              <div>
                <Label htmlFor="s-confirm">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="s-confirm"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    data-ocid="signup.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirm((p) => !p)}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Address
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="s-pincode">Pincode *</Label>
                  <Input
                    id="s-pincode"
                    required
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                    placeholder="400001"
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label htmlFor="s-state">State *</Label>
                  <Input
                    id="s-state"
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="Maharashtra"
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label htmlFor="s-city">City *</Label>
                  <Input
                    id="s-city"
                    required
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Mumbai"
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label htmlFor="s-landmark">Landmark *</Label>
                  <Input
                    id="s-landmark"
                    required
                    value={form.landmark}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, landmark: e.target.value }))
                    }
                    placeholder="Near Station"
                    data-ocid="signup.input"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="s-building">Building / Shop No *</Label>
                  <Input
                    id="s-building"
                    required
                    value={form.building}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, building: e.target.value }))
                    }
                    placeholder="Shop 12, Andheri Plaza"
                    data-ocid="signup.input"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s-phone">Phone Number *</Label>
                <Input
                  id="s-phone"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 9876543210"
                  data-ocid="signup.input"
                />
              </div>
              <div>
                <Label htmlFor="s-contact">Contact Name *</Label>
                <Input
                  id="s-contact"
                  required
                  value={form.contactName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                  placeholder="Rahul Sharma"
                  data-ocid="signup.input"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={isSubmitting}
              data-ocid="signup.submit_button"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  setShowSignup(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

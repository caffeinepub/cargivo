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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onLogin: () => void;
}

const boxTypes = [
  {
    name: "Wooden Crates",
    desc: "Sturdy plywood & hardwood packaging for fragile goods",
    icon: "🪵",
    color: "from-amber-500/40 to-orange-400/20",
  },
  {
    name: "Plastic Boxes",
    desc: "Lightweight HDPE & PP containers for chemical & food goods",
    icon: "📦",
    color: "from-sky-500/40 to-blue-400/20",
  },
  {
    name: "Custom Design",
    desc: "Fully bespoke fabrication from your drawings or specs",
    icon: "✏️",
    color: "from-purple-500/40 to-pink-400/20",
  },
];

const steps = [
  {
    num: "01",
    title: "Submit Requirements",
    desc: "Fill in box dimensions, material, quantity, and upload your drawing or photo. Takes under 2 minutes.",
    icon: FileText,
  },
  {
    num: "02",
    title: "We Collect Quotes",
    desc: "Our team contacts verified suppliers and negotiates the best prices on your behalf within 10–20 minutes.",
    icon: Users,
  },
  {
    num: "03",
    title: "You Approve & Order",
    desc: "Review the quote, approve and pay 50% advance. Supplier manufactures and delivers using Porter or Uber.",
    icon: Truck,
  },
];

const trust = [
  {
    icon: Zap,
    title: "10–20 Min Quotes",
    desc: "Fastest turnaround in the industry",
    bg: "bg-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    desc: "Every fabricator is background checked",
    bg: "bg-green-500/20",
    iconColor: "text-green-500",
  },
  {
    icon: FileText,
    title: "GST Invoicing",
    desc: "Automatic GST-compliant invoices",
    bg: "bg-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Clock,
    title: "Live Order Tracking",
    desc: "Track production status in real time",
    bg: "bg-purple-500/20",
    iconColor: "text-purple-500",
  },
];

const partners = [
  {
    emoji: "🚛",
    name: "Porter",
    desc: "Last-mile delivery partner",
    url: "https://porter.in",
    color: "from-orange-500/30 to-amber-400/15",
    badgeColor:
      "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
  },
  {
    emoji: "🚗",
    name: "Uber",
    desc: "On-demand transport",
    url: "https://uber.com",
    color: "from-slate-500/30 to-gray-400/15",
    badgeColor:
      "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/50",
  },
  {
    emoji: "🏪",
    name: "IndiaMART",
    desc: "Supplier marketplace",
    url: "https://indiamart.com",
    color: "from-green-500/30 to-emerald-400/15",
    badgeColor:
      "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  },
  {
    emoji: "📦",
    name: "TradeIndia",
    desc: "B2B trade directory",
    url: "https://tradeindia.com",
    color: "from-blue-500/30 to-cyan-400/15",
    badgeColor:
      "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  },
];

const statColors = [
  "text-orange-500",
  "text-green-500",
  "text-blue-500",
  "text-purple-500",
];

const emptyForm = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  phone: "",
  gst: "",
  address: "",
};

export function LandingPage({ onNavigate, onLogin }: LandingPageProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowRegisterModal(false);
    setForm(emptyForm);
    toast.success("Registration submitted! Our team will contact you shortly.");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Registration Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="register.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Your Free Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Logistics Pvt Ltd"
                  value={form.companyName}
                  onChange={handleFormChange}
                  required
                  data-ocid="register.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder="Rajesh Kumar"
                  value={form.contactName}
                  onChange={handleFormChange}
                  required
                  data-ocid="register.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleFormChange}
                required
                data-ocid="register.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleFormChange}
                required
                data-ocid="register.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleFormChange}
                  required
                  data-ocid="register.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  name="gst"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst}
                  onChange={handleFormChange}
                  required
                  data-ocid="register.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="123 Industrial Area, Mumbai, Maharashtra 400001"
                value={form.address}
                onChange={handleFormChange}
                required
                rows={3}
                data-ocid="register.textarea"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowRegisterModal(false)}
                data-ocid="register.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-orange"
                data-ocid="register.submit_button"
              >
                Register Free
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/image-1-2.png"
              alt="Cargivo"
              className="h-9 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#box-types"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Box Types
            </a>
            <a
              href="#why-cargivo"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Why Cargivo
            </a>
            <a
              href="#partners"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Partners
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => onNavigate("/dashboard")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate("/login")}
                  className="text-foreground"
                  data-ocid="landing.login_button"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="landing.register_button"
                >
                  Register Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-background to-blue-600/10" />
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Quotes in 10–20 minutes
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Custom Cargo Boxes.{" "}
              <span className="text-gradient-orange">Quotes in Minutes.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Submit your box requirements and receive competitive quotes from
              verified fabricators — wooden, plastic, or fully custom.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() =>
                  isAuthenticated ? onNavigate("/dashboard") : onLogin()
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 glow-orange"
                data-ocid="landing.request_quote_button"
              >
                Request a Quote
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-border text-foreground h-12 text-base px-8"
              >
                Learn How It Works
              </Button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border"
          >
            {[
              { val: "500+", label: "Quotes Delivered" },
              { val: "120+", label: "Verified Suppliers" },
              { val: "98%", label: "On-Time Delivery" },
              { val: "₹0", label: "Platform Fee" },
            ].map((stat, i) => (
              <div key={stat.label} className="bg-card px-6 py-5 text-center">
                <div className={`text-2xl font-bold ${statColors[i]}`}>
                  {stat.val}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              How{" "}
              <span className="relative inline-block">
                Cargivo Works
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps from requirement to delivered box.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-xl p-7 h-full hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-5xl font-bold text-primary/20 font-display leading-none">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Box types */}
      <section id="box-types" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="relative inline-block">
                What We Fabricate
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-pink-400" />
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Every type of cargo box, custom-built to your specifications.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boxTypes.map((bt, i) => (
              <motion.div
                key={bt.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${bt.color} p-6 hover:border-primary/40 transition-all cursor-pointer group`}
                onClick={() =>
                  isAuthenticated ? onNavigate("/dashboard") : onLogin()
                }
              >
                <div className="text-4xl mb-4">{bt.icon}</div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {bt.name}
                </h3>
                <p className="text-sm text-muted-foreground">{bt.desc}</p>
                <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section id="why-cargivo" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="relative inline-block">
                Why Choose Cargivo?
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
              </span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trust.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Ecosystem */}
      <section id="partners" className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="relative inline-block">
                Our Partners &amp; Ecosystem
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-500 via-green-500 to-blue-500" />
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We work with these trusted platforms to deliver your orders.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${partner.color} p-6 flex flex-col items-center text-center group hover:border-primary/40 transition-all`}
              >
                <div className="text-5xl mb-3">{partner.emoji}</div>
                <h3 className="font-bold text-lg mb-1">{partner.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {partner.desc}
                </p>
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${partner.badgeColor} hover:opacity-80 transition-opacity`}
                  data-ocid={`partners.link.${i + 1}` as never}
                >
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-card border border-border rounded-2xl px-12 py-12 max-w-xl">
              <Package className="w-12 h-12 text-primary mx-auto mb-5" />
              <h2 className="text-3xl font-bold mb-3">Ready to Get a Quote?</h2>
              <p className="text-muted-foreground mb-7">
                Join 500+ businesses that trust Cargivo for custom cargo box
                fabrication.
              </p>
              <Button
                size="lg"
                onClick={() =>
                  isAuthenticated ? onNavigate("/dashboard") : onLogin()
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 glow-orange"
                data-ocid="landing.cta.primary_button"
              >
                Get Started — It's Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src="/assets/uploads/image-1-2.png"
            alt="Cargivo"
            className="h-7 w-auto opacity-70"
          />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

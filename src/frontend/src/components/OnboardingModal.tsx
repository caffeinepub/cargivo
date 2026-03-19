import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OnboardingModalProps {
  open: boolean;
}

export function OnboardingModal({ open }: OnboardingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    gstNumber: "",
    email: "",
    password: "",
    pincode: "",
    state: "",
    city: "",
    landmark: "",
    building: "",
    shopNo: "",
    phone: "",
    contactName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.companyName ||
      !form.gstNumber ||
      !form.email ||
      !form.password ||
      !form.pincode ||
      !form.state ||
      !form.city ||
      !form.phone ||
      !form.contactName
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Registration successful! Welcome to Cargivo.");
    setSubmitted(true);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) return null;

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        data-ocid="onboarding.dialog"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Tell us about your business to start requesting quotes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ob-company">Company Name</Label>
            <Input
              id="ob-company"
              placeholder="Acme Industries Pvt. Ltd."
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              data-ocid="onboarding.input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ob-gst">GST Number</Label>
            <Input
              id="ob-gst"
              placeholder="22AAAAA0000A1Z5"
              value={form.gstNumber}
              onChange={(e) => update("gstNumber", e.target.value)}
              data-ocid="onboarding.gst_input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ob-email">Email</Label>
            <Input
              id="ob-email"
              type="email"
              placeholder="rajesh@acmeindustries.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              data-ocid="onboarding.email_input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ob-password">Password</Label>
            <Input
              id="ob-password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              data-ocid="onboarding.password_input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Business Address</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label
                  htmlFor="ob-pincode"
                  className="text-xs text-muted-foreground"
                >
                  Pincode*
                </Label>
                <Input
                  id="ob-pincode"
                  placeholder="400001"
                  type="number"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  data-ocid="onboarding.pincode_input"
                />
              </div>
              <div className="grid gap-1">
                <Label
                  htmlFor="ob-state"
                  className="text-xs text-muted-foreground"
                >
                  State*
                </Label>
                <Input
                  id="ob-state"
                  placeholder="Maharashtra"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  data-ocid="onboarding.state_input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label
                  htmlFor="ob-city"
                  className="text-xs text-muted-foreground"
                >
                  City*
                </Label>
                <Input
                  id="ob-city"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  data-ocid="onboarding.city_input"
                />
              </div>
              <div className="grid gap-1">
                <Label
                  htmlFor="ob-landmark"
                  className="text-xs text-muted-foreground"
                >
                  Landmark (optional)
                </Label>
                <Input
                  id="ob-landmark"
                  placeholder="Near Railway Station"
                  value={form.landmark}
                  onChange={(e) => update("landmark", e.target.value)}
                  data-ocid="onboarding.landmark_input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label
                  htmlFor="ob-building"
                  className="text-xs text-muted-foreground"
                >
                  Building (optional)
                </Label>
                <Input
                  id="ob-building"
                  placeholder="Sunrise Tower"
                  value={form.building}
                  onChange={(e) => update("building", e.target.value)}
                  data-ocid="onboarding.building_input"
                />
              </div>
              <div className="grid gap-1">
                <Label
                  htmlFor="ob-shopno"
                  className="text-xs text-muted-foreground"
                >
                  Shop No (optional)
                </Label>
                <Input
                  id="ob-shopno"
                  placeholder="12B"
                  value={form.shopNo}
                  onChange={(e) => update("shopNo", e.target.value)}
                  data-ocid="onboarding.shopno_input"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ob-phone">Phone Number</Label>
              <Input
                id="ob-phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                data-ocid="onboarding.phone_input"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ob-contact">Contact Name</Label>
              <Input
                id="ob-contact"
                placeholder="Rajesh Kumar"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                data-ocid="onboarding.contact_name_input"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="onboarding.submit_button"
          >
            Create Profile & Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

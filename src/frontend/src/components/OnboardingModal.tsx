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
import { Textarea } from "@/components/ui/textarea";
import { useRegisterCustomerProfile } from "@/hooks/useQueries";
import { Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OnboardingModalProps {
  open: boolean;
}

export function OnboardingModal({ open }: OnboardingModalProps) {
  const [form, setForm] = useState({
    companyName: "",
    gstNumber: "",
    address: "",
    phone: "",
    contactName: "",
  });

  const register = useRegisterCustomerProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.companyName ||
      !form.gstNumber ||
      !form.address ||
      !form.phone ||
      !form.contactName
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await register.mutateAsync(form);
      toast.success("Profile created successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create profile");
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
              data-ocid="onboarding.company_name_input"
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
            <Label htmlFor="ob-address">Business Address</Label>
            <Textarea
              id="ob-address"
              placeholder="123 Industrial Area, Phase 2, Mumbai - 400001"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              rows={2}
              data-ocid="onboarding.address_input"
            />
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
            disabled={register.isPending}
            data-ocid="onboarding.submit_button"
          >
            {register.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {register.isPending
              ? "Creating Profile..."
              : "Create Profile & Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

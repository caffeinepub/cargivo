import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useBlobStorage } from "@/hooks/useBlobStorage";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type CustomerProfile,
  type QuoteRequest,
  useApproveQuote,
  useGetMyProfile,
  useGetMyQuoteRequests,
  useGetQuotation,
  useRejectQuote,
  useSaveCallerUserProfile,
  useSubmitQuoteRequest,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ClipboardList,
  FileText,
  Loader2,
  LogOut,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  TrendingUp,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerDashboardProps {
  onNavigate: (path: string) => void;
  emailProfile?: CustomerProfile;
  onEmailLogout?: () => void;
}

interface FormState {
  boxType: string;
  material: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
  pincode: string;
  state: string;
  city: string;
  landmark: string;
  building: string;
  shopNo: string;
}

const emptyForm: FormState = {
  boxType: "",
  material: "",
  length: "",
  width: "",
  height: "",
  quantity: "",
  pincode: "",
  state: "",
  city: "",
  landmark: "",
  building: "",
  shopNo: "",
};

function QuoteDetailModal({
  request,
  onClose,
}: {
  request: QuoteRequest | null;
  onClose: () => void;
}) {
  const { data: quotation, isLoading } = useGetQuotation(request?.id ?? null);
  const approve = useApproveQuote();
  const reject = useRejectQuote();

  if (!request) return null;

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(request.id);
      toast.success("Quote approved! Advance payment details will follow.");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync(request.id);
      toast.success("Quote rejected.");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to reject");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">
            Quote for{" "}
            <span className="text-primary">REQ-{request.id.toString()}</span>
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div
            className="space-y-3 py-4"
            data-ocid="requests_table.loading_state"
          >
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : !quotation ? (
          <p className="text-muted-foreground py-4">
            No quotation data available.
          </p>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-xl p-5 space-y-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.04 255), oklch(0.25 0.05 255))",
                border: "1px solid oklch(0.30 0.05 255)",
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-semibold">
                  ₹{quotation.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  GST ({quotation.gstPercent}%)
                </span>
                <span className="font-semibold">
                  ₹
                  {(
                    (quotation.basePrice * quotation.gstPercent) /
                    100
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-semibold">
                  ₹{quotation.deliveryCharge.toLocaleString()}
                </span>
              </div>
              <div
                className="border-t pt-3 flex justify-between font-bold text-base"
                style={{ borderColor: "oklch(0.32 0.05 255)" }}
              >
                <span>Total</span>
                <span className="text-primary">
                  ₹{quotation.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            {quotation.notes && (
              <p className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3 italic">
                {quotation.notes}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Valid until:{" "}
              {new Date(
                Number(quotation.validUntil / BigInt(1_000_000)),
              ).toLocaleDateString()}
            </p>
            {request.status === "quote_sent" && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={approve.isPending}
                  data-ocid="requests_table.approve_button"
                >
                  {approve.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10"
                  disabled={reject.isPending}
                  data-ocid="requests_table.reject_button"
                >
                  {reject.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewRequestForm({
  prefillData,
  onFormChange,
  formState,
}: {
  prefillData?: FormState | null;
  onFormChange?: (form: FormState) => void;
  formState?: FormState;
}) {
  const [internalForm, setInternalForm] = useState<FormState>(
    prefillData ?? emptyForm,
  );
  const form = formState ?? internalForm;
  const setForm = onFormChange ? onFormChange : setInternalForm;

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const submit = useSubmitQuoteRequest();
  const { uploadFile } = useBlobStorage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.boxType ||
      !form.length ||
      !form.width ||
      !form.height ||
      !form.quantity ||
      !form.pincode ||
      !form.state ||
      !form.city
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.boxType === "Custom" && !form.material) {
      toast.error("Please specify the material for custom box");
      return;
    }
    try {
      let drawingFileId: string | undefined;
      if (file) {
        setUploadProgress(1);
        drawingFileId = await uploadFile(file, setUploadProgress);
        setUploadProgress(100);
      }
      const deliveryLocation = `${form.shopNo ? `Shop No ${form.shopNo}, ` : ""}${form.building ? `${form.building}, ` : ""}${form.landmark ? `${form.landmark}, ` : ""}${form.city}, ${form.state} - ${form.pincode}`;
      await submit.mutateAsync({
        boxType: form.boxType,
        length: Number.parseFloat(form.length),
        width: Number.parseFloat(form.width),
        height: Number.parseFloat(form.height),
        material: form.material,
        quantity: BigInt(Number.parseInt(form.quantity)),
        deliveryLocation,
        drawingFileId,
      });
      toast.success(
        "Quote request submitted! We'll get back to you within 10–20 minutes.",
      );
      setForm(emptyForm);
      setFile(null);
      setUploadProgress(0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request");
      setUploadProgress(0);
    }
  };

  const update = (field: keyof FormState, value: string) =>
    setForm({ ...form, [field]: value });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Box Type */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground/80">
          Box Type
        </Label>
        <Select
          value={form.boxType}
          onValueChange={(v) => update("boxType", v)}
        >
          <SelectTrigger
            className="border-border/60 focus:border-primary"
            data-ocid="quote_form.box_type_select"
          >
            <SelectValue placeholder="Select box type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Metal">🔩 Metal</SelectItem>
            <SelectItem value="Wooden">🪵 Wooden</SelectItem>
            <SelectItem value="Plastic">🧴 Plastic</SelectItem>
            <SelectItem value="Custom">✨ Custom Design</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Material - only for Custom */}
      {form.boxType === "Custom" && (
        <div className="grid gap-2">
          <Label className="text-sm font-semibold text-foreground/80">
            Material <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. Stainless Steel, Aluminum, PVC..."
            value={form.material}
            onChange={(e) => update("material", e.target.value)}
            className="border-border/60 focus:border-primary"
            data-ocid="quote_form.material_input"
          />
        </div>
      )}

      {/* Dimensions */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground/80">
          Dimensions (mm) — Length × Width × Height
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Length"
            type="number"
            value={form.length}
            onChange={(e) => update("length", e.target.value)}
            className="border-border/60 focus:border-primary"
            data-ocid="quote_form.length_input"
          />
          <Input
            placeholder="Width"
            type="number"
            value={form.width}
            onChange={(e) => update("width", e.target.value)}
            className="border-border/60 focus:border-primary"
            data-ocid="quote_form.width_input"
          />
          <Input
            placeholder="Height"
            type="number"
            value={form.height}
            onChange={(e) => update("height", e.target.value)}
            className="border-border/60 focus:border-primary"
            data-ocid="quote_form.height_input"
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground/80">
          Quantity
        </Label>
        <Input
          placeholder="e.g. 50"
          type="number"
          value={form.quantity}
          onChange={(e) => update("quantity", e.target.value)}
          className="border-border/60 focus:border-primary"
          data-ocid="quote_form.quantity_input"
        />
      </div>

      {/* Address */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground/80">
          Delivery Address
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Pincode*</Label>
            <Input
              placeholder="e.g. 400001"
              type="number"
              value={form.pincode}
              onChange={(e) => update("pincode", e.target.value)}
              className="border-border/60 focus:border-primary"
              data-ocid="quote_form.pincode_input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">State*</Label>
            <Input
              placeholder="e.g. Maharashtra"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className="border-border/60 focus:border-primary"
              data-ocid="quote_form.state_input"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">City*</Label>
            <Input
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="border-border/60 focus:border-primary"
              data-ocid="quote_form.city_input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Landmark (optional)
            </Label>
            <Input
              placeholder="e.g. Near Railway Station"
              value={form.landmark}
              onChange={(e) => update("landmark", e.target.value)}
              className="border-border/60 focus:border-primary"
              data-ocid="quote_form.landmark_input"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Building (optional)
            </Label>
            <Input
              placeholder="e.g. Sunrise Tower"
              value={form.building}
              onChange={(e) => update("building", e.target.value)}
              className="border-border/60 focus:border-primary"
              data-ocid="quote_form.building_input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Shop No (optional)
            </Label>
            <Input
              placeholder="e.g. 12B"
              value={form.shopNo}
              onChange={(e) => update("shopNo", e.target.value)}
              className="border-border/60 focus:border-primary"
              data-ocid="quote_form.shopno_input"
            />
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground/80">
          Drawing / Photo{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <label
          className="rounded-xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-all"
          style={{
            border: "2px dashed oklch(0.35 0.05 255)",
            background: "oklch(0.18 0.03 255)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "oklch(0.7 0.2 44 / 0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "oklch(0.35 0.05 255)";
          }}
          data-ocid="quote_form.upload_button"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.25 0.04 255)" }}
          >
            <Upload className="w-4 h-4 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {file ? file.name : "Click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG, PDF, DWG supported
            </p>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div
              className="w-full rounded-full h-1.5 mt-1"
              style={{ background: "oklch(0.25 0.04 255)" }}
            >
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf,.dwg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Button
        type="submit"
        className="w-full font-semibold text-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.2 44), oklch(0.65 0.22 38))",
          color: "white",
          boxShadow: "0 4px 20px oklch(0.7 0.2 44 / 0.35)",
        }}
        disabled={submit.isPending}
        data-ocid="quote_form.submit_button"
      >
        {submit.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {submit.isPending ? "Submitting..." : "🚀 Submit Request"}
      </Button>
    </form>
  );
}

function PastOrdersPanel({
  requests,
  isLoading,
  onReorder,
  onNavigate,
  onRefresh,
}: {
  requests: QuoteRequest[] | undefined;
  isLoading: boolean;
  onReorder: (form: FormState) => void;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "oklch(0.19 0.04 255)",
        border: "1px solid oklch(0.26 0.04 255)",
        boxShadow: "0 4px 24px oklch(0 0 0 / 0.2)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.05 255), oklch(0.20 0.04 255))",
          borderBottom: "1px solid oklch(0.26 0.04 255)",
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.7 0.2 44 / 0.15)" }}
            >
              <Package
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.7 0.2 44)" }}
              />
            </div>
            <h3 className="font-bold text-sm font-display">Past Orders</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 rounded-lg"
            style={{ color: "oklch(0.7 0.2 44)" }}
            onClick={onRefresh}
            title="Refresh orders"
            data-ocid="past_orders.refresh_button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Order list */}
      <ScrollArea className="flex-1" style={{ maxHeight: "520px" }}>
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3" data-ocid="past_orders.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : !requests || requests.length === 0 ? (
            <div
              className="py-10 flex flex-col items-center gap-3 text-center"
              data-ocid="past_orders.empty_state"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.7 0.2 44 / 0.1)" }}
              >
                <Package
                  className="w-6 h-6"
                  style={{ color: "oklch(0.7 0.2 44 / 0.5)" }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                No past orders yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Your submitted requests will appear here
              </p>
            </div>
          ) : (
            requests.map((req, idx) => (
              <div
                key={req.id.toString()}
                className="rounded-xl p-4 space-y-3 transition-all"
                style={{
                  background: "oklch(0.22 0.04 255)",
                  border: "1px solid oklch(0.28 0.04 255)",
                }}
                data-ocid={`past_orders.item.${idx + 1}`}
              >
                {/* Order number + size */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: "oklch(0.7 0.2 44 / 0.15)",
                        color: "oklch(0.78 0.18 44)",
                      }}
                    >
                      REQ-{req.id.toString()}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.65 0.03 255)" }}
                  >
                    {req.boxType} box &mdash;{" "}
                    <span className="font-mono">
                      {req.length}&times;{req.width}&times;{req.height} mm
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {req.quantity.toString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-7 font-semibold"
                    style={{
                      background: "oklch(0.7 0.2 44 / 0.15)",
                      color: "oklch(0.78 0.18 44)",
                      border: "1px solid oklch(0.7 0.2 44 / 0.3)",
                    }}
                    onClick={() =>
                      onReorder({
                        boxType: req.boxType,
                        length: String(req.length),
                        width: String(req.width),
                        height: String(req.height),
                        quantity: req.quantity.toString(),
                        pincode: "",
                        state: "",
                        city: "",
                        landmark: "",
                        building: "",
                        shopNo: "",
                        material: "",
                      })
                    }
                    data-ocid={`past_orders.reorder_button.${idx + 1}`}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reorder
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-7 border-border/50"
                    onClick={() => onNavigate(`/invoice/${req.id.toString()}`)}
                    data-ocid={`past_orders.invoice_button.${idx + 1}`}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Invoice
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ProfileTab({ profile }: { profile: CustomerProfile | null }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CustomerProfile>(
    profile ?? {
      companyName: "",
      gstNumber: "",
      email: "",
      address: "",
      phone: "",
      contactName: "",
    },
  );
  const save = useSaveCallerUserProfile();

  const handleSave = async () => {
    try {
      await save.mutateAsync(form);
      toast.success("Profile updated");
      setEditing(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    }
  };

  if (!profile) {
    return <p className="text-muted-foreground">Profile not found.</p>;
  }

  const profileFields: [keyof CustomerProfile, string, string][] = [
    ["companyName", "Company Name", "🏢"],
    ["gstNumber", "GST Number", "📋"],
    ["email", "Email", "📧"],
    ["phone", "Phone", "📞"],
    ["contactName", "Contact Name", "👤"],
    ["address", "Address", "📍"],
  ];

  return (
    <div className="max-w-xl space-y-6">
      {editing ? (
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "oklch(0.20 0.04 255)",
            border: "1px solid oklch(0.28 0.04 255)",
          }}
        >
          <h3 className="font-semibold text-base">Edit Profile</h3>
          {(
            [
              ["companyName", "Company Name"],
              ["gstNumber", "GST Number"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["contactName", "Contact Name"],
            ] as [keyof CustomerProfile, string][]
          ).map(([field, label]) => (
            <div key={field} className="grid gap-1.5">
              <Label className="text-sm text-foreground/70">{label}</Label>
              <Input
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
                className="border-border/60 focus:border-primary"
              />
            </div>
          ))}
          <div className="grid gap-1.5">
            <Label className="text-sm text-foreground/70">Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              rows={2}
              className="border-border/60 focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              className="font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.7 0.2 44), oklch(0.65 0.22 38))",
                color: "white",
              }}
              disabled={save.isPending}
              data-ocid="customer_dashboard.profile_tab"
            >
              {save.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="border-border/60"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid oklch(0.28 0.04 255)",
              boxShadow: "0 4px 24px oklch(0 0 0 / 0.25)",
            }}
          >
            {/* Profile header */}
            <div
              className="px-6 py-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.05 255), oklch(0.20 0.04 255))",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.7 0.2 44), oklch(0.65 0.22 38))",
                    color: "white",
                  }}
                >
                  {profile.companyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg font-display">
                    {profile.companyName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div
              className="divide-y"
              style={{
                background: "oklch(0.20 0.04 255)",
                borderColor: "oklch(0.28 0.04 255)",
              }}
            >
              {profileFields.map(([field, label, icon]) => (
                <div
                  key={field}
                  className="flex items-start gap-4 px-6 py-4"
                  style={{ borderColor: "oklch(0.26 0.04 255)" }}
                >
                  <span className="text-base mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-medium break-all">
                      {profile[field] || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="border-primary/40 text-primary hover:bg-primary/10"
          >
            ✏️ Edit Profile
          </Button>
        </>
      )}
    </div>
  );
}

export function CustomerDashboard({
  onNavigate,
  emailProfile,
  onEmailLogout,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "new" | "profile">(
    "requests",
  );
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(
    null,
  );
  const [quoteForm, setQuoteForm] = useState<FormState>(emptyForm);
  const { data: requests, isLoading, refetch } = useGetMyQuoteRequests();
  const { data: fetchedProfile } = useGetMyProfile();
  const profile = emailProfile ?? fetchedProfile;
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    if (onEmailLogout) {
      onEmailLogout();
      return;
    }
    await clear();
    queryClient.clear();
    onNavigate("/");
  };

  const handleReorder = (form: FormState) => {
    setQuoteForm(form);
    setActiveTab("new");
    toast.success("Form pre-filled with previous order details.");
  };

  // Compute stats
  const totalRequests = requests?.length ?? 0;
  const pendingQuotes =
    requests?.filter((r) =>
      ["submitted", "under_review", "quote_sent"].includes(r.status),
    ).length ?? 0;
  const completedOrders =
    requests?.filter((r) => ["completed", "delivered"].includes(r.status))
      .length ?? 0;

  const navItems = [
    {
      id: "requests" as const,
      label: "My Requests",
      icon: ClipboardList,
      ocid: "customer_dashboard.my_requests_tab",
    },
    {
      id: "new" as const,
      label: "New Request",
      icon: Plus,
      ocid: "customer_dashboard.new_request_tab",
    },
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      ocid: "customer_dashboard.profile_tab",
    },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.15 0.04 255)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 hidden md:flex flex-col"
        style={{
          background: "oklch(0.13 0.04 255)",
          borderRight: "1px solid oklch(0.22 0.04 255)",
        }}
      >
        {/* Logo */}
        <div
          className="p-5"
          style={{ borderBottom: "1px solid oklch(0.22 0.04 255)" }}
        >
          <img
            src="/assets/uploads/image-4-1.png"
            alt="Cargivo"
            className="h-10 w-auto"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.7 0.2 44 / 0.5))" }}
          />
        </div>

        {/* User info */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid oklch(0.22 0.04 255)" }}
        >
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "oklch(0.18 0.04 255)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.7 0.2 44), oklch(0.65 0.22 38))",
                color: "white",
              }}
            >
              {(profile?.companyName || "C").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-semibold truncate">
                {profile?.companyName || "Customer"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                activeTab === item.id
                  ? {
                      background:
                        "linear-gradient(135deg, oklch(0.7 0.2 44 / 0.15), oklch(0.65 0.22 38 / 0.1))",
                      color: "oklch(0.7 0.2 44)",
                      borderLeft: "3px solid oklch(0.7 0.2 44)",
                    }
                  : {
                      color: "oklch(0.62 0.03 255)",
                    }
              }
              data-ocid={item.ocid}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div
          className="p-3"
          style={{ borderTop: "1px solid oklch(0.22 0.04 255)" }}
        >
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: "oklch(0.62 0.03 255)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.20 0.04 255)";
              (e.currentTarget as HTMLElement).style.color =
                "oklch(0.85 0.01 255)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color =
                "oklch(0.62 0.03 255)";
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 h-14 flex items-center justify-between"
        style={{
          background: "oklch(0.13 0.04 255)",
          borderBottom: "1px solid oklch(0.22 0.04 255)",
        }}
      >
        <img
          src="/assets/uploads/image-4-1.png"
          alt="Cargivo"
          className="h-7 w-auto"
        />
        <button
          type="button"
          onClick={handleLogout}
          className="text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        {/* Mobile nav */}
        <div
          className="md:hidden flex"
          style={{ borderBottom: "1px solid oklch(0.22 0.04 255)" }}
        >
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors"
              style={{
                color:
                  activeTab === item.id
                    ? "oklch(0.7 0.2 44)"
                    : "oklch(0.62 0.03 255)",
                borderBottom:
                  activeTab === item.id
                    ? "2px solid oklch(0.7 0.2 44)"
                    : "2px solid transparent",
              }}
              data-ocid={item.ocid}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-5 md:p-8 space-y-6">
          {/* Welcome banner */}
          <div
            className="rounded-2xl px-6 py-5 flex items-center justify-between overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.20 38), oklch(0.48 0.18 44), oklch(0.42 0.16 30))",
              boxShadow: "0 8px 32px oklch(0.55 0.20 38 / 0.35)",
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute right-0 top-0 w-40 h-40 rounded-full opacity-20"
              style={{
                background: "oklch(0.9 0.1 60)",
                transform: "translate(30%, -40%)",
              }}
            />
            <div
              className="absolute right-16 bottom-0 w-24 h-24 rounded-full opacity-10"
              style={{
                background: "oklch(0.95 0.05 90)",
                transform: "translateY(40%)",
              }}
            />
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/70 mb-1">
                Welcome back 👋
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display">
                {profile?.companyName || "Customer"}
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Manage your quote requests and orders
              </p>
            </div>
            <div className="relative z-10 hidden sm:block">
              <Button
                onClick={() => setActiveTab("new")}
                className="font-semibold text-sm"
                style={{
                  background: "oklch(1 0 0 / 0.15)",
                  color: "white",
                  border: "1px solid oklch(1 0 0 / 0.3)",
                  backdropFilter: "blur(4px)",
                }}
                data-ocid="customer_dashboard.new_request_tab"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New Request
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Requests",
                value: totalRequests,
                icon: ClipboardList,
                color: "oklch(0.6 0.18 220)",
                bg: "oklch(0.6 0.18 220 / 0.12)",
              },
              {
                label: "Pending Quotes",
                value: pendingQuotes,
                icon: TrendingUp,
                color: "oklch(0.7 0.2 44)",
                bg: "oklch(0.7 0.2 44 / 0.12)",
              },
              {
                label: "Completed Orders",
                value: completedOrders,
                icon: PackageCheck,
                color: "oklch(0.65 0.18 145)",
                bg: "oklch(0.65 0.18 145 / 0.12)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{
                  background: "oklch(0.19 0.04 255)",
                  border: "1px solid oklch(0.26 0.04 255)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.bg }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "requests" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-bold font-display">
                  My Quote Requests
                </h1>
                <Button
                  size="sm"
                  className="font-semibold text-xs"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.7 0.2 44), oklch(0.65 0.22 38))",
                    color: "white",
                  }}
                  onClick={() => setActiveTab("new")}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Request
                </Button>
              </div>

              {isLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="requests_table.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : !requests || requests.length === 0 ? (
                <div
                  className="rounded-2xl p-12 text-center"
                  style={{
                    background: "oklch(0.19 0.04 255)",
                    border: "1px solid oklch(0.26 0.04 255)",
                  }}
                  data-ocid="requests_table.empty_state"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "oklch(0.7 0.2 44 / 0.12)" }}
                  >
                    <Package
                      className="w-8 h-8"
                      style={{ color: "oklch(0.7 0.2 44)" }}
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-2 font-display">
                    No requests yet
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Submit your first quote request to get started.
                  </p>
                  <Button
                    onClick={() => setActiveTab("new")}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.7 0.2 44), oklch(0.65 0.22 38))",
                      color: "white",
                      boxShadow: "0 4px 16px oklch(0.7 0.2 44 / 0.3)",
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Request
                  </Button>
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "oklch(0.19 0.04 255)",
                    border: "1px solid oklch(0.26 0.04 255)",
                  }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "oklch(0.26 0.04 255)",
                          background: "oklch(0.17 0.04 255)",
                        }}
                      >
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Request ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Box Type
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                          Dimensions
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                          Qty
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, idx) => (
                        <TableRow
                          key={req.id.toString()}
                          className="transition-colors"
                          style={{ borderColor: "oklch(0.24 0.04 255)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "oklch(0.21 0.04 255)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "";
                          }}
                          data-ocid={`requests_table.item.${idx + 1}`}
                        >
                          <TableCell>
                            <span
                              className="font-mono text-xs px-2 py-1 rounded-md"
                              style={{
                                background: "oklch(0.24 0.04 255)",
                                color: "oklch(0.7 0.2 44)",
                              }}
                            >
                              REQ-{req.id.toString()}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {req.boxType}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                            {req.length}×{req.width}×{req.height}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {req.quantity.toString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={req.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                            {new Date(
                              Number(req.createdAt / BigInt(1_000_000)),
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {req.status === "quote_sent" && (
                                <Button
                                  size="sm"
                                  className="text-xs h-7 px-3 font-semibold"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, oklch(0.7 0.2 44 / 0.2), oklch(0.65 0.22 38 / 0.15))",
                                    color: "oklch(0.7 0.2 44)",
                                    border: "1px solid oklch(0.7 0.2 44 / 0.3)",
                                  }}
                                  onClick={() => setSelectedRequest(req)}
                                  data-ocid={`requests_table.view_quote_button.${idx + 1}`}
                                >
                                  View Quote
                                </Button>
                              )}
                              {[
                                "approved",
                                "advance_paid",
                                "in_production",
                                "delivered",
                                "completed",
                              ].includes(req.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 px-3 border-border/60"
                                  onClick={() =>
                                    onNavigate(`/invoice/${req.id.toString()}`)
                                  }
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Invoice
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {activeTab === "new" && (
            <div>
              <div className="mb-6">
                <h1 className="text-xl font-bold font-display mb-1">
                  New Quote Request
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fill in your box requirements and we'll send you a competitive
                  quote within{" "}
                  <span className="text-primary font-medium">
                    10–20 minutes
                  </span>
                  .
                </p>
              </div>

              {/* Two-column layout: form + past orders */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Quote Form */}
                <div
                  className="lg:col-span-3 rounded-2xl p-6"
                  style={{
                    background: "oklch(0.20 0.04 255)",
                    border: "1px solid oklch(0.28 0.04 255)",
                    boxShadow: "0 4px 32px oklch(0 0 0 / 0.3)",
                  }}
                >
                  <NewRequestForm
                    formState={quoteForm}
                    onFormChange={setQuoteForm}
                  />
                </div>

                {/* Right: Past Orders */}
                <div className="lg:col-span-2">
                  <PastOrdersPanel
                    requests={requests}
                    isLoading={isLoading}
                    onReorder={handleReorder}
                    onNavigate={onNavigate}
                    onRefresh={refetch}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h1 className="text-xl font-bold font-display mb-6">
                My Profile
              </h1>
              <ProfileTab profile={profile ?? null} />
            </div>
          )}
        </div>
      </main>

      {selectedRequest && (
        <QuoteDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

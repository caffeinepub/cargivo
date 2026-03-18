import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
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
  type Quotation,
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
  FileText,
  List,
  Loader2,
  LogOut,
  Package,
  Plus,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerDashboardProps {
  onNavigate: (path: string) => void;
}

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
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Quote for REQ-{request.id.toString()}</DialogTitle>
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
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-medium">
                  ₹{quotation.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  GST ({quotation.gstPercent}%)
                </span>
                <span className="font-medium">
                  ₹
                  {(
                    (quotation.basePrice * quotation.gstPercent) /
                    100
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-medium">
                  ₹{quotation.deliveryCharge.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ₹{quotation.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            {quotation.notes && (
              <p className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
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
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
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

function NewRequestForm() {
  const [form, setForm] = useState({
    boxType: "",
    length: "",
    width: "",
    height: "",
    material: "",
    quantity: "",
    deliveryLocation: "",
  });
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
      !form.material ||
      !form.quantity ||
      !form.deliveryLocation
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      let drawingFileId: string | undefined;
      if (file) {
        setUploadProgress(1);
        drawingFileId = await uploadFile(file, setUploadProgress);
        setUploadProgress(100);
      }
      await submit.mutateAsync({
        boxType: form.boxType,
        length: Number.parseFloat(form.length),
        width: Number.parseFloat(form.width),
        height: Number.parseFloat(form.height),
        material: form.material,
        quantity: BigInt(Number.parseInt(form.quantity)),
        deliveryLocation: form.deliveryLocation,
        drawingFileId,
      });
      toast.success(
        "Quote request submitted! We'll get back to you within 10–20 minutes.",
      );
      setForm({
        boxType: "",
        length: "",
        width: "",
        height: "",
        material: "",
        quantity: "",
        deliveryLocation: "",
      });
      setFile(null);
      setUploadProgress(0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request");
      setUploadProgress(0);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid gap-1.5">
        <Label>Box Type</Label>
        <Select
          value={form.boxType}
          onValueChange={(v) => update("boxType", v)}
        >
          <SelectTrigger data-ocid="quote_form.box_type_select">
            <SelectValue placeholder="Select box type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Wooden">Wooden</SelectItem>
            <SelectItem value="Plastic">Plastic</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label>Dimensions (mm)</Label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Input
              placeholder="Length"
              type="number"
              value={form.length}
              onChange={(e) => update("length", e.target.value)}
              data-ocid="quote_form.length_input"
            />
          </div>
          <div>
            <Input
              placeholder="Width"
              type="number"
              value={form.width}
              onChange={(e) => update("width", e.target.value)}
              data-ocid="quote_form.width_input"
            />
          </div>
          <div>
            <Input
              placeholder="Height"
              type="number"
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
              data-ocid="quote_form.height_input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>Material</Label>
          <Input
            placeholder="e.g. MS Steel 2mm, Plywood 18mm"
            value={form.material}
            onChange={(e) => update("material", e.target.value)}
            data-ocid="quote_form.material_input"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Quantity</Label>
          <Input
            placeholder="e.g. 50"
            type="number"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            data-ocid="quote_form.quantity_input"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Delivery Location</Label>
        <Input
          placeholder="e.g. Mumbai, Maharashtra"
          value={form.deliveryLocation}
          onChange={(e) => update("deliveryLocation", e.target.value)}
          data-ocid="quote_form.delivery_location_input"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Drawing / Photo (optional)</Label>
        <label
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
          data-ocid="quote_form.upload_button"
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {file ? file.name : "Click to upload drawing or photo"}
          </span>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
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
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        disabled={submit.isPending}
        data-ocid="quote_form.submit_button"
      >
        {submit.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {submit.isPending ? "Submitting..." : "Submit Quote Request"}
      </Button>
    </form>
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

  return (
    <div className="max-w-xl space-y-6">
      {editing ? (
        <div className="space-y-4">
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
              <Label>{label}</Label>
              <Input
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="grid gap-1.5">
            <Label>Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              rows={2}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={save.isPending}
              data-ocid="customer_dashboard.profile_tab"
            >
              {save.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            {[
              ["Company", profile.companyName],
              ["GST Number", profile.gstNumber],
              ["Email", profile.email],
              ["Phone", profile.phone],
              ["Contact", profile.contactName],
              ["Address", profile.address],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4">
                <span className="text-sm text-muted-foreground w-28 shrink-0">
                  {label}
                </span>
                <span className="text-sm font-medium break-all">{value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        </>
      )}
    </div>
  );
}

export function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "new" | "profile">(
    "requests",
  );
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(
    null,
  );
  const { data: requests, isLoading } = useGetMyQuoteRequests();
  const { data: profile } = useGetMyProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate("/");
  };

  const navItems = [
    {
      id: "requests" as const,
      label: "My Requests",
      icon: List,
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col hidden md:flex">
        <div className="p-5 border-b border-border">
          <img
            src="/assets/generated/cargivo-logo-transparent.dim_200x60.png"
            alt="Cargivo"
            className="h-8 w-auto"
          />
        </div>
        <div className="p-4 border-b border-border">
          <div className="text-xs text-muted-foreground mb-0.5">
            Logged in as
          </div>
          <div className="font-medium text-sm truncate">
            {profile?.companyName || "Customer"}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              data-ocid={item.ocid}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-border px-4 h-14 flex items-center justify-between">
        <img
          src="/assets/generated/cargivo-logo-transparent.dim_200x60.png"
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
        <div className="md:hidden flex border-b border-border">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              data-ocid={item.ocid}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "requests" && (
            <div>
              <h1 className="text-2xl font-bold mb-6">My Quote Requests</h1>
              {isLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="requests_table.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !requests || requests.length === 0 ? (
                <div
                  className="bg-card border border-border rounded-xl p-12 text-center"
                  data-ocid="requests_table.empty_state"
                >
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No requests yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Submit your first quote request to get started.
                  </p>
                  <Button
                    onClick={() => setActiveTab("new")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Request
                  </Button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Request ID</TableHead>
                        <TableHead>Box Type</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, idx) => (
                        <TableRow
                          key={req.id.toString()}
                          className="border-border"
                          data-ocid={`requests_table.item.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            REQ-{req.id.toString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {req.boxType}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {req.length}×{req.width}×{req.height}
                          </TableCell>
                          <TableCell>{req.quantity.toString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={req.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(
                              Number(req.createdAt / BigInt(1_000_000)),
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {req.status === "quote_sent" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-primary/50 text-primary hover:bg-primary/10"
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
                                  className="text-xs"
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
              <h1 className="text-2xl font-bold mb-2">New Quote Request</h1>
              <p className="text-muted-foreground mb-8">
                Fill in your box requirements and we'll send you a competitive
                quote within 10–20 minutes.
              </p>
              <NewRequestForm />
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h1 className="text-2xl font-bold mb-8">My Profile</h1>
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

import type { NavigateFn } from "@/App";
import type { CustomerProfile, QuotationArgs, QuoteRequest } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: NavigateFn;
  adminLogout: () => void;
  adminEmail: string;
  adminPassword: string;
}

function formatReqId(id: bigint, createdAt: bigint): string {
  const ms = Number(createdAt / 1_000_000n);
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(Number(id)).padStart(4, "0");
  return `REQ/${year}/${month}/${seq}`;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    quote_sent: "bg-blue-100 text-blue-800",
    customer_accepted: "bg-emerald-100 text-emerald-800",
    customer_declined: "bg-red-100 text-red-800",
    advance_payment_pending: "bg-orange-100 text-orange-800",
    order_preparing: "bg-purple-100 text-purple-800",
    in_transit: "bg-indigo-100 text-indigo-800",
    delivered: "bg-teal-100 text-teal-800",
    completed: "bg-green-100 text-green-800",
    confirmed: "bg-green-100 text-green-800",
    manufacturing: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function AdminDashboard({
  navigate,
  adminLogout,
  adminEmail,
  adminPassword,
}: Props) {
  const { actor } = useActor();
  const [activeTab, setActiveTab] = useState<
    "requests" | "customers" | "orders" | "settings"
  >("requests");
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [customerError, setCustomerError] = useState("");

  // Send quote dialog
  const [quotingRequest, setQuotingRequest] = useState<QuoteRequest | null>(
    null,
  );
  const [basePrice, setBasePrice] = useState("");
  const [gstPercent, setGstPercent] = useState("18");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  // In-transit dialog
  const [transitRequest, setTransitRequest] = useState<QuoteRequest | null>(
    null,
  );
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [isMarkingTransit, setIsMarkingTransit] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!actor) return;
    setLoadingRequests(true);
    setRequestError("");
    try {
      const result = await actor.getAllQuoteRequestsAdmin(
        adminEmail,
        adminPassword,
      );
      setRequests(result);
    } catch {
      setRequestError(
        "Failed to load requests. Please logout and login again.",
      );
    } finally {
      setLoadingRequests(false);
    }
  }, [actor, adminEmail, adminPassword]);

  const loadCustomers = useCallback(async () => {
    if (!actor) return;
    setLoadingCustomers(true);
    setCustomerError("");
    try {
      const result = await actor.getAllEmailCustomersAdmin(
        adminEmail,
        adminPassword,
      );
      setCustomers(result);
    } catch {
      setCustomerError("Failed to load customers.");
    } finally {
      setLoadingCustomers(false);
    }
  }, [actor, adminEmail, adminPassword]);

  useEffect(() => {
    if (actor) loadRequests();
  }, [actor, loadRequests]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "customers") loadCustomers();
    if (tab === "requests" || tab === "orders") loadRequests();
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingRequest || !actor) return;
    setIsSendingQuote(true);
    try {
      const validUntilMs = validUntil
        ? new Date(validUntil).getTime()
        : Date.now() + 7 * 24 * 60 * 60 * 1000;
      const args: QuotationArgs = {
        requestId: quotingRequest.id,
        basePrice: Number.parseFloat(basePrice) || 0,
        gstPercent: Number.parseFloat(gstPercent) || 18,
        deliveryCharge: Number.parseFloat(deliveryCharge) || 0,
        notes: quoteNotes || undefined,
        validUntil: BigInt(validUntilMs),
      };
      await actor.sendQuotationAdmin(adminEmail, adminPassword, args);
      toast.success("Quotation sent!");
      setQuotingRequest(null);
      loadRequests();
    } catch {
      toast.error("Failed to send quotation");
    } finally {
      setIsSendingQuote(false);
    }
  };

  const handleMarkAdvancePaid = async (requestId: bigint) => {
    if (!actor) return;
    try {
      await actor.markAdvancePaidAdmin(adminEmail, adminPassword, requestId);
      // Move to order_preparing status
      await actor.updateRequestStatusAdmin(
        adminEmail,
        adminPassword,
        requestId,
        "order_preparing",
      );
      toast.success("Advance payment confirmed. Order moved to preparing!");
      loadRequests();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleMarkInTransit = async () => {
    if (!transitRequest || !actor) return;
    if (!deliveryDetails.trim()) {
      toast.error("Please enter delivery details.");
      return;
    }
    setIsMarkingTransit(true);
    try {
      // Store delivery details in adminNotes via order update
      await actor.updateOrderStatusAdmin(adminEmail, adminPassword, {
        requestId: transitRequest.id,
        deliveryTrackingInfo: deliveryDetails,
        manufacturingNotes: undefined,
      });
      await actor.updateRequestStatusAdmin(
        adminEmail,
        adminPassword,
        transitRequest.id,
        "in_transit",
      );
      toast.success("Order marked as in transit!");
      setTransitRequest(null);
      setDeliveryDetails("");
      loadRequests();
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsMarkingTransit(false);
    }
  };

  const handleConfirmDelivered = async (requestId: bigint) => {
    if (!actor) return;
    try {
      await actor.updateRequestStatusAdmin(
        adminEmail,
        adminPassword,
        requestId,
        "delivered",
      );
      toast.success("Order marked as delivered!");
      loadRequests();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleConfirmFinalPayment = async (requestId: bigint) => {
    if (!actor) return;
    try {
      await actor.updateRequestStatusAdmin(
        adminEmail,
        adminPassword,
        requestId,
        "completed",
      );
      toast.success("Final payment confirmed. Order completed!");
      loadRequests();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeleteAll = async () => {
    if (!actor) return;
    try {
      await actor.clearAllDataAdmin(adminEmail, adminPassword);
      toast.success("All data deleted. Admin credentials preserved.");
      setRequests([]);
      setCustomers([]);
    } catch {
      toast.error("Failed to delete data");
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  const tabs = [
    { id: "requests" as const, label: "Quote Requests", icon: FileText },
    { id: "customers" as const, label: "Customers", icon: Users },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  // Render action buttons per status for Orders tab
  function renderOrderActions(req: QuoteRequest, i: number) {
    const s = req.status;
    if (s === "pending" || s === "quote_sent") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            onClick={() => {
              setQuotingRequest(req);
              setBasePrice("");
              setGstPercent("18");
              setDeliveryCharge("");
              setQuoteNotes("");
              setValidUntil("");
            }}
            data-ocid={`admin.orders.send_quote.button.${i + 1}`}
          >
            Send Quote
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => handleMarkAdvancePaid(req.id)}
            data-ocid={`admin.orders.advance_paid.button.${i + 1}`}
          >
            Confirm Advance Payment
          </Button>
        </div>
      );
    }
    if (s === "order_preparing") {
      return (
        <Button
          type="button"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1"
          onClick={() => {
            setTransitRequest(req);
            setDeliveryDetails("");
          }}
          data-ocid={`admin.orders.in_transit.button.${i + 1}`}
        >
          <Truck className="h-3.5 w-3.5" /> Mark In Transit
        </Button>
      );
    }
    if (s === "in_transit") {
      return (
        <Button
          type="button"
          size="sm"
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          onClick={() => handleConfirmDelivered(req.id)}
          data-ocid={`admin.orders.delivered.button.${i + 1}`}
        >
          Confirm Delivered
        </Button>
      );
    }
    if (s === "delivered") {
      return (
        <Button
          type="button"
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white text-xs"
          onClick={() => handleConfirmFinalPayment(req.id)}
          data-ocid={`admin.orders.final_payment.button.${i + 1}`}
        >
          Confirm Final Payment
        </Button>
      );
    }
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5" /> Order Complete
        </span>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/assets/uploads/cargivo_logo_with_motion_trails-019d2b28-4cc6-7378-aae8-b18db2273b4e-1.png"
              alt="Cargivo"
              className="h-12 w-auto"
            />
            <span className="text-sm font-semibold text-primary bg-accent px-3 py-1 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {adminEmail}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1"
              data-ocid="admin.logout.button"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`admin.${id}.tab`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Quote Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Quote Requests</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadRequests}
                className="gap-1"
                data-ocid="admin.requests.refresh.button"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingRequests ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </Button>
            </div>

            {loadingRequests ? (
              <div
                className="text-center py-12"
                data-ocid="admin.requests.loading_state"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : requestError ? (
              <div
                className="text-center py-12"
                data-ocid="admin.requests.error_state"
              >
                <p className="text-destructive mb-4">{requestError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    adminLogout();
                    navigate("/admin-login");
                  }}
                  data-ocid="admin.requests.logout.button"
                >
                  Logout & Login Again
                </Button>
              </div>
            ) : requests.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.requests.empty_state"
              >
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No quote requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req, i) => (
                  <div
                    key={req.id.toString()}
                    className="border border-border rounded-xl p-4"
                    data-ocid={`admin.requests.item.${i + 1}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {formatReqId(req.id, req.createdAt)}
                          </span>
                          {statusBadge(req.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {req.boxType} · {req.length}×{req.width}×{req.height}{" "}
                          cm · Qty: {req.quantity.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📍 {req.deliveryLocation}
                        </p>
                        {req.material && (
                          <p className="text-xs text-muted-foreground">
                            Material: {req.material}
                          </p>
                        )}
                        {req.status === "customer_declined" &&
                          req.adminNotes && (
                            <p className="text-xs text-red-600">
                              Decline reason: {req.adminNotes}
                            </p>
                          )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                        onClick={() => {
                          setQuotingRequest(req);
                          setBasePrice("");
                          setGstPercent("18");
                          setDeliveryCharge("");
                          setQuoteNotes("");
                          setValidUntil("");
                        }}
                        data-ocid={`admin.requests.send_quote.button.${i + 1}`}
                      >
                        Send Quote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Customers</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadCustomers}
                className="gap-1"
                data-ocid="admin.customers.refresh.button"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingCustomers ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </Button>
            </div>
            {loadingCustomers ? (
              <div
                className="text-center py-12"
                data-ocid="admin.customers.loading_state"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : customerError ? (
              <div
                className="text-center py-12 text-destructive"
                data-ocid="admin.customers.error_state"
              >
                {customerError}
              </div>
            ) : customers.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.customers.empty_state"
              >
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No customers registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map((c, i) => (
                  <div
                    key={c.email}
                    className="border border-border rounded-xl p-4"
                    data-ocid={`admin.customers.item.${i + 1}`}
                  >
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">{c.companyName}</span>
                      </div>
                      <div className="text-muted-foreground">{c.email}</div>
                      <div className="text-muted-foreground">
                        {c.contactName} · {c.phone}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        GST: {c.gstNumber}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {c.address}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Orders</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadRequests}
                className="gap-1"
                data-ocid="admin.orders.refresh.button"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingRequests ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </Button>
            </div>
            {loadingRequests ? (
              <div
                className="text-center py-12"
                data-ocid="admin.orders.loading_state"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.orders.empty_state"
              >
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req, i) => (
                  <div
                    key={req.id.toString()}
                    className="border border-border rounded-xl p-4"
                    data-ocid={`admin.orders.item.${i + 1}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {formatReqId(req.id, req.createdAt)}
                          </span>
                          {statusBadge(req.status)}
                          {req.status === "order_preparing" && (
                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              Advance Confirmed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {req.boxType} · {req.length}×{req.width}×{req.height}{" "}
                          cm · Qty: {req.quantity.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📍 {req.deliveryLocation}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {renderOrderActions(req, i)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl border border-border shadow-xs p-6 max-w-lg">
            <h2 className="text-xl font-display font-bold mb-6">Settings</h2>
            <div className="border border-destructive/30 rounded-xl p-5 bg-destructive/5">
              <h3 className="font-semibold text-destructive mb-2">
                Delete All Data
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all customer accounts and quote
                requests. Admin credentials will be preserved.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-ocid="admin.settings.delete_all.button"
                  >
                    Delete All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="admin.settings.delete_all.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all customer accounts and
                      quote requests. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="admin.settings.delete_all.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive text-destructive-foreground"
                      data-ocid="admin.settings.delete_all.confirm_button"
                    >
                      Yes, Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      {/* Send Quote Dialog */}
      <Dialog
        open={!!quotingRequest}
        onOpenChange={(open) => !open && setQuotingRequest(null)}
      >
        <DialogContent className="max-w-md" data-ocid="admin.send_quote.modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              Send Quotation &mdash;{" "}
              {quotingRequest
                ? formatReqId(quotingRequest.id, quotingRequest.createdAt)
                : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendQuote} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="q-base">Base Price (₹) *</Label>
                <Input
                  id="q-base"
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="5000"
                  data-ocid="admin.send_quote.base_price.input"
                />
              </div>
              <div>
                <Label htmlFor="q-gst">GST %</Label>
                <Input
                  id="q-gst"
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(e.target.value)}
                  placeholder="18"
                  data-ocid="admin.send_quote.gst.input"
                />
              </div>
              <div>
                <Label htmlFor="q-delivery">Delivery Charge (₹)</Label>
                <Input
                  id="q-delivery"
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  placeholder="500"
                  data-ocid="admin.send_quote.delivery.input"
                />
              </div>
              <div>
                <Label htmlFor="q-valid">Valid Until</Label>
                <Input
                  id="q-valid"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  data-ocid="admin.send_quote.valid_until.input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="q-notes">Notes</Label>
              <Textarea
                id="q-notes"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="Optional notes to customer"
                rows={3}
                data-ocid="admin.send_quote.notes.textarea"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuotingRequest(null)}
                data-ocid="admin.send_quote.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
                disabled={isSendingQuote}
                data-ocid="admin.send_quote.submit_button"
              >
                {isSendingQuote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Quotation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* In-Transit Dialog */}
      <Dialog
        open={!!transitRequest}
        onOpenChange={(open) => !open && setTransitRequest(null)}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.transit.modal">
          <DialogHeader>
            <DialogTitle className="font-display">Mark In Transit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter delivery details (courier name, tracking number, etc.)
            </p>
            <div>
              <Label htmlFor="delivery-details">Delivery Details *</Label>
              <Textarea
                id="delivery-details"
                value={deliveryDetails}
                onChange={(e) => setDeliveryDetails(e.target.value)}
                placeholder="e.g. Delhivery AWB123456, estimated 3-5 days"
                rows={3}
                data-ocid="admin.transit.details.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransitRequest(null)}
              data-ocid="admin.transit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isMarkingTransit}
              onClick={handleMarkInTransit}
              data-ocid="admin.transit.confirm_button"
            >
              {isMarkingTransit ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm In Transit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

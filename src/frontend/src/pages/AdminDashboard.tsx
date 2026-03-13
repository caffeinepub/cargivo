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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type CustomerProfile,
  type QuoteRequest,
  useGetAllCustomers,
  useGetAllQuoteRequests,
  useGetOrder,
  useMarkAdvancePaid,
  useSendQuotation,
  useUpdateOrderStatus,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  List,
  Loader2,
  LogOut,
  RefreshCw,
  Send,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

function SendQuotationModal({
  request,
  onClose,
}: {
  request: QuoteRequest;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    basePrice: "",
    gstPercent: "18",
    deliveryCharge: "",
    validUntil: "",
    notes: "",
  });
  const send = useSendQuotation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.basePrice ||
      !form.gstPercent ||
      !form.deliveryCharge ||
      !form.validUntil
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const validUntilMs = new Date(form.validUntil).getTime();
      await send.mutateAsync({
        requestId: request.id,
        basePrice: Number.parseFloat(form.basePrice),
        gstPercent: Number.parseFloat(form.gstPercent),
        deliveryCharge: Number.parseFloat(form.deliveryCharge),
        validUntil: BigInt(validUntilMs) * BigInt(1_000_000),
        notes: form.notes || undefined,
      });
      toast.success("Quotation sent to customer!");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to send quotation");
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const base = Number.parseFloat(form.basePrice) || 0;
  const gstAmt = (base * (Number.parseFloat(form.gstPercent) || 0)) / 100;
  const delivery = Number.parseFloat(form.deliveryCharge) || 0;
  const total = base + gstAmt + delivery;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            Send Quotation — REQ-{request.id.toString()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Box:</span>{" "}
              <span>
                {request.boxType} — {request.length}×{request.width}×
                {request.height}mm
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Material:</span>{" "}
              <span>{request.material}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Qty:</span>{" "}
              <span>{request.quantity.toString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Base Price (₹)</Label>
              <Input
                type="number"
                placeholder="25000"
                value={form.basePrice}
                onChange={(e) => update("basePrice", e.target.value)}
                data-ocid="quotation_form.base_price_input"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>GST (%)</Label>
              <Input
                type="number"
                placeholder="18"
                value={form.gstPercent}
                onChange={(e) => update("gstPercent", e.target.value)}
                data-ocid="quotation_form.gst_input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Delivery Charge (₹)</Label>
              <Input
                type="number"
                placeholder="500"
                value={form.deliveryCharge}
                onChange={(e) => update("deliveryCharge", e.target.value)}
                data-ocid="quotation_form.delivery_charge_input"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) => update("validUntil", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any special remarks..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
            />
          </div>

          {base > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base</span>
                <span>₹{base.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span>₹{gstAmt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>₹{delivery.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-1 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={send.isPending}
            data-ocid="quotation_form.submit_button"
          >
            {send.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {send.isPending ? "Sending..." : "Send Quotation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrderRow({ req }: { req: QuoteRequest }) {
  const { data: order } = useGetOrder(req.id);
  const markPaid = useMarkAdvancePaid();
  const updateStatus = useUpdateOrderStatus();
  const [notes, setNotes] = useState("");
  const [tracking, setTracking] = useState("");
  const [nextStatus, setNextStatus] = useState("");

  const handleUpdateStatus = async () => {
    if (!nextStatus) {
      toast.error("Select a status");
      return;
    }
    try {
      await updateStatus.mutateAsync({
        requestId: req.id,
        manufacturingNotes: notes || undefined,
        deliveryTrackingInfo: tracking || undefined,
      });
      toast.success(`Order status updated to ${nextStatus}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">
            REQ-{req.id.toString()} — {req.boxType}
          </div>
          <div className="text-sm text-muted-foreground">
            {req.material} | {req.length}×{req.width}×{req.height}mm | Qty:{" "}
            {req.quantity.toString()}
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {order && (
        <div className="flex gap-4 text-xs">
          <span
            className={
              order.advancePaid ? "text-green-400" : "text-muted-foreground"
            }
          >
            Advance: {order.advancePaid ? "✓ Paid" : "Pending"}
          </span>
          <span
            className={
              order.finalPaid ? "text-green-400" : "text-muted-foreground"
            }
          >
            Final: {order.finalPaid ? "✓ Paid" : "Pending"}
          </span>
        </div>
      )}

      {order && !order.advancePaid && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
          onClick={async () => {
            try {
              await markPaid.mutateAsync(req.id);
              toast.success("Advance marked as paid");
            } catch (e: any) {
              toast.error(e?.message || "Failed");
            }
          }}
          disabled={markPaid.isPending}
        >
          Mark Advance Paid
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Manufacturing notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-xs h-8"
        />
        <Input
          placeholder="Tracking info / link..."
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="text-xs h-8"
        />
      </div>

      <div className="flex gap-2">
        <Select value={nextStatus} onValueChange={setNextStatus}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Update status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_production">In Production</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleUpdateStatus}
          disabled={updateStatus.isPending || !nextStatus}
        >
          {updateStatus.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          <span className="ml-1">Update</span>
        </Button>
      </div>
    </div>
  );
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "requests" | "customers" | "orders"
  >("requests");
  const [quotationTarget, setQuotationTarget] = useState<QuoteRequest | null>(
    null,
  );
  const { data: allRequests, isLoading: loadingRequests } =
    useGetAllQuoteRequests();
  const { data: allCustomers, isLoading: loadingCustomers } =
    useGetAllCustomers();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate("/");
  };

  const activeOrders = (allRequests ?? []).filter((r) =>
    ["approved", "advance_paid", "in_production", "delivered"].includes(
      r.status,
    ),
  );

  const navItems = [
    {
      id: "requests" as const,
      label: "Quote Requests",
      icon: List,
      ocid: "admin_dashboard.requests_tab",
    },
    {
      id: "customers" as const,
      label: "All Customers",
      icon: Users,
      ocid: "admin_dashboard.customers_tab",
    },
    {
      id: "orders" as const,
      label: "Orders",
      icon: ShoppingBag,
      ocid: "admin_dashboard.orders_tab",
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
          <div className="mt-2 text-xs text-primary font-medium">
            Admin Panel
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
              {item.id === "requests" && allRequests && (
                <span className="ml-auto text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                  {
                    allRequests.filter((r) => r.status === "pending_quote")
                      .length
                  }
                </span>
              )}
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
        <span className="text-xs text-primary font-medium">Admin</span>
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
          {/* Quote Requests */}
          {activeTab === "requests" && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Quote Requests</h1>
              {loadingRequests ? (
                <div
                  className="space-y-3"
                  data-ocid="admin_dashboard.requests_tab"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !allRequests || allRequests.length === 0 ? (
                <div
                  className="bg-card border border-border rounded-xl p-12 text-center"
                  data-ocid="admin_dashboard.requests_tab"
                >
                  <List className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No requests yet.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>ID</TableHead>
                        <TableHead>Box Type</TableHead>
                        <TableHead>Specs</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRequests.map((req, idx) => (
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
                          <TableCell className="text-xs text-muted-foreground">
                            {req.material} {req.length}×{req.width}×{req.height}
                          </TableCell>
                          <TableCell>{req.quantity.toString()}</TableCell>
                          <TableCell className="text-xs max-w-28 truncate">
                            {req.deliveryLocation}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={req.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(
                              Number(req.createdAt / BigInt(1_000_000)),
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {req.status === "pending_quote" && (
                              <Button
                                size="sm"
                                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => setQuotationTarget(req)}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Send Quote
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Customers */}
          {activeTab === "customers" && (
            <div>
              <h1 className="text-2xl font-bold mb-6">All Customers</h1>
              {loadingCustomers ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !allCustomers || allCustomers.length === 0 ? (
                <div
                  className="bg-card border border-border rounded-xl p-12 text-center"
                  data-ocid="admin_dashboard.customers_tab"
                >
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No customers registered yet.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Company</TableHead>
                        <TableHead>GST Number</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allCustomers.map(
                        (
                          [, customer]: [any, CustomerProfile],
                          customerIdx: number,
                        ) => (
                          <TableRow
                            key={customer.gstNumber || customer.companyName}
                            className="border-border"
                            data-ocid={`requests_table.item.${customerIdx + 1}`}
                          >
                            <TableCell className="font-medium">
                              {customer.companyName}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {customer.gstNumber}
                            </TableCell>
                            <TableCell>{customer.contactName}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {customer.email}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Active Orders</h1>
              {activeOrders.length === 0 ? (
                <div
                  className="bg-card border border-border rounded-xl p-12 text-center"
                  data-ocid="admin_dashboard.orders_tab"
                >
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active orders.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeOrders.map((req) => (
                    <OrderRow key={req.id.toString()} req={req} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {quotationTarget && (
        <SendQuotationModal
          request={quotationTarget}
          onClose={() => setQuotationTarget(null)}
        />
      )}
    </div>
  );
}

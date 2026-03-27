import type { Quotation, QuoteRequest } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  AlertCircle,
  BanknoteIcon,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Loader2,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LocalOrderData {
  status?: string;
  declineReason?: string;
  advanceNotified?: boolean;
  finalNotified?: boolean;
}

export function getLocalOrderData(orderId: bigint): LocalOrderData | null {
  try {
    const raw = localStorage.getItem(`cargivo_local_order_${orderId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalOrderData(orderId: bigint, data: LocalOrderData): void {
  localStorage.setItem(`cargivo_local_order_${orderId}`, JSON.stringify(data));
}

export function getEffectiveStatus(order: QuoteRequest): string {
  const local = getLocalOrderData(order.id);
  const backend = order.status;
  if (backend === "quote_sent" && local?.status) {
    return local.status;
  }
  if (
    (backend === "quote_sent" || backend === "customer_accepted") &&
    local?.advanceNotified
  ) {
    return "advance_payment_pending";
  }
  return backend;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatReqId(id: bigint, createdAt: bigint): string {
  const ms = Number(createdAt / 1_000_000n);
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(Number(id)).padStart(4, "0");
  return `REQ/${year}/${month}/${seq}`;
}

const STAGES = [
  { key: "ordered", label: "Ordered" },
  { key: "accepted", label: "Accepted" },
  { key: "quotation_done", label: "Quotation Sent" },
  { key: "customer_accepted", label: "Customer Accepted" },
  { key: "advance_paid", label: "Advance Paid" },
  { key: "order_preparing", label: "Order Preparing" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0,
    pending_quote: 0,
    quote_sent: 2,
    customer_accepted: 3,
    customer_declined: -1,
    advance_payment_pending: 4,
    order_preparing: 5,
    in_transit: 6,
    delivered: 7,
    completed: 8,
  };
  return map[status] ?? 0;
}

function Timeline({
  status,
  declineReason,
}: { status?: string; declineReason?: string }) {
  if (status === "customer_declined") {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Order Declined</p>
          {declineReason && (
            <p className="text-xs text-red-600 mt-0.5">
              Reason: {declineReason}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(status ?? "pending");

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Order Progress
      </p>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isFuture = idx > currentStep;
          return (
            <div key={stage.key} className="flex items-center">
              <div
                className="flex flex-col items-center"
                style={{ minWidth: 56 }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isDone
                      ? "bg-green-500 border-green-500"
                      : isCurrent
                        ? "bg-orange-500 border-orange-500"
                        : "bg-white border-gray-300"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : isCurrent ? (
                    <Circle className="h-3 w-3 text-white fill-white" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-300" />
                  )}
                </div>
                <span
                  className={`text-[9px] text-center mt-1 leading-tight ${
                    isDone
                      ? "text-green-600 font-medium"
                      : isCurrent
                        ? "text-orange-600 font-semibold"
                        : isFuture
                          ? "text-gray-400"
                          : "text-gray-500"
                  }`}
                  style={{ maxWidth: 52 }}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-0.5 ${
                    idx < currentStep ? "bg-green-400" : "bg-gray-200"
                  }`}
                  style={{ minWidth: 8 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BankDetails({
  halfAmount,
  label,
}: { halfAmount: number; label: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <BanknoteIcon className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-blue-900">{label}</h4>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-blue-700">Amount Due</span>
          <span className="font-bold text-blue-900">
            {formatCurrency(halfAmount)}
          </span>
        </div>
        <div className="border-t border-blue-200 my-2" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-blue-600">Bank</span>
          <span className="font-medium">HDFC Bank</span>
          <span className="text-blue-600">Account Name</span>
          <span className="font-medium">Cargivo Services Pvt Ltd</span>
          <span className="text-blue-600">Account No.</span>
          <span className="font-medium font-mono">50100123456789</span>
          <span className="text-blue-600">IFSC</span>
          <span className="font-medium font-mono">HDFC0001234</span>
          <span className="text-blue-600">UPI</span>
          <span className="font-medium">cargivo@hdfcbank</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  order: QuoteRequest | null;
  onClose: () => void;
  onStatusChange?: () => void;
}

export default function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: Props) {
  const { actor } = useActor();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [localData, setLocalDataState] = useState<LocalOrderData | null>(null);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isNotifyingAdvance, setIsNotifyingAdvance] = useState(false);
  const [isNotifyingFinal, setIsNotifyingFinal] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const loadQuotation = useCallback(async () => {
    if (!order || !actor) return;
    setLoadingQuotation(true);
    try {
      const q = await actor.getQuotation(order.id);
      setQuotation(q);
    } catch {
      // no quotation yet
    } finally {
      setLoadingQuotation(false);
    }
  }, [order, actor]);

  useEffect(() => {
    if (!order) return;
    const local = getLocalOrderData(order.id);
    setLocalDataState(local);
    setShowDeclineForm(false);
    setDeclineReason("");
    if (
      order.status === "quote_sent" ||
      order.status === "customer_accepted" ||
      order.status === "advance_payment_pending" ||
      order.status === "order_preparing" ||
      order.status === "in_transit" ||
      order.status === "delivered" ||
      order.status === "completed"
    ) {
      loadQuotation();
    } else {
      setQuotation(null);
    }
  }, [order, loadQuotation]);

  if (!order) return null;

  const local = localData;
  const backendStatus = order.status;

  let effectiveStatus = backendStatus;
  if (backendStatus === "quote_sent") {
    if (local?.status === "customer_declined")
      effectiveStatus = "customer_declined";
    else if (local?.advanceNotified)
      effectiveStatus = "advance_payment_pending";
    else if (local?.status === "customer_accepted")
      effectiveStatus = "customer_accepted";
  }

  const showQuotation =
    !!quotation &&
    [
      "quote_sent",
      "customer_accepted",
      "advance_payment_pending",
      "order_preparing",
      "in_transit",
      "delivered",
      "completed",
    ].includes(effectiveStatus);

  const showAcceptDecline =
    backendStatus === "quote_sent" && !local?.status && !local?.advanceNotified;

  const showBankDetailsAdvance =
    (effectiveStatus === "customer_accepted" ||
      effectiveStatus === "advance_payment_pending") &&
    !!quotation;

  const showAdvancePaidButton =
    effectiveStatus === "customer_accepted" && !local?.advanceNotified;

  const showAwaitingConfirmation =
    effectiveStatus === "advance_payment_pending";

  const showFinalPayment =
    (effectiveStatus === "delivered" || backendStatus === "delivered") &&
    !!quotation;

  const showFinalPaidButton =
    effectiveStatus === "delivered" && !local?.finalNotified;

  const showInvoice =
    backendStatus === "completed" || backendStatus === "delivered";

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const newLocal: LocalOrderData = { status: "customer_accepted" };
      setLocalOrderData(order.id, newLocal);
      setLocalDataState(newLocal);
      toast.success("Quotation accepted! Please proceed with advance payment.");
      onStatusChange?.();
    } catch {
      toast.error("Failed to accept");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining.");
      return;
    }
    setIsDeclining(true);
    try {
      const newLocal: LocalOrderData = {
        status: "customer_declined",
        declineReason: declineReason.trim(),
      };
      setLocalOrderData(order.id, newLocal);
      setLocalDataState(newLocal);
      toast.success("Order declined.");
      onStatusChange?.();
      setTimeout(() => onClose(), 1200);
    } catch {
      toast.error("Failed to decline");
    } finally {
      setIsDeclining(false);
    }
  };

  const handleNotifyAdvancePayment = async () => {
    setIsNotifyingAdvance(true);
    try {
      const prev = getLocalOrderData(order.id) ?? {};
      const newLocal: LocalOrderData = {
        ...prev,
        status: "advance_payment_pending",
        advanceNotified: true,
      };
      setLocalOrderData(order.id, newLocal);
      setLocalDataState(newLocal);
      toast.success(
        "Payment notification sent! Admin will verify your payment.",
      );
      onStatusChange?.();
    } finally {
      setIsNotifyingAdvance(false);
    }
  };

  const handleNotifyFinalPayment = async () => {
    setIsNotifyingFinal(true);
    try {
      const prev = getLocalOrderData(order.id) ?? {};
      const newLocal: LocalOrderData = { ...prev, finalNotified: true };
      setLocalOrderData(order.id, newLocal);
      setLocalDataState(newLocal);
      toast.success("Final payment notification sent to admin.");
      onStatusChange?.();
    } finally {
      setIsNotifyingFinal(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!quotation) {
      toast.error("Invoice data not available");
      return;
    }
    setInvoiceLoading(true);
    try {
      const reqId = formatReqId(order.id, order.createdAt);
      const html = `
<!DOCTYPE html>
<html>
<head><title>Invoice - ${reqId}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  h1 { color: #1a56db; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 12px; }
  td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  .total { font-weight: bold; font-size: 16px; }
  .footer { margin-top: 40px; font-size: 12px; color: #666; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CARGIVO</h1>
      <p>Cargivo Services Pvt Ltd</p>
      <p>support@cargivo.com</p>
    </div>
    <div style="text-align:right">
      <h2>INVOICE</h2>
      <p><strong>Invoice No:</strong> ${reqId}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
    </div>
  </div>
  <table>
    <tr><th>Description</th><th>Details</th></tr>
    <tr><td>Box Type</td><td>${order.boxType}</td></tr>
    <tr><td>Dimensions (L\u00d7W\u00d7H cm)</td><td>${order.length}\u00d7${order.width}\u00d7${order.height}</td></tr>
    <tr><td>Quantity</td><td>${order.quantity.toString()}</td></tr>
    ${order.material ? `<tr><td>Material</td><td>${order.material}</td></tr>` : ""}
    <tr><td>Delivery Location</td><td>${order.deliveryLocation}</td></tr>
    <tr><td style="padding-top:16px"><strong>Base Price</strong></td><td><strong>\u20b9${quotation.basePrice.toFixed(2)}</strong></td></tr>
    <tr><td>GST (${quotation.gstPercent}%)</td><td>\u20b9${((quotation.basePrice * quotation.gstPercent) / 100).toFixed(2)}</td></tr>
    <tr><td>Delivery Charge</td><td>\u20b9${quotation.deliveryCharge.toFixed(2)}</td></tr>
    <tr><td class="total">Total</td><td class="total">\u20b9${quotation.totalPrice.toFixed(2)}</td></tr>
  </table>
  <div class="footer">
    <p>Thank you for choosing Cargivo!</p>
    <p>For support: support@cargivo.com</p>
  </div>
</body>
</html>`;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
      }
    } finally {
      setInvoiceLoading(false);
    }
  };

  const statusLabel = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const statusColorClass = (s: string): string => {
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
    };
    return map[s] ?? "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <span>{formatReqId(order.id, order.createdAt)}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColorClass(effectiveStatus)}`}
            >
              {statusLabel(effectiveStatus)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2" ref={printRef}>
          {/* Action Required Banner */}
          {showAcceptDecline && quotation && (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-3 flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-800">
                  Quotation Received! Action Required
                </p>
                <p className="text-xs text-orange-600">
                  Review the price below, then accept or decline.
                </p>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Order Details
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Box Type</span>
              <span className="font-medium">{order.boxType}</span>
              <span className="text-muted-foreground">Dimensions</span>
              <span className="font-medium">
                {order.length}\u00d7{order.width}\u00d7{order.height} cm
              </span>
              {order.material && (
                <>
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-medium">{order.material}</span>
                </>
              )}
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium">{order.quantity.toString()}</span>
              <span className="text-muted-foreground">Delivery Location</span>
              <span className="font-medium">{order.deliveryLocation}</span>
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium">
                {new Date(
                  Number(order.createdAt / 1_000_000n),
                ).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>

          {/* Quotation loading */}
          {loadingQuotation && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              data-ocid="order_modal.quotation.loading_state"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Loading quotation...
            </div>
          )}

          {/* Quotation Price Card */}
          {showQuotation && quotation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">
                Your Quotation
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-blue-700">Base Price</span>
                <span className="font-medium">
                  {formatCurrency(quotation.basePrice)}
                </span>
                <span className="text-blue-700">
                  GST ({quotation.gstPercent}%)
                </span>
                <span className="font-medium">
                  {formatCurrency(
                    (quotation.basePrice * quotation.gstPercent) / 100,
                  )}
                </span>
                <span className="text-blue-700">Delivery Charge</span>
                <span className="font-medium">
                  {formatCurrency(quotation.deliveryCharge)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                <span className="text-blue-800 font-bold text-base">
                  Total Amount
                </span>
                <span className="text-blue-900 font-bold text-xl">
                  {formatCurrency(quotation.totalPrice)}
                </span>
              </div>
              {quotation.notes && (
                <p className="text-xs text-blue-600 mt-2 italic">
                  {quotation.notes}
                </p>
              )}
            </div>
          )}

          {/* Accept / Decline */}
          {showAcceptDecline && quotation && (
            <div className="space-y-3">
              {!showDeclineForm ? (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isAccepting}
                    onClick={handleAccept}
                    data-ocid="order_modal.accept.button"
                  >
                    {isAccepting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Accept Quotation
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setShowDeclineForm(true)}
                    data-ocid="order_modal.decline.button"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-red-800">
                    Why are you declining?
                  </h4>
                  <div>
                    <Label
                      htmlFor="decline-reason"
                      className="text-xs text-red-700"
                    >
                      Reason *
                    </Label>
                    <Textarea
                      id="decline-reason"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Please explain why you are declining this quotation..."
                      className="mt-1 text-sm"
                      rows={3}
                      data-ocid="order_modal.decline_reason.textarea"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isDeclining}
                      onClick={handleDecline}
                      data-ocid="order_modal.decline_confirm.button"
                    >
                      {isDeclining ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : null}
                      Confirm Decline
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeclineForm(false)}
                      data-ocid="order_modal.decline_cancel.button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bank Details for Advance Payment */}
          {showBankDetailsAdvance && quotation && (
            <div className="space-y-3">
              <BankDetails
                halfAmount={quotation.totalPrice / 2}
                label="Pay 50% Advance to Start Production"
              />
              {showAdvancePaidButton && (
                <Button
                  type="button"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isNotifyingAdvance}
                  onClick={handleNotifyAdvancePayment}
                  data-ocid="order_modal.advance_payment.button"
                >
                  {isNotifyingAdvance ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BanknoteIcon className="mr-2 h-4 w-4" />
                  )}
                  I&apos;ve Made the Payment
                </Button>
              )}
            </div>
          )}

          {/* Awaiting admin confirmation */}
          {showAwaitingConfirmation && (
            <div
              className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-3"
              data-ocid="order_modal.awaiting_confirmation.panel"
            >
              <Clock className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  Payment Notification Sent
                </p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Your payment notification has been received. Admin is
                  verifying your payment.
                </p>
              </div>
            </div>
          )}

          {/* Order preparing */}
          {backendStatus === "order_preparing" && (
            <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <Package className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-800">
                  Order is Being Prepared
                </p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Your order is currently in manufacturing. We&apos;ll update
                  you once it&apos;s shipped.
                </p>
              </div>
            </div>
          )}

          {/* In transit */}
          {backendStatus === "in_transit" && (
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <Truck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-800">
                  Order is In Transit
                </p>
                {order.adminNotes && (
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Tracking: {order.adminNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Final Payment */}
          {showFinalPayment && quotation && (
            <div className="space-y-3">
              <BankDetails
                halfAmount={quotation.totalPrice / 2}
                label="Pay Remaining 50% to Complete Order"
              />
              {showFinalPaidButton && (
                <Button
                  type="button"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isNotifyingFinal}
                  onClick={handleNotifyFinalPayment}
                  data-ocid="order_modal.final_payment.button"
                >
                  {isNotifyingFinal ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BanknoteIcon className="mr-2 h-4 w-4" />
                  )}
                  I&apos;ve Made the Final Payment
                </Button>
              )}
              {local?.finalNotified && (
                <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Final payment notification sent to admin.
                </div>
              )}
            </div>
          )}

          {/* Completed */}
          {backendStatus === "completed" && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">
                Order Completed! Thank you for choosing Cargivo.
              </p>
            </div>
          )}

          {/* Download Invoice */}
          {showInvoice && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5"
              disabled={invoiceLoading}
              onClick={handleDownloadInvoice}
              data-ocid="order_modal.invoice.button"
            >
              {invoiceLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Invoice
            </Button>
          )}

          {/* Progress Timeline */}
          <Timeline
            status={effectiveStatus}
            declineReason={local?.declineReason}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetInvoiceData } from "@/hooks/useQueries";
import { ArrowLeft, Printer } from "lucide-react";
import { useRef } from "react";

interface InvoicePageProps {
  requestId: bigint;
  onNavigate: (path: string) => void;
}

export function InvoicePage({ requestId, onNavigate }: InvoicePageProps) {
  const { data: invoiceData, isLoading } = useGetInvoiceData(requestId);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invoice not found.</p>
          <Button onClick={() => onNavigate("/dashboard")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { customer, request, quotation } = invoiceData;
  const gstAmount = (quotation.basePrice * quotation.gstPercent) / 100;
  const invoiceDate = new Date(
    Number(quotation.sentAt / BigInt(1_000_000)),
  ).toLocaleDateString("en-IN");

  return (
    <div className="min-h-screen bg-background">
      {/* Action bar - hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => onNavigate("/dashboard")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="invoice.print_button"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice */}
      <div className="py-8 px-4">
        <div
          ref={printRef}
          className="max-w-3xl mx-auto bg-white text-gray-900 rounded-xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Invoice header */}
          <div className="bg-[#0f172a] text-white px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <img
                  src="/assets/generated/cargivo-logo-transparent.dim_200x60.png"
                  alt="Cargivo"
                  className="h-10 w-auto mb-4"
                />
                <p className="text-slate-300 text-sm">
                  Custom Cargo Box Fabrication Platform
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  GSTIN: 22AAAAA0000A1Z5 (Platform)
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-400 font-display">
                  TAX INVOICE
                </div>
                <div className="text-slate-300 mt-2 text-sm">
                  Invoice No:{" "}
                  <span className="font-mono font-semibold text-white">
                    REQ-{request.id.toString()}
                  </span>
                </div>
                <div className="text-slate-300 text-sm">
                  Date:{" "}
                  <span className="font-semibold text-white">
                    {invoiceDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill to */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Bill To
                </h3>
                <p className="font-bold text-lg text-gray-900">
                  {customer.companyName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  GST: {customer.gstNumber}
                </p>
                <p className="text-sm text-gray-600">{customer.address}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Delivery To
                </h3>
                <p className="text-sm text-gray-700">
                  {request.deliveryLocation}
                </p>
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Contact
                  </h3>
                  <p className="text-sm text-gray-700">
                    {customer.contactName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="px-8 py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">
                    Dimensions (mm)
                  </th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">
                    Material
                  </th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4">
                    <span className="font-semibold">
                      {request.boxType} Cargo Box
                    </span>
                    {request.adminNotes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {request.adminNotes}
                      </p>
                    )}
                  </td>
                  <td className="py-4 text-center text-gray-700">
                    {request.length}×{request.width}×{request.height}
                  </td>
                  <td className="py-4 text-center text-gray-700">
                    {request.material}
                  </td>
                  <td className="py-4 text-center text-gray-700">
                    {request.quantity.toString()}
                  </td>
                  <td className="py-4 text-right font-semibold">
                    ₹{quotation.basePrice.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-6">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium">
                  ₹{quotation.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  GST @ {quotation.gstPercent}% (IGST)
                </span>
                <span className="font-medium">
                  ₹{gstAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-medium">
                  ₹{quotation.deliveryCharge.toLocaleString()}
                </span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between">
                <span className="font-bold text-base">Total Amount</span>
                <span className="font-bold text-xl text-orange-600">
                  ₹{quotation.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="px-8 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-700">{quotation.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-5 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500">
              This is a computer-generated invoice. For queries, contact us at
              support@cargivo.com
            </p>
            <p className="text-xs text-gray-400 mt-1">
              © {new Date().getFullYear()} Cargivo — Custom Cargo Box
              Fabrication Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

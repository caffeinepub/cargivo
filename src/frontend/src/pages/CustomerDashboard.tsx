import type { NavigateFn } from "@/App";
import type { CustomerProfile, QuoteRequest } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@/hooks/useActor";
import {
  Clock,
  Loader2,
  LogOut,
  Package,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: NavigateFn;
  emailLogout: () => void;
  emailUser: CustomerProfile | null;
  emailCredentials: { email: string; password: string } | null;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    quote_sent: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    manufacturing: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function CustomerDashboard({
  navigate,
  emailLogout,
  emailUser,
  emailCredentials,
}: Props) {
  const { actor } = useActor();
  const [activeTab, setActiveTab] = useState<"request" | "dashboard">(
    "request",
  );
  const [orders, setOrders] = useState<QuoteRequest[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boxType, setBoxType] = useState("");
  const [material, setMaterial] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");
  const [building, setBuilding] = useState("");
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!emailCredentials || !actor) return;
    setLoadingOrders(true);
    try {
      const result = await actor.getMyQuoteRequestsWithEmail(
        emailCredentials.email,
        emailCredentials.password,
      );
      setOrders(result);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [emailCredentials, actor]);

  const handleTabChange = (tab: "request" | "dashboard") => {
    setActiveTab(tab);
    if (tab === "dashboard") loadOrders();
  };

  if (!ordersLoaded && activeTab === "request" && actor) {
    setOrdersLoaded(true);
    loadOrders();
  }

  useEffect(() => {
    const saved = localStorage.getItem("cargivo_saved_address");
    if (saved) {
      try {
        const addr = JSON.parse(saved);
        setCity(addr.city || "");
        setLandmark(addr.landmark || "");
        setBuilding(addr.building || "");
        setHasSavedAddress(true);
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    emailLogout();
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCredentials || !actor) {
      toast.error("Not logged in");
      return;
    }
    if (!boxType) {
      toast.error("Please select box type");
      return;
    }
    setIsSubmitting(true);
    const deliveryLocation = `${building}, ${landmark}, ${city}`;
    try {
      await actor.submitQuoteRequestWithEmail(
        emailCredentials.email,
        emailCredentials.password,
        {
          boxType,
          material: boxType === "Custom" ? material : "",
          length: Number.parseFloat(length) || 0,
          width: Number.parseFloat(width) || 0,
          height: Number.parseFloat(height) || 0,
          quantity: BigInt(Number.parseInt(quantity) || 0),
          deliveryLocation,
          drawingFileId: undefined,
        },
      );
      toast.success("Quote request submitted!");
      localStorage.setItem(
        "cargivo_saved_address",
        JSON.stringify({ city, landmark, building }),
      );
      setBoxType("");
      setMaterial("");
      setLength("");
      setWidth("");
      setHeight("");
      setQuantity("");
      setCity("");
      setLandmark("");
      setBuilding("");
      await loadOrders();
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const quoteSentCount = orders.filter((o) => o.status === "quote_sent").length;

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img
              src="/assets/uploads/image-4-1.png"
              alt="Cargivo"
              className="h-10 w-auto"
            />
            <nav className="flex gap-1">
              <button
                type="button"
                onClick={() => handleTabChange("request")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "request"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                data-ocid="dashboard.request_tab"
              >
                Request Quote
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                data-ocid="dashboard.overview_tab"
              >
                My Orders
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {emailUser?.companyName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1"
              data-ocid="dashboard.logout.button"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "request" && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
                <h2 className="text-2xl font-display font-bold mb-6">
                  Request a Quote
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label>Box Type *</Label>
                    <Select value={boxType} onValueChange={setBoxType}>
                      <SelectTrigger
                        className="mt-1"
                        data-ocid="quote.box_type.select"
                      >
                        <SelectValue placeholder="Select box type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Metal">Metal</SelectItem>
                        <SelectItem value="Wooden">Wooden</SelectItem>
                        <SelectItem value="Plastic">Plastic</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {boxType === "Custom" && (
                    <div>
                      <Label htmlFor="q-material">Material *</Label>
                      <Input
                        id="q-material"
                        required
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="e.g. Stainless Steel, Plywood"
                        className="mt-1"
                        data-ocid="quote.material.input"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Dimensions (cm) *</Label>
                    <div className="grid grid-cols-3 gap-3 mt-1">
                      <div>
                        <Input
                          placeholder="Length"
                          type="number"
                          min="0"
                          step="0.1"
                          required
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          data-ocid="quote.length.input"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Length
                        </p>
                      </div>
                      <div>
                        <Input
                          placeholder="Width"
                          type="number"
                          min="0"
                          step="0.1"
                          required
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          data-ocid="quote.width.input"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Width
                        </p>
                      </div>
                      <div>
                        <Input
                          placeholder="Height"
                          type="number"
                          min="0"
                          step="0.1"
                          required
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          data-ocid="quote.height.input"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Height
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="q-qty">Quantity *</Label>
                    <Input
                      id="q-qty"
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="mt-1"
                      data-ocid="quote.quantity.input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="q-drawing">
                      Upload Drawing / Photo (Optional)
                    </Label>
                    <Input
                      id="q-drawing"
                      type="file"
                      accept="image/*,.pdf"
                      className="mt-1"
                      data-ocid="quote.upload_button"
                    />
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm font-semibold">Delivery Location</p>
                      {hasSavedAddress && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Auto-filled
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="q-city">City *</Label>
                        <Input
                          id="q-city"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Mumbai"
                          data-ocid="quote.city.input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="q-landmark">Landmark *</Label>
                        <Input
                          id="q-landmark"
                          required
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near Station"
                          data-ocid="quote.landmark.input"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="q-building">Building / Shop No *</Label>
                        <Input
                          id="q-building"
                          required
                          value={building}
                          onChange={(e) => setBuilding(e.target.value)}
                          placeholder="Shop 12, Andheri Plaza"
                          data-ocid="quote.building.input"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    disabled={isSubmitting}
                    data-ocid="quote.submit_button"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-display font-semibold">
                    Past Orders
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOrdersLoaded(false);
                      loadOrders();
                    }}
                    className="gap-1 text-muted-foreground"
                    data-ocid="quote.refresh.button"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
                {loadingOrders ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="quote.orders.loading_state"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </div>
                ) : orders.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="quote.orders.empty_state"
                  >
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order, i) => (
                      <div
                        key={order.id.toString()}
                        className="border border-border rounded-xl p-4"
                        data-ocid={`quote.orders.item.${i + 1}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold">
                              REQ-{order.id.toString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.length}×{order.width}×{order.height} cm ·{" "}
                              {order.boxType}
                            </p>
                          </div>
                          {statusBadge(order.status)}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1"
                            onClick={() => {
                              setBoxType(order.boxType);
                              setMaterial(order.material ?? "");
                              setLength(order.length.toString());
                              setWidth(order.width.toString());
                              setHeight(order.height.toString());
                              setQuantity(order.quantity.toString());
                            }}
                            data-ocid={`quote.orders.reorder.button.${i + 1}`}
                          >
                            <RotateCcw className="h-3 w-3" /> Reorder
                          </Button>
                          {(order.status === "quote_sent" ||
                            order.status === "confirmed" ||
                            order.status === "manufacturing" ||
                            order.status === "delivered") && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 gap-1"
                              data-ocid={`quote.orders.invoice.button.${i + 1}`}
                            >
                              <ReceiptText className="h-3 w-3" /> Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="hero-gradient rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-display font-bold">
                Welcome, {emailUser?.companyName ?? "Customer"}!
              </h2>
              <p className="text-white/80 mt-1">
                Manage your quote requests and orders below
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: Package,
                  label: "Total Requests",
                  value: orders.length,
                  color: "text-primary",
                },
                {
                  icon: Clock,
                  label: "Pending",
                  value: pendingCount,
                  color: "text-yellow-600",
                },
                {
                  icon: TrendingUp,
                  label: "Quote Received",
                  value: quoteSentCount,
                  color: "text-blue-600",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-border shadow-xs p-5"
                >
                  <Icon className={`h-5 w-5 ${color} mb-2`} />
                  <p className="text-2xl font-display font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-semibold">
                  All Orders
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={loadOrders}
                  className="gap-1 text-muted-foreground"
                  data-ocid="dashboard.refresh.button"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`}
                  />{" "}
                  Refresh
                </Button>
              </div>
              {loadingOrders ? (
                <div
                  className="text-center py-12"
                  data-ocid="dashboard.orders.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="dashboard.orders.empty_state"
                >
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No orders yet. Submit your first quote request!</p>
                  <Button
                    type="button"
                    className="mt-4 bg-primary text-primary-foreground"
                    size="sm"
                    onClick={() => setActiveTab("request")}
                    data-ocid="dashboard.request.button"
                  >
                    Request a Quote
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, i) => (
                    <div
                      key={order.id.toString()}
                      className="flex items-center justify-between border border-border rounded-xl p-4"
                      data-ocid={`dashboard.orders.item.${i + 1}`}
                    >
                      <div>
                        <p className="font-semibold text-sm">
                          REQ-{order.id.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.boxType} · {order.length}×{order.width}×
                          {order.height} cm · Qty: {order.quantity.toString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(order.status)}
                        {(order.status === "quote_sent" ||
                          order.status === "confirmed" ||
                          order.status === "delivered") && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            data-ocid={`dashboard.orders.invoice.button.${i + 1}`}
                          >
                            <ReceiptText className="h-3 w-3 mr-1" /> Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

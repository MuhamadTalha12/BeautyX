import { Helmet } from "react-helmet-async";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useState } from "react";
import { trackOrder } from "@/services/orderService";
import { toast } from "sonner";
import { Clock, Package, Truck, CheckCircle2, AlertCircle, ArrowLeft, Heart } from "lucide-react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return toast.error("Please enter a valid Order ID");
    if (!email.trim()) return toast.error("Please enter your email address");

    setLoading(true);
    setOrder(null);
    try {
      const res = await trackOrder(orderId.trim(), email.trim());
      if (res.data.success) {
        setOrder(res.data.order);
        setSearched(true);
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Could not retrieve tracking details. Please double-check the Order ID and Email.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetTracker = () => {
    setOrder(null);
    setSearched(false);
    setOrderId("");
  };

  // Helper to determine status order
  const getStatusStep = (currentStatus: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const index = steps.indexOf(currentStatus.toLowerCase());
    return index === -1 && currentStatus.toLowerCase() === "cancelled" ? -1 : index;
  };

  const statusIndex = order ? getStatusStep(order.orderStatus) : 0;

  return (
    <>
      <Helmet>
        <title>Track Order</title>
      </Helmet>

      <PageShell>
        <PageHero 
          title="Track Your Order" 
          subtitle={searched ? `Order Status Details` : "Enter your order number and email to see the latest status."} 
        />
        
        <div className="mx-auto max-w-3xl px-4 py-16">
          {!searched ? (
            <div className="max-w-md mx-auto border border-border bg-card p-8 rounded-sm shadow-sm space-y-6">
              <form onSubmit={handleTrackSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Order ID
                  </label>
                  <input
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                    placeholder="Enter 24-character Order ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                    placeholder="Enter email associated with order"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? "Searching Database..." : "Track Order"}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-200">
              {/* Back to search trigger */}
              <button 
                onClick={resetTracker}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-all font-semibold"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
                Track Another Order
              </button>

              {/* Order Header Summary */}
              <div className="bg-secondary/10 border border-border p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-primary">Order ID: {order._id}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Price</span>
                  <span className="font-serif text-xl text-primary font-bold">PKR {order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Royal Tracking Timeline */}
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-primary border-b border-border pb-2">Tracking Timeline</h3>
                
                {order.orderStatus.toLowerCase() === "cancelled" ? (
                  <div className="flex items-center gap-4 p-4 border border-rose-900/30 bg-rose-950/10 rounded-sm text-rose-800">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Order Cancelled</h4>
                      <p className="text-xs opacity-90">This order has been cancelled and will not be processed further.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center relative py-6">
                    {/* Progress Connecting Line */}
                    <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-border -translate-y-1/2 -z-10">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${(statusIndex / 3) * 100}%` }}
                      />
                    </div>

                    {/* Step 1: Placed */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        statusIndex >= 0 ? "bg-accent border-accent text-accent-foreground" : "bg-card border-border text-muted-foreground"
                      }`}>
                        <Clock className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${statusIndex >= 0 ? "text-primary" : "text-muted-foreground"}`}>Placed</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Order Received</p>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        statusIndex >= 1 ? "bg-accent border-accent text-accent-foreground" : "bg-card border-border text-muted-foreground"
                      }`}>
                        <Package className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${statusIndex >= 1 ? "text-primary" : "text-muted-foreground"}`}>Packing</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Ready for dispatch</p>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        statusIndex >= 2 ? "bg-accent border-accent text-accent-foreground" : "bg-card border-border text-muted-foreground"
                      }`}>
                        <Truck className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${statusIndex >= 2 ? "text-primary" : "text-muted-foreground"}`}>Shipped</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">In Transit</p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                        statusIndex >= 3 ? "bg-accent border-accent text-accent-foreground" : "bg-card border-border text-muted-foreground"
                      }`}>
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${statusIndex >= 3 ? "text-primary" : "text-muted-foreground"}`}>Delivered</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Handed over</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Summary list */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-serif text-lg text-primary border-b border-border pb-2">Order Items</h4>
                  <div className="border border-border rounded-sm divide-y divide-border bg-card">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 items-center">
                        <div className="w-12 h-16 bg-secondary/30 rounded-sm shrink-0 border border-border flex items-center justify-center font-serif text-[10px] text-muted-foreground">
                          ✦
                        </div>
                        <div className="flex-1 flex justify-between items-center text-sm">
                          <div>
                            <p className="font-serif text-base text-primary font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.color} / {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-medium text-primary">PKR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Overview */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-lg text-primary border-b border-border pb-2 mb-3">Shipping Info</h4>
                    <div className="bg-secondary/20 p-4 border border-border rounded-sm text-xs text-muted-foreground leading-relaxed space-y-1">
                      <p className="font-semibold text-primary text-sm mb-1">{order.shippingAddress?.name}</p>
                      <p>{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                      <p className="pt-2 font-medium">Contact: {order.shippingAddress?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif text-lg text-primary border-b border-border pb-2 mb-3">Payment Info</h4>
                    <div className="bg-secondary/20 p-4 border border-border rounded-sm text-xs text-muted-foreground space-y-2">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-semibold uppercase text-primary">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-semibold uppercase ${
                          order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                        }`}>{order.paymentStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageShell>
    </>
  );
}

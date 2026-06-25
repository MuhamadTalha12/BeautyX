import { Helmet } from "react-helmet-async";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useState, useEffect } from "react";
import { clearCart } from "@/redux/slices/cartSlice";
import { createOrder, createPaymentIntent } from "@/services/orderService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe (will run in mock mode if key is placeholder or real mode if valid)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51TkPRF1tKp0zUwgPvh7H5j9i0h7P6g5f4d3s2a1q8w9e0r"
);

// Real Stripe payment form nested component
function RealStripeForm({
  clientSecret,
  onPaymentSuccess,
  total,
  validateAddress
}: {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  total: number;
  validateAddress: () => boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!validateAddress()) return;

    setProcessing(true);
    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required"
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
      <PaymentElement />
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 disabled:opacity-50 font-medium transition-all"
      >
        {processing ? "Processing payment..." : `Pay PKR ${total.toLocaleString()}`}
      </button>
    </form>
  );
}

// Mock payment form component for offline/sandbox testing
function MockPaymentForm({
  total,
  onPaymentSuccess,
  validateAddress
}: {
  total: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  validateAddress: () => boolean;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showGooglePayModal, setShowGooglePayModal] = useState(false);

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;

    if (cardNumber.replace(/\s/g, "").length < 16) {
      return toast.error("Please enter a valid card number");
    }
    if (expiry.length < 5) {
      return toast.error("Please enter a valid expiry date (MM/YY)");
    }
    if (cvv.length < 3) {
      return toast.error("Please enter a valid security code (CVV)");
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess("mock_pi_card_" + Math.random().toString(36).substr(2, 9));
    }, 1500);
  };

  const handleGooglePayClick = () => {
    if (!validateAddress()) return;
    setShowGooglePayModal(true);
  };

  const handleGooglePayConfirm = () => {
    setProcessing(true);
    setShowGooglePayModal(false);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess("mock_pi_gpay_" + Math.random().toString(36).substr(2, 9));
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Mock Google Pay Button */}
      <div>
        <button
          type="button"
          onClick={handleGooglePayClick}
          className="w-full bg-black text-white hover:bg-zinc-900 py-3 rounded-md flex items-center justify-center gap-2 border border-zinc-800 transition"
        >
          <span className="font-semibold text-sm">Pay with</span>
          <span className="bg-white text-black px-1.5 py-0.5 rounded font-bold text-xs">G Pay</span>
        </button>
        <div className="text-center my-3 text-xs text-muted-foreground uppercase tracking-widest font-semibold">— OR PAY WITH CARD —</div>
      </div>

      <form onSubmit={handleCardPay} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Card Number</label>
          <input
            required
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "").match(/.{1,4}/g)?.join(" ") || "";
              setCardNumber(val.slice(0, 19));
            }}
            className="w-full border border-border p-3 rounded-sm bg-background text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Expiry Date</label>
            <input
              required
              placeholder="MM/YY"
              value={expiry}
              onChange={e => {
                let val = e.target.value.replace(/\D/g, "");
                if (val.length > 2) {
                  val = val.slice(0, 2) + "/" + val.slice(2, 4);
                }
                setExpiry(val.slice(0, 5));
              }}
              className="w-full border border-border p-3 rounded-sm bg-background text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">CVV</label>
            <input
              required
              type="password"
              placeholder="123"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full border border-border p-3 rounded-sm bg-background text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={processing}
          className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          {processing ? "Processing simulated card..." : `Pay PKR ${total.toLocaleString()}`}
        </button>
      </form>

      {/* Mock Google Pay Wallet Selector Modal */}
      {showGooglePayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-background border border-border w-full max-w-sm rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded text-[10px]">G Pay</span>
                <h4 className="font-serif text-sm font-semibold text-primary">Google Pay Wallet</h4>
              </div>
              <button onClick={() => setShowGooglePayModal(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-xs text-muted-foreground">Select a card from Google Account:</div>
              <label className="flex items-center gap-3 p-3 border border-primary rounded bg-primary/5 cursor-pointer">
                <input type="radio" defaultChecked />
                <div>
                  <div className="font-medium text-xs text-primary">Visa •••• 4242</div>
                  <div className="text-[10px] text-muted-foreground">Google Account Saved Card</div>
                </div>
              </label>
              <div className="border-t border-border pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Merchant</span>
                  <span className="font-medium text-primary">BeautyX Intimates</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Amount</span>
                  <span className="font-semibold text-primary">PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-secondary/10 border-t border-border flex justify-end gap-2.5">
              <button
                onClick={() => setShowGooglePayModal(false)}
                className="px-4 py-2 border border-border rounded text-[10px] uppercase font-semibold hover:bg-secondary/35"
              >
                Cancel
              </button>
              <button
                onClick={handleGooglePayConfirm}
                className="px-5 py-2 bg-primary text-primary-foreground rounded text-[10px] uppercase font-semibold hover:bg-primary/95 shadow-sm"
              >
                Pay PKR {total.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Checkout() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    province: "Punjab",
    postalCode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Stripe Session States
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 3000 ? 0 : 200;
  const total = subtotal + shipping;

  // Handle Payment Method Switch and Fetch Stripe Secret
  const handlePaymentMethodChange = async (method: string) => {
    setPaymentMethod(method);
    if (method === "stripe" && !clientSecret) {
      try {
        setLoadingPayment(true);
        const res = await createPaymentIntent(total);
        if (res.data.success) {
          setClientSecret(res.data.clientSecret);
          setPaymentIntentId(res.data.paymentIntentId);
        }
      } catch (error) {
        console.error("Failed to load payment gateway session", error);
        toast.error("Failed to initialize Stripe payment. Switching to Cash on Delivery.");
        setPaymentMethod("cod");
      } finally {
        setLoadingPayment(false);
      }
    }
  };

  // Helper to validate address fields are completed
  const validateAddress = (): boolean => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      toast.error("Please complete all shipping address fields before payment.");
      return false;
    }

    if (formData.name.trim().length < 3) {
      toast.error("Please enter a valid full name (minimum 3 characters).");
      return false;
    }

    // Pakistani Mobile Number Format Validation (03xx-xxxxxxx, +923xxxxxxxxx, etc.)
    const pkPhoneRegex = /^((\+92)|(0092)|(0))?3\d{9}$/;
    const sanitizedPhone = formData.phone.trim().replace(/[-\s()]/g, "");
    if (!pkPhoneRegex.test(sanitizedPhone)) {
      toast.error("Please enter a valid Pakistani mobile number (e.g., 03001234567).");
      return false;
    }

    // Postal Code Validation (exactly 5 digits)
    const postalRegex = /^\d{5}$/;
    if (!postalRegex.test(formData.postalCode.trim())) {
      toast.error("Please enter a valid 5-digit postal code.");
      return false;
    }

    return true;
  };

  // Handles placing order (either directly for COD, or after card payment succeeds)
  const completeCheckoutOrder = async (confirmedPaymentId: string | null = null) => {
    try {
      await createOrder({
        items: cartItems,
        shippingAddress: formData,
        paymentMethod: paymentMethod === "cod" ? "cod" : "card",
        paymentIntentId: confirmedPaymentId,
        total
      });
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      toast.error("Failed to place order.");
    }
  };

  const handleCODSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Your cart is empty");
    if (!validateAddress()) return;
    await completeCheckoutOrder(null);
  };

  if (cartItems.length === 0) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-serif text-primary">Your cart is empty</h2>
        </div>
      </PageShell>
    );
  }

  const isMockStripe = clientSecret?.startsWith("mock_");

  return (
    <PageShell>
      <Helmet>
        <title>Checkout</title>
      </Helmet>
      <PageHero title="Checkout" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Shipping Form Left Column */}
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl text-primary mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  required
                  placeholder="Full Name"
                  className="border border-border p-3 rounded-sm w-full bg-background"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  required
                  placeholder="Phone Number"
                  className="border border-border p-3 rounded-sm w-full bg-background"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <input
                  required
                  placeholder="Street Address"
                  className="border border-border p-3 rounded-sm w-full bg-background"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="City"
                    className="border border-border p-3 rounded-sm w-full bg-background"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                  <select
                    className="border border-border p-3 rounded-sm w-full bg-background text-primary"
                    value={formData.province}
                    onChange={e => setFormData({ ...formData, province: e.target.value })}
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">KPK</option>
                    <option value="Balochistan">Balochistan</option>
                  </select>
                </div>
                <input
                  required
                  placeholder="Postal Code"
                  className="border border-border p-3 rounded-sm w-full bg-background"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <h3 className="font-serif text-xl text-primary mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-border rounded-sm cursor-pointer hover:bg-secondary/10 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => handlePaymentMethodChange("cod")}
                  />
                  <div>
                    <div className="font-medium text-sm text-primary">Cash on Delivery</div>
                    <div className="text-xs text-muted-foreground">Pay in cash upon doorstep shipment delivery.</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border rounded-sm cursor-pointer hover:bg-secondary/10 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => handlePaymentMethodChange("stripe")}
                  />
                  <div>
                    <div className="font-medium text-sm text-primary">Credit/Debit Card & Google Pay</div>
                    <div className="text-xs text-muted-foreground">Secure checkouts processed instantly via Stripe.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Stripe Card/Google Pay Element / Mock Payment Gateway Container */}
            {paymentMethod === "stripe" && (
              <div className="border border-border p-6 rounded-sm bg-secondary/20 space-y-4">
                <h4 className="font-serif text-lg text-primary border-b border-border pb-2 mb-2">Billing Information</h4>
                {loadingPayment ? (
                  <div className="text-center py-6 text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
                    Connecting Payment Gateway...
                  </div>
                ) : clientSecret ? (
                  isMockStripe ? (
                    <MockPaymentForm total={total} onPaymentSuccess={completeCheckoutOrder} validateAddress={validateAddress} />
                  ) : (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <RealStripeForm
                        clientSecret={clientSecret}
                        total={total}
                        onPaymentSuccess={completeCheckoutOrder}
                        validateAddress={validateAddress}
                      />
                    </Elements>
                  )
                ) : null}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-secondary/50 p-6 rounded-sm border border-border sticky top-24">
              <h3 className="font-serif text-xl text-primary mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={`${item._id}-${item.color}-${item.size}`} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#d8b89c] to-[#a8855f] rounded-sm shrink-0" />
                      <div>
                        <p className="font-medium text-primary">{item.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.color} / {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `PKR ${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-medium text-lg text-primary mt-4">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Conditional Place Order Submit Trigger */}
              {paymentMethod === "cod" ? (
                <form onSubmit={handleCODSubmit}>
                  <button
                    type="submit"
                    className="block w-full text-center mt-8 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 transition-all font-semibold"
                  >
                    Place COD Order
                  </button>
                </form>
              ) : (
                <div className="mt-8 text-center text-xs text-muted-foreground bg-secondary/30 p-4 border border-border border-dashed uppercase tracking-wider font-semibold">
                  💳 Please complete billing below
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

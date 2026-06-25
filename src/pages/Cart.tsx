import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { removeFromCart, updateQuantity } from "@/redux/slices/cartSlice";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 3000 ? 0 : 200;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  return (
    <PageShell>
      <Helmet><title>Your Bag</title></Helmet>
      <PageHero title="Your Bag" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {cartItems.length === 0 ? (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-serif text-2xl text-primary mt-6">Your bag is empty</h2>
            <p className="text-muted-foreground mt-2">Discover our latest arrivals and best sellers.</p>
            <Link to="/new-arrivals" className="inline-block mt-8 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.color}-${item.size}`} className="flex gap-6 border-b border-border pb-6">
                  <div className="w-24 h-32 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                    {/* Fallback image */}
                    <div className="w-full h-full bg-gradient-to-br from-[#d8b89c] to-[#a8855f] flex items-center justify-center font-serif text-primary-foreground/50 text-2xl">✦</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.slug}`} className="font-serif text-lg text-primary hover:underline">{item.name}</Link>
                        <div className="text-sm text-muted-foreground mt-1 flex gap-2 items-center">
                          <span className="w-3 h-3 rounded-full border border-border inline-block" style={{ backgroundColor: item.color }}></span>
                          <span>| Size: {item.size}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">PKR {(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-border rounded-sm">
                        <button 
                          className="px-3 py-1 hover:text-primary transition disabled:opacity-50"
                          onClick={() => dispatch(updateQuantity({ ...item, quantity: Math.max(1, item.quantity - 1) }))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <button 
                          className="px-3 py-1 hover:text-primary transition"
                          onClick={() => {
                            const selectedSizeStock = item.sizeStock && item.sizeStock[item.size] !== undefined ? item.sizeStock[item.size] : (item.stock !== undefined ? item.stock : 99);
                            if (item.quantity + 1 > selectedSizeStock) {
                              toast.error(`Cannot add more. Only ${selectedSizeStock} items are available in stock for size ${item.size}.`);
                              return;
                            }
                            dispatch(updateQuantity({ ...item, quantity: item.quantity + 1 }));
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        className="text-xs text-muted-foreground hover:text-rose flex items-center gap-1 uppercase tracking-wider"
                        onClick={() => dispatch(removeFromCart({ _id: item._id, color: item.color, size: item.size }))}
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <div className="bg-secondary/50 p-6 rounded-sm border border-border">
                <h3 className="font-serif text-xl text-primary mb-6">Order Summary</h3>
                <div className="space-y-3 text-sm">
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
                <Link to="/checkout" className="block w-full text-center mt-8 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">
                  Proceed to Checkout
                </Link>
                <div className="mt-4 text-xs text-center text-muted-foreground">
                  Secure checkout with Stripe or Cash on Delivery
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}


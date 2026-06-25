import { Helmet } from "react-helmet-async";
import { PageShell } from "@/components/site/PageShell";
import { useEffect, useState } from "react";
import { getOrderById } from "@/services/orderService";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { createProductReview } from "@/services/productService";
import { X, Star } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review state variables
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewProductName, setReviewProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleOpenReviewModal = (productId: string, productName: string) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setRating(5);
    setComment("");
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter some feedback comments.");
      return;
    }

    setSubmittingReview(true);
    try {
      await createProductReview(reviewProductId, rating, comment);
      toast.success("Thank you for your feedback! Review submitted successfully.");
      setIsReviewModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit review. You may have already reviewed this product.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id || "");
        setOrder(res.data.data.order);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <PageShell><div className="flex h-[50vh] items-center justify-center">Loading order...</div></PageShell>;
  }

  if (!order) {
    return <PageShell><div className="text-center py-20">Order not found.</div></PageShell>;
  }

  return (
    <PageShell>
      <Helmet><title>Order Details</title></Helmet>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">← Back to Orders</Link>
        <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-3xl text-primary">Order {order._id}</h1>
            <p className="text-muted-foreground mt-2">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em]">{order.orderStatus}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-serif text-xl text-primary">Items</h3>
            <div className="border border-border rounded-sm divide-y divide-border">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 items-start">
                  <div className="w-20 h-28 bg-secondary/80 flex-shrink-0 flex items-center justify-center font-serif text-[10px] text-muted-foreground/60 border border-border">✦</div>
                  <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <p className="font-serif text-lg text-primary">{item.name || item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Color: {item.color} | Size: {item.size}</p>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      {order.orderStatus === 'delivered' && (
                        <button
                          onClick={() => handleOpenReviewModal(item.product, item.name || item.title)}
                          className="mt-3 text-[10px] font-semibold border border-primary px-3 py-1.5 uppercase tracking-[0.15em] text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-sm"
                        >
                          Write Review / Feedback
                        </button>
                      )}
                    </div>
                    <p className="font-medium text-primary">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl text-primary mb-4">Summary</h3>
              <div className="bg-secondary/50 p-6 rounded-sm border border-border space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>PKR {order.total.toLocaleString()}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>FREE</span></div>
                <div className="border-t border-border pt-3 flex justify-between font-medium text-lg text-primary mt-2">
                  <span>Total</span><span>PKR {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-serif text-xl text-primary mb-4">Shipping Information</h3>
              <div className="bg-secondary/50 p-6 rounded-sm border border-border text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground mb-1">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Product Review Modal Dialog */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border w-full max-w-md rounded-sm shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
              <h3 className="font-serif text-lg text-primary">Write Product Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-muted-foreground hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div>
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">Product</span>
                <p className="font-serif text-base text-primary mt-1">{reviewProductName}</p>
              </div>
              
              <div>
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold block mb-2">Rating</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className="h-6 w-6"
                        fill={star <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold block mb-2">Your Feedback</span>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product's quality, fit, and texture..."
                  className="w-full border border-border p-3 rounded-sm bg-background text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-primary/95 disabled:opacity-50 font-medium transition-all"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

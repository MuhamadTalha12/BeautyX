import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/components/site/ProductCard";
import { getProductBySlug } from "@/services/productService";
import { addToCart } from "@/redux/slices/cartSlice";
import { addToWishlist } from "@/redux/slices/wishlistSlice";
import { Heart, Truck, RotateCcw, Lock } from "lucide-react";
import { RootState } from "@/redux/store";
import NotFound from "./NotFound";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [p, setP] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductBySlug(slug || "");
        const data = res.data.data;
        setP(data.product);
        setRelated(data.related);
        if (data.product) {
          setColor(data.product.colors[0]);
          setSize(data.product.sizes[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return <PageShell><div className="flex h-[50vh] items-center justify-center">Loading...</div></PageShell>;
  }

  if (!p) {
    return <NotFound />;
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please sign in or sign up to add items to your cart.");
      navigate("/login");
      return;
    }

    // Retrieve stock limit for selected size
    const selectedSizeStock = p.sizeStock && p.sizeStock[size] !== undefined ? p.sizeStock[size] : p.stock;
    
    // Find if the item with the same color/size already exists in cart
    const existingItem = cartItems.find(
      (item) => item._id === p._id && item.color === color && item.size === size
    );
    const existingQuantity = existingItem ? existingItem.quantity : 0;

    if (existingQuantity + 1 > selectedSizeStock) {
      toast.error(`Cannot add more. You have ${existingQuantity} in your bag and only ${selectedSizeStock} are available in stock.`);
      return;
    }

    dispatch(addToCart({
      _id: p._id,
      slug: p.slug,
      name: p.name,
      price: p.salePrice && p.onSale ? p.salePrice : p.price,
      image: p.images?.[0]?.url || "",
      color,
      size,
      quantity: 1,
      stock: p.stock,
      sizeStock: p.sizeStock
    }));
    toast.success("Added to bag!");
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error("Please sign in or sign up to add items to your wishlist.");
      navigate("/login");
      return;
    }
    dispatch(addToWishlist(p));
    toast.success("Added to wishlist!");
  };

  return (
    <PageShell>
      <Helmet>
        <title>{p.name}</title>
        <meta name="description" content={p.description} />
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav className="text-xs text-muted-foreground tracking-wider uppercase mb-8">
          <Link to="/" className="hover:text-primary">Home</Link> / <span className="text-primary">{p.name}</span>
        </nav>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-secondary">
            {p.images && p.images[0]?.url ? (
              <img
                src={p.images[0].url}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const sibling = (e.target as HTMLElement).nextElementSibling;
                  if (sibling) (sibling as HTMLElement).style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${p.bg} text-primary-foreground/70 text-7xl font-serif`}
              style={{ display: p.images && p.images[0]?.url ? 'none' : 'flex' }}
            >
              ✦
            </div>
          </div>
          <div>
            <h1 className="font-serif text-4xl text-primary">{p.name}</h1>
            <div className="mt-3 text-xl flex items-center gap-4">
              <div className="flex text-rose items-center text-sm">
                {"★".repeat(Math.round(p.averageRating))}
                {"☆".repeat(5 - Math.round(p.averageRating))}
                <span className="text-muted-foreground ml-2">({p.reviewCount})</span>
              </div>
            </div>
            <div className="mt-3 text-xl">
              {p.onSale && p.salePrice ? (
                <><span className="text-rose font-medium">PKR {p.salePrice.toLocaleString()}</span> <span className="line-through ml-2 text-muted-foreground text-base">PKR {p.price.toLocaleString()}</span></>
              ) : (<>PKR {p.price.toLocaleString()}</>)}
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">{p.description}</p>
            <div className="mt-8">
              <div className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Color</div>
              <div className="flex gap-3">
                {p.colors.map((c: string) => (
                  <button
                    key={c}
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border ${color === c ? 'ring-2 ring-primary border-transparent' : 'border-border'} hover:ring-2 hover:ring-primary`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Size</div>
              <div className="flex gap-2 flex-wrap">
                {p.sizes.map((s: string) => {
                  const sizeStockVal = p.sizeStock && p.sizeStock[s] !== undefined ? p.sizeStock[s] : p.stock;
                  const sizeOos = sizeStockVal <= 0;
                  return (
                    <button
                      key={s}
                      disabled={sizeOos}
                      onClick={() => setSize(s)}
                      className={`h-10 w-12 border text-sm relative transition ${
                        size === s ? 'border-primary text-primary font-semibold ring-1 ring-primary' : 'border-border'
                      } ${sizeOos ? 'opacity-40 cursor-not-allowed bg-secondary/30 line-through' : 'hover:border-primary hover:text-primary'}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {size && (
                <div className="text-xs mt-2.5 font-medium transition-all duration-200">
                  {(() => {
                    const selectedSizeStock = p.sizeStock && p.sizeStock[size] !== undefined ? p.sizeStock[size] : p.stock;
                    return selectedSizeStock <= 0 ? (
                      <span className="text-rose uppercase tracking-wider text-[10px] font-semibold">Out of Stock</span>
                    ) : (
                      <span className="text-emerald-600 uppercase tracking-wider text-[10px] font-semibold">In stock ({selectedSizeStock} available)</span>
                    );
                  })()}
                </div>
              )}
              <Link to="/size-guide" className="text-xs text-primary underline mt-3 inline-block">View size guide</Link>
            </div>
            <div className="mt-8 flex gap-3">
              {(() => {
                const selectedSizeStock = p.sizeStock && p.sizeStock[size] !== undefined ? p.sizeStock[size] : p.stock;
                const isOutOfStock = selectedSizeStock <= 0;
                return (
                  <button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock}
                    className="flex-1 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                  </button>
                );
              })()}
              <button onClick={handleAddToWishlist} aria-label="Wishlist" className="h-12 w-12 border border-border flex items-center justify-center hover:border-primary"><Heart className="h-4 w-4" /></button>
            </div>
            <dl className="mt-8 border-t border-border pt-6 text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-muted-foreground">Fabric</dt><dd>{p.fabric}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Category</dt><dd className="capitalize">{p.category}</dd></div>
            </dl>
            <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" />Fast delivery</div>
              <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" />7-day returns</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />Secure checkout</div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-serif text-2xl text-primary text-center">You may also like</h2>
            <div className="h-px w-12 bg-rose mx-auto mt-3 mb-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((r) => <ProductCard key={r.slug} p={r} />)}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { addToWishlist, removeFromWishlist } from "../../redux/slices/wishlistSlice";
import { toast } from "sonner";
import type { Product } from "@/lib/products";

export function ProductCard({ p }: { p: any }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const isWishlisted = wishlistItems.some((item) => item.slug === p.slug);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in or sign up to add items to your wishlist.");
      navigate("/login");
      return;
    }
    if (isWishlisted) {
      const itemToRemove = wishlistItems.find((item) => item.slug === p.slug);
      if (itemToRemove) {
        dispatch(removeFromWishlist(itemToRemove._id));
        toast.success("Removed from wishlist");
      }
    } else {
      dispatch(addToWishlist(p));
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className="group">
      <Link to={`/product/${p.slug}`} className="block">
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-secondary">
          {p.images && p.images[0]?.url ? (
            <img 
              src={p.images[0].url} 
              alt={p.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const sibling = (e.target as HTMLElement).nextElementSibling;
                if (sibling) (sibling as HTMLElement).style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${p.bg} text-primary-foreground/80 text-5xl opacity-60 font-serif`}
            style={{ display: p.images && p.images[0]?.url ? 'none' : 'flex' }}
          >
            ✦
          </div>
          {p.isNew && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] tracking-widest px-2 py-1">NEW</span>
          )}
          {p.onSale && (
            <span className="absolute top-3 left-3 bg-rose text-primary-foreground text-[10px] tracking-widest px-2 py-1">SALE</span>
          )}
        </div>
      </Link>
      <div className="pt-4 flex items-start justify-between">
        <div>
          <Link to={`/product/${p.slug}`} className="text-sm font-medium hover:text-primary">{p.name}</Link>
          <div className="text-sm text-muted-foreground mt-1">
            {p.onSale && p.salePrice ? (
              <><span className="text-rose font-medium">PKR {p.salePrice.toLocaleString()}</span> <span className="line-through ml-1 opacity-60">PKR {p.price.toLocaleString()}</span></>
            ) : (
              <>PKR {p.price.toLocaleString()}</>
            )}
          </div>
          <div className="flex gap-1.5 mt-2">
            {p.colors.map((c: string) => <span key={c} className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c }} />)}
          </div>
        </div>
        <button 
          onClick={handleWishlistToggle}
          aria-label="Wishlist" 
          className={`hover:text-rose transition-colors ${isWishlisted ? "text-rose" : "text-muted-foreground"}`}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

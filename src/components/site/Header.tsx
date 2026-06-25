import { Link, NavLink } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getProducts } from "@/services/productService";

const nav = [
  { to: "/bras", label: "Bras" },
  { to: "/panties", label: "Panties" },
  { to: "/sets", label: "Sets" },
  { to: "/shapewear", label: "Shapewear" },
  { to: "/sleepwear", label: "Sleepwear" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/sale", label: "Sale" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await getProducts({ search: searchQuery });
        setSearchResults(res.data.data.products);
      } catch (err) {
        console.error(err);
      }
    };
    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="bg-primary text-primary-foreground text-[11px] tracking-wider">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <span className="uppercase">Free Delivery on Orders Over PKR 3,000</span>
          <div className="hidden md:flex items-center gap-5">
            <Link to="/track-order" className="hover:opacity-80">Track Order</Link>
            <Link to="/help" className="hover:opacity-80">Help</Link>
            <span className="opacity-80">PKR</span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between gap-6 relative">
        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex flex-col items-center leading-none">
          <span className="font-serif text-3xl tracking-[0.25em] text-primary">BEAUTYX</span>
          <span className="text-[10px] tracking-[0.4em] text-muted-foreground mt-1">INTIMATES</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[12px] tracking-widest uppercase">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `transition-colors ${isActive ? "text-primary font-medium" : "text-foreground/80 hover:text-primary"}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-rose hover:text-rose/85 text-[10px] font-semibold tracking-wider uppercase border border-rose/30 px-2.5 py-1 rounded-sm shrink-0">Admin</Link>
          )}
          <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hover:text-primary"><Search className="h-5 w-5" /></button>
          <Link to={user ? "/profile" : "/login"} aria-label="Account" className="hover:text-primary"><User className="h-5 w-5" /></Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-primary hidden md:block">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{wishlistCount}</span>
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative hover:text-primary">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-rose text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>
          </Link>
        </div>

        {searchOpen && (
          <div className="absolute inset-0 bg-background z-50 flex items-center px-4 md:px-8 border-b border-border">
            <div className="w-full flex items-center justify-between gap-4">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent py-4 text-sm md:text-base border-none outline-none placeholder:text-muted-foreground"
              />
              <button 
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider font-medium shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="absolute inset-x-0 top-full bg-background border-b border-border shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {searchQuery.trim() === "" ? (
              <p className="text-sm text-muted-foreground text-center py-4">Type to search products...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No products found matching "{searchQuery}"</p>
            ) : (
              <div className="space-y-4">
                <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Search Results ({searchResults.length})</div>
                <div className="grid gap-2">
                  {searchResults.map((p) => (
                    <Link 
                      key={p.slug} 
                      to={`/product/${p.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-center justify-between gap-4 group p-2 hover:bg-secondary rounded-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-10 bg-gradient-to-br ${p.bg} rounded-sm flex items-center justify-center font-serif text-[10px] text-primary-foreground/75 shrink-0`}>✦</div>
                        <div>
                          <div className="text-sm font-medium group-hover:text-primary transition">{p.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 capitalize">{p.category}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {p.onSale && p.salePrice ? (
                          <>PKR {p.salePrice.toLocaleString()}</>
                        ) : (
                          <>PKR {p.price.toLocaleString()}</>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-background">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-serif text-xl tracking-[0.25em] text-primary">BEAUTYX</span>
            <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex flex-col p-6 gap-5 text-sm tracking-widest uppercase">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="hover:text-primary">{n.label}</Link>
            ))}
            <Link to="/wishlist" onClick={() => setOpen(false)} className="hover:text-primary flex items-center justify-between">
              WISHLIST
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">{wishlistCount}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

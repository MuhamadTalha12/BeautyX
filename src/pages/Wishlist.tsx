import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  return (
    <PageShell>
      <Helmet><title>Wishlist</title></Helmet>
      <PageHero title="Wishlist" />
      <div className="mx-auto max-w-7xl px-4 py-14">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-primary">Your wishlist is empty</h2>
            <p className="text-muted-foreground mt-2">Save your favorite items here.</p>
            <Link to="/" className="inline-block mt-8 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">Shop Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {wishlistItems.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}

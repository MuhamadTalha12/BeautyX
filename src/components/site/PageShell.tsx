import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { getProducts } from "@/services/productService";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-secondary border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-primary">{title}</h1>
        {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}

export function CategoryPage({ title, subtitle, categorySlug }: { title: string; subtitle?: string; categorySlug: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        let params: any = {};
        if (categorySlug === "sale") params = { onSale: true };
        else if (categorySlug === "new-arrivals") params = { newArrival: true };
        else params = { category: categorySlug };

        const res = await getProducts(params);
        setProducts(res.data.data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categorySlug]);

  return (
    <PageShell>
      <PageHero title={title} subtitle={subtitle} />
      <section className="mx-auto max-w-7xl px-4 py-14">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}

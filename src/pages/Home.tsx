import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/components/site/ProductCard";
import { categories } from "@/lib/products";
import { getBestSellers } from "@/services/productService";
import { Leaf, Sparkles, Cloud, Truck, RotateCcw, Lock, Award } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

function Home() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getBestSellers();
        setBestsellers(res.data.data.products.slice(0, 5));
      } catch (error) {
        console.error("Failed to load products", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <PageShell>
      <Helmet><title>BeautyX</title>
        <meta name="description" content="Premium lingerie that celebrates you, in every moment. Shop bras, panties, sets, shapewear & sleepwear." /></Helmet>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 items-center gap-8 py-12 md:py-0 md:min-h-[78vh]">
          <div className="md:py-20">
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-6">Designed for comfort. Made for confidence.</p>
            <h1 className="font-serif text-5xl md:text-7xl text-primary leading-[1.05]">Feel Beautiful<br />Everyday</h1>
            <p className="mt-6 text-muted-foreground max-w-md">Premium lingerie that celebrates you, in every moment.</p>
            <Link to="/new-arrivals" className="inline-block mt-8 bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 transition">Shop Now</Link>
            <div className="mt-12 flex flex-wrap gap-8 text-xs tracking-wider text-muted-foreground">
              <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-rose" />PREMIUM FABRICS</span>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-rose" />PERFECT FIT</span>
              <span className="flex items-center gap-2"><Cloud className="h-4 w-4 text-rose" />ALL DAY COMFORT</span>
            </div>
          </div>
          <div className="relative h-[420px] md:h-full">
            <img src={heroImg} alt="BeautyX lingerie collection" width={1600} height={1100} className="absolute inset-0 h-full w-full object-cover rounded-sm" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-primary">SHOP BY CATEGORY</h2>
          <div className="h-px w-12 bg-rose mx-auto mt-3" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/${cat.slug}`} className="group text-center">
              <div className={`aspect-square rounded-full bg-gradient-to-br ${cat.bg} flex items-center justify-center text-primary-foreground/80 font-serif text-4xl group-hover:scale-105 transition`}>✦</div>
              <div className="mt-4 text-sm tracking-[0.2em] uppercase">{cat.label}</div>
              <div className="text-[11px] tracking-[0.2em] text-muted-foreground mt-1">SHOP NOW</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-primary">BEST SELLERS</h2>
          <div className="h-px w-12 bg-rose mx-auto mt-3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {bestsellers.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
        <div className="text-center mt-12">
          <Link to="/new-arrivals" className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">View All Products</Link>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "FAST DELIVERY", desc: "Delivery all over Pakistan" },
            { icon: RotateCcw, title: "EASY RETURNS", desc: "Hassle-free returns within 7 days" },
            { icon: Lock, title: "SECURE PAYMENTS", desc: "100% safe & secure checkout" },
            { icon: Award, title: "PREMIUM QUALITY", desc: "Carefully selected for you" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <Icon className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div className="text-xs tracking-[0.2em] text-primary">{title}</div>
                <div className="text-sm text-muted-foreground mt-1">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default Home;

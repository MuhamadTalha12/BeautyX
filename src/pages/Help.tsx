import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PageShell, PageHero } from "@/components/site/PageShell";

const topics = [
  ["Shipping & delivery", "/shipping-policy"],
  ["Returns & exchanges", "/returns-exchanges"],
  ["Sizing & fit", "/size-guide"],
  ["Payments", "/faqs"],
  ["Order tracking", "/track-order"],
  ["Contact a human", "/contact"],
] as const;


export default function Help() {
  return (
    <>
      <Helmet><title>Help Center</title></Helmet>

    <PageShell>
      <PageHero title="Help Center" subtitle="How can we help you today?" />
      <div className="mx-auto max-w-4xl px-4 py-16 grid sm:grid-cols-2 gap-4">
        {topics.map(([label, to]) => (
          <Link key={to} to={to} className="border border-border p-6 hover:border-primary hover:bg-secondary transition">
            <div className="font-serif text-lg text-primary">{label}</div>
            <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">Learn more →</div>
          </Link>
        ))}
      </div>
    </PageShell>

    </>
  );
}


import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";


export default function ReturnsExchanges() {
  return (
    <>
      <Helmet><title>Returns & Exchanges</title></Helmet>

    <PageShell>
      <PageHero title="Returns & Exchanges" subtitle="Easy returns within 7 days of delivery." />
      <article className="mx-auto max-w-3xl px-4 py-16 space-y-6 text-muted-foreground leading-relaxed">
        <p>We want you to love what you wear. If something isn't quite right, you can return or exchange unworn items with original tags within 7 days of delivery.</p>
        <h2 className="font-serif text-2xl text-primary">How to return</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Email <a href="mailto:returns@beautyx.com" className="text-primary underline">returns@beautyx.com</a> with your order number.</li>
          <li>We'll share a return slip and pickup instructions within 24 hours.</li>
          <li>Refunds are processed within 5-7 business days after we receive the item.</li>
        </ol>
        <h2 className="font-serif text-2xl text-primary">What can't be returned</h2>
        <p>For hygiene reasons, panties and final-sale items cannot be returned or exchanged.</p>
      </article>
    </PageShell>

    </>
  );
}


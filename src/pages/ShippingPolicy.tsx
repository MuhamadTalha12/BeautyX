import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";


export default function ShippingPolicy() {
  return (
    <>
      <Helmet><title>Shipping Policy</title></Helmet>

    <PageShell>
      <PageHero title="Shipping Policy" />
      <article className="mx-auto max-w-3xl px-4 py-16 space-y-4 text-muted-foreground leading-relaxed">
        <p>We deliver across Pakistan within 3-5 business days. Orders over PKR 3,000 ship free.</p>
        <p>Standard delivery fee is PKR 200. Same-day delivery is available within Lahore for orders placed before 12 PM.</p>
        <p>You'll receive tracking details by SMS and email as soon as your order ships.</p>
      </article>
    </PageShell>

    </>
  );
}


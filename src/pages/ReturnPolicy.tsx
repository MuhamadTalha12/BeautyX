import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";


export default function ReturnPolicy() {
  return (
    <>
      <Helmet><title>Return Policy</title></Helmet>

    <PageShell>
      <PageHero title="Return Policy" />
      <article className="mx-auto max-w-3xl px-4 py-16 space-y-4 text-muted-foreground leading-relaxed">
        <p>Unworn items with original tags can be returned within 7 days of delivery for a full refund or exchange.</p>
        <p>For hygiene reasons, panties and final-sale items are non-returnable.</p>
        <p>Refunds are issued to the original payment method within 5-7 business days of receipt.</p>
      </article>
    </PageShell>

    </>
  );
}


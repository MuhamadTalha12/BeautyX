import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";


export default function PrivacyPolicy() {
  return (
    <>
      <Helmet><title>Privacy Policy</title></Helmet>

    <PageShell>
      <PageHero title="Privacy Policy" />
      <article className="mx-auto max-w-3xl px-4 py-16 space-y-4 text-muted-foreground leading-relaxed">
        <p>We collect only the information needed to process your order and improve your shopping experience — name, contact details, address, and payment information.</p>
        <p>We never sell your data. Information is shared only with trusted partners (couriers, payment processors) to fulfill your order.</p>
        <p>You may request access, correction, or deletion of your data at any time by emailing hello@beautyx.com.</p>
      </article>
    </PageShell>

    </>
  );
}


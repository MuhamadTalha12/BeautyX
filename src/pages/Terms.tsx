import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";


export default function Terms() {
  return (
    <>
      <Helmet><title>Terms & Conditions</title></Helmet>

    <PageShell>
      <PageHero title="Terms & Conditions" />
      <article className="mx-auto max-w-3xl px-4 py-16 space-y-4 text-muted-foreground leading-relaxed">
        <p>By placing an order on BeautyX you agree to our terms of sale, including pricing, delivery, returns, and acceptable use of this website.</p>
        <p>Prices are listed in Pakistani Rupees (PKR) and include applicable taxes. We reserve the right to change pricing without prior notice.</p>
        <p>All content, designs, and trademarks on this site are property of BeautyX Intimates and may not be reproduced without permission.</p>
      </article>
    </PageShell>

    </>
  );
}


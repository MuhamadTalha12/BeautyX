import { Helmet } from "react-helmet-async";

import { CategoryPage } from "@/components/site/PageShell";


export default function Panties() {
  return (
    <>
      <Helmet><title>Panties</title>
        <meta name="description" content="Briefs, thongs and everyday essentials in soft premium fabrics." /></Helmet>
      <CategoryPage title="Panties" subtitle="Soft, seamless and made to move with you." categorySlug="panties" />
    </>
  );
}

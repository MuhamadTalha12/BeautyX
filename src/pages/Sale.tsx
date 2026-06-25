import { Helmet } from "react-helmet-async";
import { CategoryPage } from "@/components/site/PageShell";

export default function Sale() {
  return (
    <>
      <Helmet><title>Sale</title>
        <meta name="description" content="Premium lingerie on sale for a limited time." /></Helmet>
      <CategoryPage title="Sale" subtitle="Premium quality at beautiful prices." categorySlug="sale" />
    </>
  );
}

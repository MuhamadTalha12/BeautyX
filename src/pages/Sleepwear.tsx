import { Helmet } from "react-helmet-async";
import { CategoryPage } from "@/components/site/PageShell";

export default function Sleepwear() {
  return (
    <>
      <Helmet><title>Sleepwear</title>
        <meta name="description" content="Satin robes, chemises and pajama sets for elegant lounging." /></Helmet>
      <CategoryPage title="Sleepwear" subtitle="Lounge elegantly in premium satin and soft lace." categorySlug="sleepwear" />
    </>
  );
}

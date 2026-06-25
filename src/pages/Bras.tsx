import { Helmet } from "react-helmet-async";
import { CategoryPage } from "@/components/site/PageShell";

export default function Bras() {
  return (
    <>
      <Helmet><title>Bras</title>
        <meta name="description" content="Bralettes, t-shirt bras, push-ups and more — premium fit & comfort." /></Helmet>
      <CategoryPage title="Bras" subtitle="From everyday t-shirt bras to delicate bralettes — find your perfect fit." categorySlug="bras" />
    </>
  );
}

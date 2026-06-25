import { Helmet } from "react-helmet-async";

import { CategoryPage } from "@/components/site/PageShell";


export default function Sets() {
  return (
    <>
      <Helmet><title>Matching Sets</title></Helmet>
      <CategoryPage title="Matching Sets" subtitle="Perfectly paired for a flawless look." categorySlug="sets" />
    </>
  );
}

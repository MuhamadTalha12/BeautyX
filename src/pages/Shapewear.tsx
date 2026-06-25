import { Helmet } from "react-helmet-async";

import { CategoryPage } from "@/components/site/PageShell";


export default function Shapewear() {
  return (
    <>
      <Helmet><title>Shapewear</title>
        <meta name="description" content="Smoothing shapewear that sculpts without squeezing." /></Helmet>
      <CategoryPage title="Shapewear" subtitle="Smooth, sculpt, and support." categorySlug="shapewear" />
    </>
  );
}

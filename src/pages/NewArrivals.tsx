import { Helmet } from "react-helmet-async";
import { CategoryPage } from "@/components/site/PageShell";

export default function NewArrivals() {
  return (
    <>
      <Helmet><title>New Arrivals</title>
        <meta name="description" content="Discover our latest premium lingerie collections." /></Helmet>
      <CategoryPage title="New Arrivals" subtitle="The latest additions to our collection." categorySlug="new-arrivals" />
    </>
  );
}

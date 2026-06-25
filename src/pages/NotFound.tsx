import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/site/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <Helmet>
        <title>Not Found</title>
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl text-primary">Page not found</h1>
        <Link to="/" className="inline-block mt-6 underline text-primary">Back to home</Link>
      </div>
    </PageShell>
  );
}

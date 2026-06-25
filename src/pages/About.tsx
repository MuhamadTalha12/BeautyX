import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";


export default function About() {
  return (
    <>
      <Helmet><title>About</title></Helmet>

    <PageShell>
      <PageHero title="About BeautyX" subtitle="Designed for comfort. Made for confidence." />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted-foreground leading-relaxed">BeautyX is a premium intimates brand built around one simple idea: every woman deserves to feel beautiful — every single day. From the first sketch to the final stitch, every piece is designed with intention, made from premium fabrics, and engineered for a perfect fit.</p>
        <h2 className="font-serif text-2xl text-primary mt-10">Our promise</h2>
        <p className="text-muted-foreground leading-relaxed mt-3">Premium fabrics, considered design, and honest pricing. No compromises on comfort, no shortcuts on quality.</p>
        <h2 className="font-serif text-2xl text-primary mt-10">Crafted with care</h2>
        <p className="text-muted-foreground leading-relaxed mt-3">Our small studio works with experienced makers across Pakistan to bring every collection to life — slowly, thoughtfully, and beautifully.</p>
      </article>
    </PageShell>

    </>
  );
}


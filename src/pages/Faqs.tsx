import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";

const faqs = [
  ["How do I find my size?", "Use our Size Guide to measure your bust, waist and hips. If you're between sizes, we recommend sizing up."],
  ["When will my order ship?", "Most orders ship within 24 hours. Delivery across Pakistan takes 3-5 business days."],
  ["What's your return policy?", "Unworn items can be returned within 7 days. Panties and final-sale items are non-returnable for hygiene."],
  ["Do you ship internationally?", "Currently we ship only within Pakistan. International shipping is coming soon."],
  ["What payment methods do you accept?", "Visa, Mastercard, Apple Pay, EasyPaisa, and cash on delivery."],
];


export default function Faqs() {
  return (
    <>
      <Helmet><title>FAQs</title></Helmet>

    <PageShell>
      <PageHero title="Frequently Asked Questions" />
      <div className="mx-auto max-w-3xl px-4 py-16 space-y-4">
        {faqs.map(([q, a]) => (
          <details key={q} className="border border-border p-5 group">
            <summary className="cursor-pointer font-medium text-primary list-none flex justify-between items-center">{q}<span className="text-rose group-open:rotate-45 transition">+</span></summary>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </PageShell>

    </>
  );
}


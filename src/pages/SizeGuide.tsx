import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";

const sizes = [
  ["XS", "30 / 32A-B", "24-26", "33-35"],
  ["S", "32 / 34B-C", "26-28", "35-37"],
  ["M", "34 / 36B-C", "28-30", "37-39"],
  ["L", "36 / 38C-D", "30-32", "39-41"],
  ["XL", "38 / 40D-DD", "32-34", "41-43"],
];


export default function SizeGuide() {
  return (
    <>
      <Helmet><title>Size Guide</title></Helmet>

    <PageShell>
      <PageHero title="Size Guide" subtitle="Find your perfect fit. Measurements are in inches." />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <table className="w-full text-sm border border-border">
          <thead className="bg-secondary text-primary">
            <tr><th className="text-left p-3">Size</th><th className="text-left p-3">Bra</th><th className="text-left p-3">Waist</th><th className="text-left p-3">Hips</th></tr>
          </thead>
          <tbody>
            {sizes.map((row) => (
              <tr key={row[0]} className="border-t border-border">
                {row.map((c, i) => <td key={i} className="p-3">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-sm text-muted-foreground">Measure snugly, not tight. If you're between sizes, we recommend sizing up for comfort.</p>
      </div>
    </PageShell>

    </>
  );
}


export type Product = {
  slug: string;
  name: string;
  price: number;
  category: "bras" | "panties" | "sets" | "shapewear" | "sleepwear";
  isNew?: boolean;
  onSale?: boolean;
  salePrice?: number;
  colors: string[];
  description: string;
  fabric: string;
  bg: string; // tailwind bg class for placeholder tile
};

const c = {
  mauve: "#9b6a72",
  blush: "#e8c5c0",
  nude: "#d8b89c",
  rose: "#c9818c",
  cream: "#f0e2d6",
  black: "#1a1a1a",
};

export const products: Product[] = [
  { slug: "lace-whisper-set", name: "Lace Whisper Set", price: 2299, category: "sets", isNew: true,
    colors: [c.mauve, c.nude, c.black], description: "A delicate two-piece set in floral lace with a soft scalloped trim.",
    fabric: "Nylon-spandex lace blend", bg: "from-[#b88a8f] to-[#8a5a62]" },
  { slug: "silk-smooth-brief", name: "Silk Smooth Brief", price: 699, category: "panties",
    colors: [c.mauve, c.cream, c.black], description: "Seamless silk-touch brief with a no-show edge for everyday wear.",
    fabric: "Modal-silk blend", bg: "from-[#a06770] to-[#7a4c54]" },
  { slug: "seamless-tshirt-bra", name: "Seamless T-Shirt Bra", price: 1899, category: "bras", isNew: true,
    colors: [c.blush, c.nude, c.black], description: "Ultra-smooth memory foam cups that disappear under any tee.",
    fabric: "Microfiber jersey", bg: "from-[#f2d2cc] to-[#d9a8a0]" },
  { slug: "floral-lace-bralette", name: "Floral Lace Bralette", price: 1699, category: "bras",
    colors: [c.mauve, c.black], description: "A wireless bralette in airy floral lace with adjustable straps.",
    fabric: "Stretch lace", bg: "from-[#9b6a72] to-[#6e4750]" },
  { slug: "sculpt-shapewear", name: "Sculpt Shapewear", price: 2499, category: "shapewear",
    colors: [c.nude, c.cream, c.black], description: "Mid-waist sculpting bodysuit that smooths without squeezing.",
    fabric: "Power-mesh nylon", bg: "from-[#e0c2a8] to-[#b8956f]" },
  { slug: "silk-robe", name: "Aurora Silk Robe", price: 3299, category: "sleepwear", isNew: true,
    colors: [c.rose, c.cream], description: "A flowing satin robe with tie waist — your weekend morning, elevated.",
    fabric: "Charmeuse satin", bg: "from-[#d99aa6] to-[#a86573]" },
  { slug: "cotton-everyday-brief", name: "Cotton Everyday Brief", price: 549, category: "panties", onSale: true, salePrice: 399,
    colors: [c.cream, c.nude, c.black], description: "Breathable pima cotton brief built for all-day comfort.",
    fabric: "Pima cotton", bg: "from-[#ecdcc8] to-[#c4a888]" },
  { slug: "demi-push-up", name: "Demi Push-Up Bra", price: 2099, category: "bras",
    colors: [c.blush, c.mauve, c.black], description: "A flattering demi cup with subtle lift and natural shape.",
    fabric: "Mesh & microfiber", bg: "from-[#e8b8b8] to-[#b07a82]" },
  { slug: "lace-thong", name: "Sheer Lace Thong", price: 599, category: "panties",
    colors: [c.mauve, c.black, c.cream], description: "Delicate sheer lace with a flattering low-rise cut.",
    fabric: "Stretch lace", bg: "from-[#a87680] to-[#7a4f59]" },
  { slug: "satin-pajama-set", name: "Satin Pajama Set", price: 2899, category: "sleepwear",
    colors: [c.rose, c.cream, c.black], description: "Long-sleeve satin pajama set with piped trim.",
    fabric: "Charmeuse satin", bg: "from-[#c98a96] to-[#945862]" },
  { slug: "high-waist-shaper", name: "High-Waist Shaper", price: 1999, category: "shapewear", onSale: true, salePrice: 1499,
    colors: [c.nude, c.black], description: "Tummy-control shaper with bonded edges for a seamless finish.",
    fabric: "Power-mesh", bg: "from-[#d8b89c] to-[#a8855f]" },
  { slug: "balconette-set", name: "Velvet Balconette Set", price: 3499, category: "sets",
    colors: [c.mauve, c.black], description: "Velvet-trimmed balconette bra with matching brief.",
    fabric: "Velvet & lace", bg: "from-[#7a4750] to-[#4a2a30]" },
];

export const categories = [
  { slug: "bras", label: "Bras", bg: "from-[#b88a8f] to-[#8a5a62]" },
  { slug: "panties", label: "Panties", bg: "from-[#a06770] to-[#7a4c54]" },
  { slug: "sets", label: "Sets", bg: "from-[#9b6a72] to-[#6e4750]" },
  { slug: "shapewear", label: "Shapewear", bg: "from-[#e0c2a8] to-[#b8956f]" },
  { slug: "sleepwear", label: "Sleepwear", bg: "from-[#d99aa6] to-[#a86573]" },
  { slug: "sale", label: "Sale", bg: "from-[#6e4750] to-[#3a2228]" },
] as const;

export function getProductsByCategory(slug: string) {
  if (slug === "sale") return products.filter((p) => p.onSale);
  if (slug === "new-arrivals") return products.filter((p) => p.isNew);
  return products.filter((p) => p.category === slug);
}

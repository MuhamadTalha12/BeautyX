import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const defaultImg = 'https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&q=80&w=600';

const c = {
  mauve: "#9b6a72",
  blush: "#e8c5c0",
  nude: "#d8b89c",
  rose: "#c9818c",
  cream: "#f0e2d6",
  black: "#1a1a1a",
};

const products = [
  {
    name: 'Lace Whisper Set',
    slug: 'lace-whisper-set',
    price: 2299,
    discountPrice: null,
    salePrice: null,
    category: 'sets',
    onSale: false,
    colors: [c.mauve, c.nude, c.black],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A delicate two-piece set in floral lace with a soft scalloped trim.',
    fabric: 'Nylon-spandex lace blend',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.5,
    reviewCount: 12,
    stock: 50,
    bestSeller: false,
    featured: true,
    newArrival: true,
    bg: "from-[#b88a8f] to-[#8a5a62]"
  },
  {
    name: 'Silk Smooth Brief',
    slug: 'silk-smooth-brief',
    price: 699,
    discountPrice: null,
    salePrice: null,
    category: 'panties',
    onSale: false,
    colors: [c.mauve, c.cream, c.black],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Seamless silk-touch brief with a no-show edge for everyday wear.',
    fabric: 'Modal-silk blend',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.8,
    reviewCount: 24,
    stock: 100,
    bestSeller: true,
    featured: false,
    newArrival: false,
    bg: "from-[#a06770] to-[#7a4c54]"
  },
  {
    name: 'Seamless T-Shirt Bra',
    slug: 'seamless-tshirt-bra',
    price: 1899,
    discountPrice: null,
    salePrice: null,
    category: 'bras',
    onSale: false,
    colors: [c.blush, c.nude, c.black],
    sizes: ['32A', '32B', '34B', '34C', '36C', '38D'],
    description: 'Ultra-smooth memory foam cups that disappear under any tee.',
    fabric: 'Microfiber jersey',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.9,
    reviewCount: 156,
    stock: 200,
    bestSeller: true,
    featured: true,
    newArrival: true,
    bg: "from-[#f2d2cc] to-[#d9a8a0]"
  },
  {
    name: 'Floral Lace Bralette',
    slug: 'floral-lace-bralette',
    price: 1699,
    discountPrice: null,
    salePrice: null,
    category: 'bras',
    onSale: false,
    colors: [c.mauve, c.black],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A wireless bralette in airy floral lace with adjustable straps.',
    fabric: 'Stretch lace',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.6,
    reviewCount: 45,
    stock: 80,
    bestSeller: false,
    featured: false,
    newArrival: false,
    bg: "from-[#9b6a72] to-[#6e4750]"
  },
  {
    name: 'Sculpt Shapewear',
    slug: 'sculpt-shapewear',
    price: 2499,
    discountPrice: null,
    salePrice: null,
    category: 'shapewear',
    onSale: false,
    colors: [c.nude, c.cream, c.black],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Mid-waist sculpting bodysuit that smooths without squeezing.',
    fabric: 'Power-mesh nylon',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.4,
    reviewCount: 89,
    stock: 150,
    bestSeller: true,
    featured: true,
    newArrival: false,
    bg: "from-[#e0c2a8] to-[#b8956f]"
  },
  {
    name: 'Aurora Silk Robe',
    slug: 'silk-robe',
    price: 3299,
    discountPrice: null,
    salePrice: null,
    category: 'sleepwear',
    onSale: false,
    colors: [c.rose, c.cream],
    sizes: ['One Size'],
    description: 'A flowing satin robe with tie waist — your weekend morning, elevated.',
    fabric: 'Charmeuse satin',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 5.0,
    reviewCount: 18,
    stock: 30,
    bestSeller: false,
    featured: true,
    newArrival: true,
    bg: "from-[#d99aa6] to-[#a86573]"
  },
  {
    name: 'Cotton Everyday Brief',
    slug: 'cotton-everyday-brief',
    price: 549,
    discountPrice: 399,
    salePrice: 399,
    category: 'panties',
    onSale: true,
    colors: [c.cream, c.nude, c.black],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Breathable pima cotton brief built for all-day comfort.',
    fabric: 'Pima cotton',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.7,
    reviewCount: 210,
    stock: 500,
    bestSeller: true,
    featured: false,
    newArrival: false,
    bg: "from-[#ecdcc8] to-[#c4a888]"
  },
  {
    name: 'Demi Push-Up Bra',
    slug: 'demi-push-up',
    price: 2099,
    discountPrice: null,
    salePrice: null,
    category: 'bras',
    onSale: false,
    colors: [c.blush, c.mauve, c.black],
    sizes: ['32B', '32C', '34B', '34C', '36B', '36C'],
    description: 'A flattering demi cup with subtle lift and natural shape.',
    fabric: 'Mesh & microfiber',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.5,
    reviewCount: 67,
    stock: 120,
    bestSeller: false,
    featured: false,
    newArrival: false,
    bg: "from-[#e8b8b8] to-[#b07a82]"
  },
  {
    name: 'Sheer Lace Thong',
    slug: 'lace-thong',
    price: 599,
    discountPrice: null,
    salePrice: null,
    category: 'panties',
    onSale: false,
    colors: [c.mauve, c.black, c.cream],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Delicate sheer lace with a flattering low-rise cut.',
    fabric: 'Stretch lace',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.8,
    reviewCount: 134,
    stock: 250,
    bestSeller: true,
    featured: false,
    newArrival: false,
    bg: "from-[#a87680] to-[#7a4f59]"
  },
  {
    name: 'Satin Pajama Set',
    slug: 'satin-pajama-set',
    price: 2899,
    discountPrice: null,
    salePrice: null,
    category: 'sleepwear',
    onSale: false,
    colors: [c.rose, c.cream, c.black],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Long-sleeve satin pajama set with piped trim.',
    fabric: 'Charmeuse satin',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.9,
    reviewCount: 56,
    stock: 60,
    bestSeller: false,
    featured: true,
    newArrival: false,
    bg: "from-[#c98a96] to-[#945862]"
  },
  {
    name: 'High-Waist Shaper',
    slug: 'high-waist-shaper',
    price: 1999,
    discountPrice: 1499,
    salePrice: 1499,
    category: 'shapewear',
    onSale: true,
    colors: [c.nude, c.black],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Tummy-control shaper with bonded edges for a seamless finish.',
    fabric: 'Power-mesh',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.6,
    reviewCount: 112,
    stock: 140,
    bestSeller: true,
    featured: false,
    newArrival: false,
    bg: "from-[#d8b89c] to-[#a8855f]"
  },
  {
    name: 'Velvet Balconette Set',
    slug: 'balconette-set',
    price: 3499,
    discountPrice: null,
    salePrice: null,
    category: 'sets',
    onSale: false,
    colors: [c.mauve, c.black],
    sizes: ['S', 'M', 'L'],
    description: 'Velvet-trimmed balconette bra with matching brief.',
    fabric: 'Velvet & lace',
    images: [{ url: defaultImg, publicId: '' }],
    averageRating: 4.7,
    reviewCount: 22,
    stock: 45,
    bestSeller: false,
    featured: true,
    newArrival: false,
    bg: "from-[#7a4750] to-[#4a2a30]"
  }
];

const seedDB = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    console.log('Cleared existing products...');

    // Add dynamic sizeStock map to all seeded products
    const productsWithStocks = products.map(p => {
      const sizeStock = {};
      if (p.sizes && p.sizes.length > 0) {
        const baseStock = Math.floor(p.stock / p.sizes.length);
        const remainder = p.stock % p.sizes.length;
        p.sizes.forEach((sz, idx) => {
          sizeStock[sz] = baseStock + (idx === 0 ? remainder : 0);
        });
      }
      return { ...p, sizeStock };
    });

    // Seed products
    await Product.insertMany(productsWithStocks);
    console.log('Seeded products successfully!');

    // Seed Admin User
    const adminEmail = 'admin@beautyx.com';
    await User.deleteMany({ email: adminEmail });
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'Admin1234',
      role: 'admin',
      isVerified: true
    });
    console.log('Seeded admin user successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Connect db then run
connectDB().then(() => {
  seedDB();
});

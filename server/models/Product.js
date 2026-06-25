import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price']
  },
  discountPrice: {
    type: Number,
    default: null
  },
  salePrice: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['bras', 'panties', 'sets', 'shapewear', 'sleepwear']
  },
  onSale: {
    type: Boolean,
    default: false
  },
  colors: {
    type: [String],
    required: true
  },
  sizes: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  fabric: {
    type: String,
    required: [true, 'Please add fabric description']
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  sizeStock: {
    type: Map,
    of: Number,
    default: {}
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  bg: {
    type: String,
    required: true,
    description: 'Tailwind gradient classes for placeholder background'
  }
}, {
  timestamps: true
});

ProductSchema.pre('save', function(next) {
  if (this.sizeStock) {
    let totalStock = 0;
    if (this.sizeStock instanceof Map) {
      this.sizeStock.forEach((value) => {
        totalStock += Number(value) || 0;
      });
    } else if (typeof this.sizeStock === 'object') {
      Object.values(this.sizeStock).forEach((value) => {
        totalStock += Number(value) || 0;
      });
    }
    this.stock = totalStock;
  }
  next();
});

export default mongoose.model('Product', ProductSchema);

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  }
}, {
  timestamps: true
});

// Calculate average product rating on review changes
ReviewSchema.statics.getAverageRating = async function(productId) {
  const obj = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10,
        reviewCount: obj[0].reviewCount
      });
    } else {
      await this.model('Product').findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before delete
ReviewSchema.pre('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.getAverageRating(this.product);
});

export default mongoose.model('Review', ReviewSchema);

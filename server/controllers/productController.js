import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

// @desc    Get all products (with filtering, search, and pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, bestSeller, newArrival, onSale, page, limit } = req.query;

    const query = {};

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Search Query (Name)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by Flags
    if (featured === 'true') query.featured = true;
    if (bestSeller === 'true') query.bestSeller = true;
    if (newArrival === 'true') query.newArrival = true;
    if (onSale === 'true') query.onSale = true;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalProducts / limitNum);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          totalProducts,
          currentPage: pageNum,
          totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Fetch related products (same category, excluding this one)
    const related = await Product.find({
      category: product.category,
      slug: { $ne: product.slug }
    }).limit(4);

    res.json({
      success: true,
      data: {
        product,
        related
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      price,
      discountPrice,
      salePrice,
      category,
      onSale,
      colors,
      sizes,
      description,
      fabric,
      images,
      stock,
      bestSeller,
      featured,
      newArrival,
      bg
    } = req.body;

    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      res.status(400);
      throw new Error('Product slug already exists');
    }

    const product = await Product.create({
      name,
      slug,
      price,
      discountPrice,
      salePrice,
      category,
      onSale,
      colors,
      sizes,
      description,
      fabric,
      images,
      stock,
      bestSeller,
      featured,
      newArrival,
      bg
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed the product
    const alreadyReviewed = await Review.findOne({
      product: req.params.id,
      user: req.user._id
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed by you');
    }

    // Check if user has a delivered order for this product
    const hasDeliveredOrder = await Order.findOne({
      user: req.user._id,
      orderStatus: 'delivered',
      'items.product': req.params.id
    });

    if (!hasDeliveredOrder) {
      res.status(400);
      throw new Error('You can only review products you have purchased and that have been delivered.');
    }

    const review = await Review.create({
      product: req.params.id,
      user: req.user._id,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    next(error);
  }
};

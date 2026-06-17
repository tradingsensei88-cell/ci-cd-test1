import { productService } from '../services/dbService.js';

// @desc    Get all products (with search, filters, sort)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, minPrice, maxPrice, rating, sort } = req.query;
    const products = await productService.findAll({
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      price,
      discountPrice,
      images,
      specifications,
      countInStock,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.body;

    if (!name || !description || !brand || !category || price === undefined || !images || !specifications) {
      res.status(400);
      throw new Error('Please enter all required fields');
    }

    const product = await productService.create({
      name,
      description,
      brand,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      images,
      specifications: typeof specifications === 'string' ? JSON.parse(specifications) : specifications,
      countInStock: countInStock ? Number(countInStock) : 0,
      isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller,
      isNewArrival: !!isNewArrival,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      price,
      discountPrice,
      images,
      specifications,
      countInStock,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.body;

    const product = await productService.findById(req.params.id);

    if (product) {
      const updateData = {
        name: name || product.name,
        description: description || product.description,
        brand: brand || product.brand,
        category: category || product.category,
        price: price !== undefined ? Number(price) : product.price,
        discountPrice: discountPrice !== undefined ? Number(discountPrice) : product.discountPrice,
        images: images || product.images,
        specifications: specifications
          ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications)
          : product.specifications,
        countInStock: countInStock !== undefined ? Number(countInStock) : product.countInStock,
        isFeatured: isFeatured !== undefined ? !!isFeatured : product.isFeatured,
        isBestSeller: isBestSeller !== undefined ? !!isBestSeller : product.isBestSeller,
        isNewArrival: isNewArrival !== undefined ? !!isNewArrival : product.isNewArrival,
      };

      const updatedProduct = await productService.update(req.params.id, updateData);
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const success = await productService.delete(req.params.id);
    if (success) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (rating === undefined || !comment) {
      res.status(400);
      throw new Error('Please provide a rating and comment');
    }

    const product = await productService.findById(req.params.id);

    if (product) {
      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
      }

      const updatedProduct = await productService.addReview(req.params.id, {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      });

      res.status(201).json({ message: 'Review added', product: updatedProduct });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

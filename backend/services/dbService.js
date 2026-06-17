import { useLocalJson } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import { readJsonFile, writeJsonFile } from './jsonDb.js';

// Helper to generate string IDs for JSON database
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ==========================================
// USER SERVICE
// ==========================================
export const userService = {
  findById: async (id) => {
    if (useLocalJson) {
      const users = readJsonFile('users');
      const user = users.find(u => u._id === id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return { ...userWithoutPassword, _id: id };
      }
      return null;
    }
    return await User.findById(id).select('-password');
  },

  findByEmail: async (email) => {
    if (useLocalJson) {
      const users = readJsonFile('users');
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    return await User.findOne({ email });
  },

  create: async (userData) => {
    if (useLocalJson) {
      const users = readJsonFile('users');
      const newUser = {
        _id: generateId(),
        ...userData,
        isAdmin: userData.isAdmin || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJsonFile('users', users);
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }
    const user = await User.create(userData);
    return await User.findById(user._id).select('-password');
  },

  update: async (id, updateData) => {
    if (useLocalJson) {
      const users = readJsonFile('users');
      const index = users.findIndex(u => u._id === id);
      if (index === -1) return null;
      users[index] = {
        ...users[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJsonFile('users', users);
      const { password, ...userWithoutPassword } = users[index];
      return userWithoutPassword;
    }
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  },

  findAll: async () => {
    if (useLocalJson) {
      const users = readJsonFile('users');
      return users.map(({ password, ...u }) => u);
    }
    return await User.find({}).select('-password');
  }
};

// ==========================================
// PRODUCT SERVICE
// ==========================================
export const productService = {
  findAll: async ({ search, category, brand, minPrice, maxPrice, rating, sort }) => {
    if (useLocalJson) {
      let products = readJsonFile('products');

      // Filters
      if (search) {
        const query = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
        );
      }
      if (category && category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (brand && brand !== 'All') {
        products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }
      if (minPrice !== undefined) {
        products = products.filter(p => (p.discountPrice || p.price) >= parseFloat(minPrice));
      }
      if (maxPrice !== undefined) {
        products = products.filter(p => (p.discountPrice || p.price) <= parseFloat(maxPrice));
      }
      if (rating !== undefined) {
        products = products.filter(p => p.rating >= parseFloat(rating));
      }

      // Sort
      if (sort) {
        if (sort === 'price_asc') {
          products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sort === 'price_desc') {
          products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sort === 'rating') {
          products.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'newest') {
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      }
      return products;
    }

    // MongoDB Mongoose query builder
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }
    if (brand && brand !== 'All') {
      filter.brand = { $regex: `^${brand}$`, $options: 'i' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.$expr = {
        $and: [
          minPrice !== undefined ? { $gte: [{ $cond: [{ $gt: ['$discountPrice', 0] }, '$discountPrice', '$price'] }, parseFloat(minPrice)] } : {},
          maxPrice !== undefined ? { $lte: [{ $cond: [{ $gt: ['$discountPrice', 0] }, '$discountPrice', '$price'] }, parseFloat(maxPrice)] } : {}
        ].filter(obj => Object.keys(obj).length > 0)
      };
      if (filter.$expr.$and.length === 0) delete filter.$expr;
    }
    if (rating !== undefined) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    let query = Product.find(filter);

    if (sort) {
      if (sort === 'price_asc') {
        query = query.sort({ price: 1 }); // simpler sort on base price, or we sort memory-wise, but mongoose sort is fine
      } else if (sort === 'price_desc') {
        query = query.sort({ price: -1 });
      } else if (sort === 'rating') {
        query = query.sort({ rating: -1 });
      } else if (sort === 'newest') {
        query = query.sort({ createdAt: -1 });
      }
    }

    return await query;
  },

  findById: async (id) => {
    if (useLocalJson) {
      const products = readJsonFile('products');
      return products.find(p => p._id === id) || null;
    }
    return await Product.findById(id);
  },

  create: async (productData) => {
    if (useLocalJson) {
      const products = readJsonFile('products');
      const newProduct = {
        _id: generateId(),
        ...productData,
        rating: 0,
        numReviews: 0,
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      products.push(newProduct);
      writeJsonFile('products', products);
      return newProduct;
    }
    return await Product.create(productData);
  },

  update: async (id, updateData) => {
    if (useLocalJson) {
      const products = readJsonFile('products');
      const index = products.findIndex(p => p._id === id);
      if (index === -1) return null;
      products[index] = {
        ...products[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJsonFile('products', products);
      return products[index];
    }
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  },

  delete: async (id) => {
    if (useLocalJson) {
      const products = readJsonFile('products');
      const filtered = products.filter(p => p._id !== id);
      if (products.length === filtered.length) return false;
      writeJsonFile('products', filtered);
      return true;
    }
    const res = await Product.findByIdAndDelete(id);
    return !!res;
  },

  addReview: async (productId, reviewData) => {
    if (useLocalJson) {
      const products = readJsonFile('products');
      const index = products.findIndex(p => p._id === productId);
      if (index === -1) return null;

      const product = products[index];
      const newReview = {
        _id: generateId(),
        name: reviewData.name,
        rating: Number(reviewData.rating),
        comment: reviewData.comment,
        user: reviewData.user,
        createdAt: new Date().toISOString()
      };

      product.reviews.push(newReview);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
      product.rating = Math.round(product.rating * 10) / 10; // 1 decimal place

      writeJsonFile('products', products);
      return product;
    }

    const product = await Product.findById(productId);
    if (!product) return null;

    const review = {
      name: reviewData.name,
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      user: reviewData.user,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    product.rating = Math.round(product.rating * 10) / 10;

    await product.save();
    return product;
  }
};

// ==========================================
// CATEGORY SERVICE
// ==========================================
export const categoryService = {
  findAll: async () => {
    if (useLocalJson) {
      return readJsonFile('categories');
    }
    return await Category.find({});
  },

  findByName: async (name) => {
    if (useLocalJson) {
      const categories = readJsonFile('categories');
      return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
    }
    return await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  },

  create: async (categoryData) => {
    if (useLocalJson) {
      const categories = readJsonFile('categories');
      const newCategory = {
        _id: generateId(),
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      categories.push(newCategory);
      writeJsonFile('categories', categories);
      return newCategory;
    }
    return await Category.create(categoryData);
  },

  delete: async (id) => {
    if (useLocalJson) {
      const categories = readJsonFile('categories');
      const filtered = categories.filter(c => c._id !== id);
      if (categories.length === filtered.length) return false;
      writeJsonFile('categories', filtered);
      return true;
    }
    const res = await Category.findByIdAndDelete(id);
    return !!res;
  }
};

// ==========================================
// ORDER SERVICE
// ==========================================
export const orderService = {
  create: async (orderData) => {
    if (useLocalJson) {
      const orders = readJsonFile('orders');
      const newOrder = {
        _id: generateId(),
        ...orderData,
        isPaid: orderData.isPaid || false,
        paidAt: orderData.isPaid ? new Date().toISOString() : null,
        status: orderData.status || 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      orders.push(newOrder);
      writeJsonFile('orders', orders);
      return newOrder;
    }
    return await Order.create(orderData);
  },

  findById: async (id) => {
    if (useLocalJson) {
      const orders = readJsonFile('orders');
      return orders.find(o => o._id === id) || null;
    }
    // Populate user and product info
    return await Order.findById(id).populate('user', 'name email');
  },

  findByUser: async (userId) => {
    if (useLocalJson) {
      const orders = readJsonFile('orders');
      return orders.filter(o => o.user === userId || (o.user && o.user._id === userId));
    }
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  },

  findAll: async () => {
    if (useLocalJson) {
      const orders = readJsonFile('orders');
      // For fallback user display, map user object if available
      const users = readJsonFile('users');
      return orders.map(order => {
        const userObj = users.find(u => u._id === order.user);
        return {
          ...order,
          user: userObj ? { _id: userObj._id, name: userObj.name, email: userObj.email } : { name: 'Unknown User' }
        };
      });
    }
    return await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
  },

  updateStatus: async (id, status) => {
    if (useLocalJson) {
      const orders = readJsonFile('orders');
      const index = orders.findIndex(o => o._id === id);
      if (index === -1) return null;
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      if (status === 'Delivered') {
        orders[index].deliveredAt = new Date().toISOString();
      }
      writeJsonFile('orders', orders);
      return orders[index];
    }
    const order = await Order.findById(id);
    if (!order) return null;
    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }
    await order.save();
    return order;
  }
};

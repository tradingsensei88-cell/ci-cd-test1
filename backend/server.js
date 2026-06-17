import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, useLocalJson } from './config/db.js';
import { seedData } from './config/seed.js';
import { readJsonFile } from './services/jsonDb.js';
import Product from './models/Product.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middlewares
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Environment setup
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('AetherSound Premium Headphones API is running...');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  // Connect to DB (Mongoose or fallback)
  await connectDB();

  // Self-seeding check: auto-seed if products list is empty
  try {
    if (useLocalJson) {
      const products = readJsonFile('products');
      if (!products || products.length === 0) {
        console.log('📦 Local data empty. Triggering auto-seeding...');
        await seedData();
      }
    } else {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('📦 MongoDB database empty. Triggering auto-seeding...');
        await seedData();
      }
    }
  } catch (err) {
    console.error('Error auto-seeding database:', err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 AetherSound Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

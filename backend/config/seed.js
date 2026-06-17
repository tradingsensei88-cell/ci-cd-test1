import bcrypt from 'bcryptjs';
import { connectDB, useLocalJson } from './db.js';
import { writeJsonFile } from '../services/jsonDb.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

// Default mock data definitions
const defaultCategories = [
  {
    name: 'Over-Ear',
    description: 'Immersive soundscapes with ultimate acoustic seals.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Wireless',
    description: 'Untethered mobility without compromising high-fidelity resonance.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Gaming',
    description: 'Spatial audio engineered for absolute tactical awareness.',
    image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'In-Ear',
    description: 'Ultra-portable studio sound engineered for active lifestyles.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
  },
];

const defaultProducts = [
  {
    name: 'Aetheris Pro ANC',
    description: 'State-of-the-art hybrid Active Noise Cancelling headphones featuring custom beryllium drivers. Experience pure, unadulterated audio reproduction with a futuristic glassmorphic aesthetic and tactile touch controls.',
    brand: 'AetherSound',
    category: 'Over-Ear',
    price: 349.99,
    discountPrice: 299.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Driver Size': '40mm Beryllium',
      'Battery Life': '45 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3 / USB-C / 3.5mm',
      'Frequency Response': '4Hz - 45kHz',
      'Weight': '260g',
      'Codec Support': 'LDAC, AAC, SBC'
    },
    countInStock: 12,
    rating: 4.8,
    numReviews: 3,
    reviews: [
      { name: 'John Doe', rating: 5, comment: 'Best soundstage I have ever heard on a pair of wireless headphones. The noise cancellation is magical.' },
      { name: 'Alice Smith', rating: 4, comment: 'Incredible design and build quality. The neon green elements look awesome in dark mode.' },
      { name: 'Bob Johnson', rating: 5, comment: 'Audiophile grade. Battery seems to last forever.' }
    ],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false
  },
  {
    name: 'Vortex Wireless Air',
    description: 'Feather-light wireless over-ears offering punchy bass and crystalline high frequencies. Optimized for long hours of commutes and remote working with advanced beamforming voice microphones.',
    brand: 'AetherSound',
    category: 'Wireless',
    price: 199.99,
    discountPrice: 0,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Driver Size': '40mm Dynamic',
      'Battery Life': '30 Hours',
      'Connectivity': 'Bluetooth 5.2',
      'Frequency Response': '20Hz - 20kHz',
      'Weight': '210g',
      'Codec Support': 'aptX Adaptive, AAC'
    },
    countInStock: 8,
    rating: 4.3,
    numReviews: 2,
    reviews: [
      { name: 'Jane Miller', rating: 4, comment: 'Extremely comfortable. Light enough to forget I have them on.' },
      { name: 'Dave Wilson', rating: 5, comment: 'Voice calls are super clear. Bass has a nice warm thump to it.' }
    ],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  },
  {
    name: 'Neon Surge Haptic',
    description: 'Haptic feedback gaming headset built for real-time 3D spatial awareness. Fully integrated customizable neon green led highlights and high-density memory foam earcups.',
    brand: 'ViperX',
    category: 'Gaming',
    price: 249.99,
    discountPrice: 219.99,
    images: [
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Driver Size': '50mm Neodymium',
      'Haptic Engine': 'Lofelt L5 Haptic Drivers',
      'Connectivity': '2.4GHz Wireless / USB-C',
      'Microphone': 'Retractable Cardioid',
      'Latency': '< 15ms',
      'Weight': '320g'
    },
    countInStock: 4, // low stock alert trigger
    rating: 4.7,
    numReviews: 2,
    reviews: [
      { name: 'Alex Hunt', rating: 5, comment: 'The haptic feedback adds an insane level of realism to shooters. I can hear exactly where footsteps are.' },
      { name: 'Sarah Connor', rating: 4, comment: 'Mic quality is top-tier. A bit heavy, but earcups are extremely plush.' }
    ],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true
  },
  {
    name: 'Pulse buds Nano',
    description: 'Microscopic in-ear monitors delivering massive acoustics. Sweat-resistant coating and customized secure-fit fins make these perfect for intense sports and outdoor activities.',
    brand: 'AetherSound',
    category: 'In-Ear',
    price: 149.99,
    discountPrice: 129.99,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: {
      'Driver Size': '8.2mm Dynamic',
      'Battery Life': '8 Hours (28 Hours with Case)',
      'Connectivity': 'Bluetooth 5.3',
      'Waterproof Rating': 'IPX7 Sweatproof',
      'Weight': '5.2g per earbud',
      'Codec Support': 'AAC, SBC'
    },
    countInStock: 22,
    rating: 4.5,
    numReviews: 2,
    reviews: [
      { name: 'Leo Messi', rating: 5, comment: 'They never fall out during workouts. Sound is punchy and detailed.' },
      { name: 'Emma Watson', rating: 4, comment: 'Case is sleek. Touch controls are a bit sensitive but works well.' }
    ],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false
  }
];

const seedData = async () => {
  console.log('🌱 Starting Database Seeding...');
  
  // Encrypt passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  const defaultUsers = [
    {
      name: 'Administrator',
      email: 'admin@aethersound.com',
      password: adminPassword,
      isAdmin: true,
    },
    {
      name: 'Regular Customer',
      email: 'user@aethersound.com',
      password: userPassword,
      isAdmin: false,
    },
  ];

  if (useLocalJson) {
    console.log('📡 Seeding LOCAL FILE-BASED JSON DATABASE...');
    
    // Assign local mock string IDs
    const seededCategories = defaultCategories.map((c, i) => ({
      _id: `cat_id_${i + 1}`,
      ...c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const seededUsers = defaultUsers.map((u, i) => ({
      _id: `user_id_${i + 1}`,
      ...u,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const seededProducts = defaultProducts.map((p, i) => {
      // Attach local mock review IDs and user refs
      const mappedReviews = p.reviews.map((r, ri) => ({
        _id: `review_id_${i + 1}_${ri + 1}`,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        user: `user_id_2`, // Default to standard customer user
        createdAt: new Date().toISOString()
      }));

      return {
        _id: `prod_id_${i + 1}`,
        ...p,
        reviews: mappedReviews,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    writeJsonFile('categories', seededCategories);
    writeJsonFile('users', seededUsers);
    writeJsonFile('products', seededProducts);
    writeJsonFile('orders', []); // Initialize empty orders file

    console.log('✅ Local JSON database files seeded successfully!');
  } else {
    try {
      console.log('📡 Seeding MongoDB Database...');
      
      // Clear collections
      await Category.deleteMany();
      await User.deleteMany();
      await Product.deleteMany();
      await Order.deleteMany();

      // Seed categories
      const createdCategories = await Category.insertMany(defaultCategories);
      console.log(`- Seeded ${createdCategories.length} categories.`);

      // Seed users
      const createdUsers = await User.insertMany(defaultUsers);
      console.log(`- Seeded ${createdUsers.length} users.`);

      const customerUser = createdUsers.find(u => !u.isAdmin);

      // Seed products with references
      const productsToSeed = defaultProducts.map(p => {
        const reviewsWithUser = p.reviews.map(r => ({
          ...r,
          user: customerUser._id
        }));
        return {
          ...p,
          reviews: reviewsWithUser
        };
      });

      const createdProducts = await Product.insertMany(productsToSeed);
      console.log(`- Seeded ${createdProducts.length} products.`);
      
      console.log('✅ MongoDB database seeded successfully!');
    } catch (error) {
      console.error(`❌ Seeding failed: ${error.message}`);
      process.exit(1);
    }
  }
};

// Execute if run directly from terminal
const run = async () => {
  // Try connecting, then seed
  await connectDB();
  await seedData();
  // Force exit since it's a seed script
  process.exit(0);
};

// Check if file is executed directly (ES Modules style)
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  run();
} else if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  run();
}

export { seedData };

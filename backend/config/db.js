import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let useLocalJson = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('\n========================================================================');
    console.log('⚠️ MONGO_URI not found in backend/.env.');
    console.log('📡 FALLING BACK TO LOCAL FILE-BASED JSON DATABASE MODE (backend/data/*)');
    console.log('========================================================================\n');
    useLocalJson = true;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    useLocalJson = false;
  } catch (error) {
    console.log('\n========================================================================');
    console.log(`❌ MongoDB Connection Failed: ${error.message}`);
    console.log('📡 FALLING BACK TO LOCAL FILE-BASED JSON DATABASE MODE (backend/data/*)');
    console.log('========================================================================\n');
    useLocalJson = true;
  }
};

export const setUseLocalJson = (val) => {
  useLocalJson = val;
};

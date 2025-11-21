import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://narsijangid01:12345678nj@cluster0.x8tzdfv.mongodb.net/job-import-system?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4,
      retryWrites: true,
      retryReads: true,
    });
    
    // Wait for connection to be fully ready
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve(null);
      } else {
        mongoose.connection.once('open', resolve);
      }
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
}

export default mongoose;

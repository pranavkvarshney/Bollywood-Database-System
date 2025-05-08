import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        console.log("Using existing MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000 // Added connection timeout
            // Removed all problematic options
        };

        mongoose.set('strictQuery', true);

        console.log("Creating new MongoDB connection...");
        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('Connected to MongoDB successfully');

                // Add connection event listeners for better debugging in serverless
                mongoose.connection.on('error', err => {
                    console.error('MongoDB connection error:', err);
                });

                mongoose.connection.on('disconnected', () => {
                    console.log('MongoDB disconnected');
                    // Only reset connection in development to avoid connection thrashing in production
                    if (process.env.NODE_ENV === 'development') {
                        cached.conn = null;
                        cached.promise = null;
                    }
                });

                return mongoose;
            })
            .catch(err => {
                console.error("MongoDB connection error:", err);
                cached.promise = null;
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection failed:', e);
        throw e;
    }
}
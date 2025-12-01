import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env.local");
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the client across HMR
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("✓ MongoDB connected successfully");
        return client;
      })
      .catch((error) => {
        console.error("✗ MongoDB connection failed:", error.message);
        throw error;
      });
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, it's okay to create a new client for every invocation
  client = new MongoClient(uri);
  clientPromise = client
    .connect()
    .then((client) => {
      console.log("✓ MongoDB connected successfully");
      return client;
    })
    .catch((error) => {
      console.error("✗ MongoDB connection failed:", error.message);
      throw error;
    });
}

export default clientPromise;

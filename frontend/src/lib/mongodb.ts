import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

const client = new MongoClient(uri);
let clientPromise: Promise<MongoClient> | null = null;

export async function connectDB() {

  if (!clientPromise) {
    clientPromise = client.connect();
  }

  const connectedClient = await clientPromise;

  return connectedClient.db();
}
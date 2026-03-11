/**
 * Seed script to create the official Kraft_official store.
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/seed-official-store.ts
 */
import { connect, connection, model, Schema } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comaket';

async function seed() {
  await connect(DB_URI);
  console.log('Connected to MongoDB');

  const db = connection.db;

  // Check if store already exists
  const existing = await db.collection('stores').findOne({ slug: 'kraft-official' });
  if (existing) {
    console.log('Kraft_official store already exists, skipping...');
    await connection.close();
    return;
  }

  // Find a super_admin user to be the owner
  const superAdmin = await db.collection('users').findOne({ role: 'super_admin' });
  if (!superAdmin) {
    console.error('No super_admin user found. Please create one first.');
    await connection.close();
    return;
  }

  // Find or create the creator profile for the super admin
  let creator = await db.collection('creators').findOne({ userId: superAdmin._id });
  if (!creator) {
    const result = await db.collection('creators').insertOne({
      userId: superAdmin._id,
      username: 'Kraft_official',
      slug: 'kraft-official',
      bio: 'The official Comaket store. Verified and trusted products.',
      industries: ['General'],
      plan: 'business',
      status: 'active',
      isVerified: true,
      totalStores: 1,
      totalListings: 0,
      totalSales: 0,
      rating: 0,
      totalReviews: 0,
      totalFollowers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    creator = await db.collection('creators').findOne({ _id: result.insertedId });
    // Keep super_admin role — no role change needed
    console.log('Created creator profile for super admin');
  }

  // Create the official store
  await db.collection('stores').insertOne({
    creatorId: creator._id,
    userId: superAdmin._id,
    name: 'Kraft_official',
    slug: 'kraft-official',
    description: 'The official Comaket store. Authentic, verified products curated by the Comaket team.',
    tagline: 'Official. Verified. Trusted.',
    status: 'active',
    isVisible: true,
    categories: ['General'],
    tags: ['official', 'verified', 'comaket'],
    totalListings: 0,
    totalSales: 0,
    rating: 0,
    totalReviews: 0,
    followers: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Kraft_official store created successfully!');
  await connection.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

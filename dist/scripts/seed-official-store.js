"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comaket';
async function seed() {
    await (0, mongoose_1.connect)(DB_URI);
    console.log('Connected to MongoDB');
    const db = mongoose_1.connection.db;
    const existing = await db.collection('stores').findOne({ slug: 'kraft-official' });
    if (existing) {
        console.log('Kraft_official store already exists, skipping...');
        await mongoose_1.connection.close();
        return;
    }
    const superAdmin = await db.collection('users').findOne({ role: 'super_admin' });
    if (!superAdmin) {
        console.error('No super_admin user found. Please create one first.');
        await mongoose_1.connection.close();
        return;
    }
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
        console.log('Created creator profile for super admin');
    }
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
    await mongoose_1.connection.close();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-official-store.js.map
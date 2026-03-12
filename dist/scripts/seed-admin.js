"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const ADMIN_EMAIL = 'admin@comaket.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_FIRST_NAME = 'Comaket';
const ADMIN_LAST_NAME = 'Admin';
async function seedAdmin() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not found in .env');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const existing = await usersCollection.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`);
            console.log(`   Role: ${existing.role}`);
            await mongoose.disconnect();
            return;
        }
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const result = await usersCollection.insertOne({
            firstName: ADMIN_FIRST_NAME,
            lastName: ADMIN_LAST_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'super_admin',
            authProvider: 'local',
            isEmailVerified: true,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Role: super_admin`);
        console.log(`   ID: ${result.insertedId}`);
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');
        await mongoose.disconnect();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
seedAdmin();
//# sourceMappingURL=seed-admin.js.map
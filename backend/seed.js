import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB!");

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.deleteMany();
    console.log("🗑️ Old users cleared.");

    const users = [
      {
        name: "Happy",
        email: "happy@gmail.com",
        password: hashedPassword,
        role: "superadmin",
        phone: "+919874561230",
        gender: "male",
      },
      {
        name: "SuperAdmin",
        email: "superadmin@gmail.com",
        password: hashedPassword,
        role: "superadmin",
        phone: "+919874561231",
        gender: "female",
      },
      
    ];

    await User.insertMany(users);
    console.log(`✅ ${users.length} Users Seeded Successfully`);

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
    process.exit(0);

  } catch (error) {
    console.log("❌ Seed Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
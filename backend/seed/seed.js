import mongoose from 'mongoose';
import User from '../models/user.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.deleteMany(); // clear old data

    await User.create({
      name: "Happy",
      email: "happy@gmail.com",
      password: hashedPassword,
      role: "superadmin",
      phone: "+919874561230",
      gender: "male",
    });

    console.log("Data Seeded Successfully");

    await mongoose.connection.close(); // close connection
    process.exit(0);

  } catch (error) {
    console.log("Error", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");

require("dotenv").config();

dns.setServers(["8.8.8.8"]);

const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully!");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Admin credentials missing in .env");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Find existing admin
    const existingAdmin = await Admin.findOne({});

    if (existingAdmin) {
      existingAdmin.email = email;
      existingAdmin.password = hashedPassword;

      await existingAdmin.save();

      console.log("Admin Credentials Updated Successfully!");
    } else {
      await Admin.create({
        email,
        password: hashedPassword,
      });

      console.log("Single Admin Account Created Successfully!");
    }
  } catch (error) {
    console.log("Admin Setup Failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();


const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const MenuItem = require("../models/MenuItem");

// Correct middleware import
const { verifyAdmin } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const router = express.Router();

// ------------------------------------
// ADMIN LOGIN API
// POST /api/admin/login
// ------------------------------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        email: admin.email,
      },
    });
  } catch (error) {
    console.log("Admin Login Error:", error.message);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

// ------------------------------------
// VERIFY ADMIN API
// GET /api/admin/verify
// ------------------------------------

router.get("/verify", verifyAdmin, (req, res) => {
  return res.status(200).json({
    message: "Admin authentication successful!",
    admin: req.admin,
  });
});

// ------------------------------------
// ADD MENU ITEM API
// POST /api/admin/menu
// ------------------------------------

router.post(
  "/menu",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
      } = req.body;

      if (!name || !description || !price || !category) {
        return res.status(400).json({
          message: "Please provide all required menu item details",
        });
      }

      const newMenuItem = await MenuItem.create({
        name,
        description,
        price: Number(price),
        category,
        image: req.file
          ? `/uploads/${req.file.filename}`
          : "",
      });

      return res.status(201).json({
        message: "Menu item added successfully!",
        menuItem: newMenuItem,
      });
    } catch (error) {
      console.log("Add Menu Item Error:", error.message);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Server error while adding menu item",
      });
    }
  }
);

// ------------------------------------
// GET MENU ITEMS API
// GET /api/admin/menu
// ------------------------------------

router.get("/menu", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {
      isAvailable: true,
    };

    if (category) {
      const allowedCategories = [
        "Coffee",
        "Beverages",
        "Brownies",
        "Pizzas",
        "Burgers",
        "Subs",
        "Sandwiches",
        "Fries",
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          message: "Invalid menu category",
        });
      }

      filter.category = category;
    }

    const menuItems = await MenuItem.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Menu items fetched successfully!",
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.log("Get Menu Items Error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching menu items",
    });
  }
});

// ------------------------------------
// EDIT MENU ITEM API
// PUT /api/admin/menu/:id
// ------------------------------------

router.put("/menu/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      message: "Menu item updated successfully!",
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.log("Update Menu Item Error:", error.message);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid menu item details or ID",
      });
    }

    return res.status(500).json({
      message: "Server error while updating menu item",
    });
  }
});

// ------------------------------------
// DELETE MENU ITEM API
// DELETE /api/admin/menu/:id
// ------------------------------------

router.delete("/menu/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedMenuItem = await MenuItem.findByIdAndDelete(
      req.params.id
    );

    if (!deletedMenuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      message: "Menu item deleted successfully!",
      menuItem: deletedMenuItem,
    });
  } catch (error) {
    console.log("Delete Menu Item Error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid menu item ID",
      });
    }

    return res.status(500).json({
      message: "Server error while deleting menu item",
    });
  }
});

module.exports = router;

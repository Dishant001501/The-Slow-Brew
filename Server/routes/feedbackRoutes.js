
const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");
const Order = require("../models/Order");
const { verifyAdmin } = require("../middleware/authMiddleware");

// CUSTOMER: Submit Feedback
router.post("/", async (req, res) => {
  try {
    const { orderId, rating, message } = req.body;

    // Validate required fields
    if (!orderId || !rating || !message) {
      return res.status(400).json({
        message: "Order ID, rating and feedback message are required.",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter your feedback.",
      });
    }

    // Check whether order exists
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // Prevent duplicate feedback for the same order
    const existingFeedback = await Feedback.findOne({ orderId });

    if (existingFeedback) {
      return res.status(409).json({
        message: "Feedback has already been submitted for this order.",
      });
    }

    // Save Feedback
    const feedback = await Feedback.create({
      orderId,
      rating: numericRating,
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Thank you! Your feedback has been submitted successfully.",
      feedback,
    });
  } catch (error) {
    console.log("Submit Feedback Error:", error.message);

    return res.status(500).json({
      message: "Unable to submit feedback.",
    });
  }
});

// ADMIN: Fetch All Feedback
router.get("/admin", verifyAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("orderId", "mobile tableNumber totalAmount paymentMethod")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Feedback fetched successfully!",
      totalFeedback: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.log("Fetch Feedback Error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch feedback.",
    });
  }
});

module.exports = router;

const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { verifyAdmin } = require("../middleware/authMiddleware");

// Temporary test
console.log("verifyAdmin:", typeof verifyAdmin);
// Razorpay configuration
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Common function to validate and calculate order items
async function getOrderDetails(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
        const quantity = Number(item.quantity);

        if (
            !item.id ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            throw new Error("Invalid order item or quantity.");
        }

        const menuItem = await MenuItem.findById(item.id);

        if (!menuItem || !menuItem.isAvailable) {
            throw new Error("One or more menu items are unavailable.");
        }

        orderItems.push({
            menuItemId: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
        });

        totalAmount += menuItem.price * quantity;
    }

    return { orderItems, totalAmount };
}

// Common customer detail validation
function validateCustomerDetails(mobile, tableNumber) {
    if (!/^[0-9]{10}$/.test(String(mobile || ""))) {
        throw new Error("Please enter a valid 10-digit mobile number.");
    }

    if (
        !Number.isInteger(Number(tableNumber)) ||
        Number(tableNumber) < 1
    ) {
        throw new Error("Invalid table number.");
    }
}

// ------------------------------------
// CASH ORDER API
// POST /api/orders
// ------------------------------------

router.post("/", async (req, res) => {
    try {
        const {
            items,
            mobile,
            tableNumber,
            paymentMethod,
        } = req.body;

        validateCustomerDetails(mobile, tableNumber);

        if (paymentMethod !== "Cash") {
            return res.status(400).json({
                message: "Please use the online payment API for Online orders.",
            });
        }

        const { orderItems, totalAmount } =
            await getOrderDetails(items);

        const newOrder = await Order.create({
            items: orderItems,
            mobile: String(mobile),
            tableNumber: Number(tableNumber),
            totalAmount,
            paymentMethod: "Cash",
            paymentStatus: "Unpaid",
        });

        return res.status(201).json({
            message: "Cash order placed successfully!",
            order: newOrder,
        });
    } catch (error) {
        console.log("Cash Order Error:", error.message);

        return res.status(400).json({
            message: error.message || "Unable to place cash order.",
        });
    }
});

// ------------------------------------
// CREATE RAZORPAY ORDER API
// POST /api/orders/create-razorpay-order
// ------------------------------------

router.post("/create-razorpay-order", async (req, res) => {
    try {
        const {
            items,
            mobile,
            tableNumber,
        } = req.body;

        validateCustomerDetails(mobile, tableNumber);

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return res.status(500).json({
                message: "Razorpay keys are not configured.",
            });
        }

        // Get actual menu prices from MongoDB
        const { orderItems, totalAmount } =
            await getOrderDetails(items);

        // Razorpay amount must be in paise
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // Save online order in MongoDB
        const newOrder = await Order.create({
            items: orderItems,
            mobile: String(mobile),
            tableNumber: Number(tableNumber),
            totalAmount,
            paymentMethod: "Online",
            paymentStatus: "Unpaid",
            razorpayOrderId: razorpayOrder.id,
        });

        return res.status(201).json({
            message: "Razorpay order created successfully!",
            order: newOrder,
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            },
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.log("Razorpay Order Creation Error:", error.message);

        return res.status(400).json({
            message: error.message || "Unable to create Razorpay order.",
        });
    }
});


// ------------------------------------
// VERIFY RAZORPAY PAYMENT API
// POST /api/orders/verify-payment
// ------------------------------------

router.post("/verify-payment", async (req, res) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Validate required details
        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment verification details are missing.",
            });
        }


        // Find the original MongoDB order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found.",
            });
        }

        // Check payment method and Razorpay order ID
        if (
            order.paymentMethod !== "Online" ||
            order.razorpayOrderId !== razorpay_order_id
        ) {
            return res.status(400).json({
                message: "Invalid payment order.",
            });
        }

        // Already verified payment
        if (order.paymentStatus === "Paid") {
            return res.json({
                message: "Payment already verified.",
                order,
            });
        }

        // Generate expected Razorpay signature
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        const expectedBuffer = Buffer.from(
            expectedSignature,
            "hex"
        );

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            "hex"
        );

        // Compare signatures securely
        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(
                expectedBuffer,
                receivedBuffer
            )
        ) {
            return res.status(400).json({
                message: "Payment verification failed.",
            });
        }

        // Update payment only after successful verification
        order.paymentStatus = "Paid";
        order.razorpayPaymentId = razorpay_payment_id;

        await order.save();

        return res.status(200).json({
            message: "Payment verified successfully!",
            order,
        });
    } catch (error) {
        console.log(
            "Payment Verification Error:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to verify payment.",
        });
    }
});

// ------------------------------------
// GET ALL ORDERS FOR ADMIN
// GET /api/orders/admin
// ------------------------------------

router.get("/admin", verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully!",
            totalOrders: orders.length,
            orders,
        });
    } catch (error) {
        console.log("Fetch Admin Orders Error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch orders.",
        });
    }
});



module.exports = router;


const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  try {
    // Request se authorization header lena
    const authHeader = req.headers.authorization;

    // Token check karna
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Please login first.",
      });
    }

    // Bearer ke baad wala token lena
    const token = authHeader.split(" ")[1];

    // Token verify karna
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Admin ki information request mein save karna
    req.admin = decoded;

    // Agle function par jaana
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
}

module.exports = { verifyAdmin };

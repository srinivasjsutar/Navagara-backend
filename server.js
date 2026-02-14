require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const siteBookingRoutes = require("./routes/siteBookingRoutes");
const receiptRoutes = require("./routes/receiptRoutes");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware - CORS must be before routes
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ], // Add your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Increase body parser limit to handle PDF attachments (50MB)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/", adminRoutes);
app.use("/", memberRoutes);
app.use("/", paymentRoutes);
app.use("/", siteBookingRoutes);
app.use("/", receiptRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({
    message: "Backend is running!",
    emailConfigured: !!process.env.EMAIL_USER,
    port: process.env.PORT || 3001,
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email User: ${process.env.EMAIL_USER || "NOT CONFIGURED"}`);
  // console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL || "NOT CONFIGURED"}`);
  console.log(
    `💾 Database: ${process.env.MONGODB_URI ? "Connected" : "Check connection"}`,
  );
});
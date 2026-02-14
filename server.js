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

/* =========================
   ✅ FIXED CORS CONFIG
   ========================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://navanagara.vercel.app", // ⭐ YOUR VERCEL DOMAIN
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps/postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ⭐ VERY IMPORTANT for preflight requests
app.options("*", cors());

/* =========================
   BODY PARSER
   ========================= */

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

/* =========================
   LOGGER
   ========================= */

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/* =========================
   ROUTES
   ========================= */

app.use("/", adminRoutes);
app.use("/", memberRoutes);
app.use("/", paymentRoutes);
app.use("/", siteBookingRoutes);
app.use("/", receiptRoutes);

/* =========================
   TEST ROUTE
   ========================= */

app.get("/test", (req, res) => {
  res.json({
    message: "Backend is running!",
    emailConfigured: !!process.env.EMAIL_USER,
    port: process.env.PORT || 3001,
  });
});

/* =========================
   404 HANDLER
   ========================= */

app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
});

/* =========================
   ERROR HANDLER
   ========================= */

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* =========================
   START SERVER
   ========================= */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email User: ${process.env.EMAIL_USER || "NOT CONFIGURED"}`);
  console.log(
    `💾 Database: ${process.env.MONGODB_URI ? "Connected" : "Check connection"}`
  );
});

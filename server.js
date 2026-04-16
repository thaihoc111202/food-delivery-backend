const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const categoriesRoutes = require("./routes/categories");

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/categories", categoriesRoutes);

// Test API
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});

// ⚠️ PORT cho deploy
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
});

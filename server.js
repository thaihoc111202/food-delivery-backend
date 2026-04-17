<<<<<<< HEAD
require("dotenv").config();
=======
>>>>>>> 843677cd145f8945168d17119dcc5189dcca9571
const express = require("express");
const app = express();
const cors = require("cors");


const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const categoriesRoutes = require("./routes/categories");
const verifyToken = require("./mid/authMiddleware");

app.use(cors());
app.use(express.json());

// Routes không cần xác thực
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);

// Routes cần xác thực
app.use("/api/cart", verifyToken, cartRoutes);
app.use("/api/orders", verifyToken, ordersRoutes);

app.get("/", (req, res) => {
  res.send("API đang chạy...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

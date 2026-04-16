

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// ================= 1. LẤY LỊCH SỬ =================
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ================= 2. CHI TIẾT ORDER =================
router.get("/order-details/:orderId", verifyToken, (req, res) => {
  const { orderId } = req.params;

  const sql = `
    SELECT 
      od.id,
      od.quantity,
      p.name,
      p.price,
      p.image
    FROM order_details od
    JOIN products p ON od.product_id = p.id
    WHERE od.order_id = ?
  `;

  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ================= 3. TẠO ORDER =================
router.post("/addOrder", verifyToken, (req, res) => {
  const userId = req.user.id; // 🔥 từ token

  const { receiverName, receiverAddress, paymentMethod, totalPrice } = req.body;

  const getCartSql = `
    SELECT product_id, quantity
    FROM cart_items
    WHERE user_id = ?
  `;

  db.query(getCartSql, [userId], (err, cartItems) => {
    if (err) return res.status(500).json(err);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart rỗng" });
    }

    const insertOrderSql = `
      INSERT INTO orders (user_id, receiver_name, receiver_address, payment_method, total_price)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertOrderSql,
      [userId, receiverName, receiverAddress, paymentMethod, totalPrice],
      (err, result) => {
        if (err) return res.status(500).json(err);

        const orderId = result.insertId;

        const values = cartItems.map(item => [
          orderId,
          item.product_id,
          item.quantity
        ]);

        const insertDetailSql = `
          INSERT INTO order_details (order_id, product_id, quantity)
          VALUES ?
        `;

        db.query(insertDetailSql, [values], (err) => {
          if (err) return res.status(500).json(err);

          db.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

          res.json({
            message: "Tạo order thành công",
            orderId,
          });
        });
      }
    );
  });
});

module.exports = router;

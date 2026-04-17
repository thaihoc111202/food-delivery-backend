const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= 1. LẤY LỊCH SỬ ĐƠN HÀNG =================
// GET /api/orders
router.get("/", (req, res) => {
  try {
    const userId = req.user.userId;

    const sql = `
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json(err);

      res.json(result);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/order-details/:orderId
router.get("/order-details/:orderId", (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    // Verify that the order belongs to the user
    const verifySql = "SELECT * FROM orders WHERE id = ? AND user_id = ?";
    db.query(verifySql, [orderId, userId], (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Tạo order
router.post("/addOrder", (req, res) => {
  const { userId, receiverName, receiverAddress, paymentMethod, totalPrice } = req.body;

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

    // 1. Insert order
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
          
          const deleteCartSql = `DELETE FROM cart_items WHERE user_id = ?`;
          db.query(deleteCartSql, [userId], (err) => {
            if (err) return res.status(500).json(err);
            
            res.status(201).json({
              message: "Tạo order thành công",
              orderId
            });
          });
        });
      }
    );
  });
});

module.exports = router;

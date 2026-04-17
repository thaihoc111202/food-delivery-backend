const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= 1. ADD TO CART =================
// POST /api/cart/add
router.post("/add", (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE quantity = quantity + 1
  `;

  db.query(sql, [userId, productId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Đã thêm / cập nhật giỏ hàng" });
  });
});

// ================= 2. LẤY GIỎ HÀNG =================
// GET /api/cart
router.get("/", (req, res) => {
  const userId = req.user.userId;

  const sql = `
    SELECT ci.id AS cart_item_id,
           p.id AS product_id,
           p.name,
           p.price,
           p.image,
           ci.quantity,
           (p.price * ci.quantity) AS total
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `;
  db.query(sql, [userId], (err, items) => {
    if (err) return res.status(500).json(err);
    res.json({
      items
    });
  });
});

// ================= 3. UPDATE SỐ LƯỢNG =================
// PUT /api/cart/update
router.put("/update", (req, res) => {
  const { cartItemId, quantity } = req.body;
  const userId = req.user.userId;

  if (!cartItemId || quantity == null) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  // Verify that the cart item belongs to the user
  const verifySql = "SELECT * FROM cart_items WHERE id = ? AND user_id = ?";
  db.query(verifySql, [cartItemId, userId], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.length === 0) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    if (quantity <= 0) {
      db.query("DELETE FROM cart_items WHERE id = ?", [cartItemId], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Đã xóa sản phẩm" });
      });
    } else {
      db.query(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [quantity, cartItemId],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Cập nhật thành công" });
        }
      );
    }
  });
});

// ================= 4. XÓA 1 SẢN PHẨM =================
// DELETE /api/cart/delete/:id
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.user.userId;

  // Verify that the cart item belongs to the user
  const verifySql = "SELECT * FROM cart_items WHERE id = ? AND user_id = ?";
  db.query(verifySql, [id, userId], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.length === 0) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    db.query("DELETE FROM cart_items WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Đã xóa sản phẩm" });
    });
  });
});

// ================= 5. CLEAR CART =================
// DELETE /api/cart/clear
router.delete("/clear", (req, res) => {
  const userId = req.user.userId;

  db.query("DELETE FROM cart_items WHERE user_id = ?", [userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  });
});

module.exports = router;
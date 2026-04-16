

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// ================= 1. ADD TO CART =================
router.post("/add", verifyToken, (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id; // 🔥 lấy từ token

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
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;

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

    res.json({ items });
  });
});


// ================= 3. UPDATE =================
router.put("/update", verifyToken, (req, res) => {
  const { cartItemId, quantity } = req.body;

  if (!cartItemId || quantity == null) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
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


// ================= 4. DELETE ITEM =================
router.delete("/delete/:id", verifyToken, (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM cart_items WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã xóa sản phẩm" });
  });
});


// ================= 5. CLEAR CART =================
router.delete("/clear", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query("DELETE FROM cart_items WHERE user_id = ?", [userId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  });
});

module.exports = router;

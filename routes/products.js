const express = require("express");
const router = express.Router();
const db = require("../config/db");


// Hiển thị tất cả sản phẩm
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});


//Tìm kiếm sản phẩm theo tên
// /api/products/search-name?name=ga

router.get("/search-name/:name", (req, res) => {
  const name = req.params.name;
  if (!name) {
    return res.status(400).json({ message: "Thiếu tên sản phẩm" });
  }

  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.name LIKE ?
  `;

  db.query(sql, [`%${name}%`], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

//Hiển thị sản phẩm theo category

router.get("/category/:id", (req, res) => {
  const categoryId = req.params.id;

  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ?
  `;

  db.query(sql, [categoryId], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

// Hiển thị chi tiết sản phẩm theo id
// /api/products/1

router.get("/:id", (req, res) => {
  const productId = req.params.id;

  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [productId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(result[0]); // chỉ trả về 1 sản phẩm
  });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= LẤY TẤT CẢ CATEGORY =================
// GET /api/categories
router.get("/", (req, res) => {
  const sql = `
    SELECT * FROM categories
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

module.exports = router;
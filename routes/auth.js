const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../mid/authMiddleware");

// ================= ĐĂNG KÝ =================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json(err);

          res.status(201).json({
            message: "Đăng ký thành công",
            user: {
              id: result.insertId,
              email: email
            }
          });
        }
      );
    });

  } catch (error) {
    res.status(500).json(error);
  }
});


// ================= ĐĂNG NHẬP =================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token: token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  });
});

// ================= ĐỔI MẬT KHẨU =================
router.post("/change-password", verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  // Validate input
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Mật khẩu cũ và mật khẩu mới không được để trống" });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({ message: "Mật khẩu mới không được giống mật khẩu cũ" });
  }

  try {
    db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "User không tồn tại" });
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId],
        (err, result) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Đổi mật khẩu thành công"
          });
        }
      );
    });

  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
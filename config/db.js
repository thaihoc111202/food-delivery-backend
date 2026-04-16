const mysql = require("mysql2");

const db = mysql.createPool(process.env.DATABASE_URL);

// Test DB
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB lỗi:", err);
  } else {
    console.log("✅ DB connected");
    connection.release();
  }
});

module.exports = db;

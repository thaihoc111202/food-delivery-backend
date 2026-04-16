const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

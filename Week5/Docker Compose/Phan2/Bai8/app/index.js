const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "user",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "mydb",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime");
    res.json({
      message: "Node.js connected to MySQL successfully",
      dbTime: rows[0].currentTime,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Bai 8 app listening on port ${port}`);
});

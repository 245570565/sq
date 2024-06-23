// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 连接 SQLite 数据库
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 创建用户表（如果不存在）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT,
      phone TEXT
    )
  `);

  // 插入初始数据（如果表是空的）
  db.get("SELECT COUNT(*) AS count FROM user_profile", (err, row) => {
    if (err) {
      console.error('Error counting rows:', err);
    } else if (row.count === 0) {
      db.run(`INSERT INTO user_profile (username, email, phone) VALUES (?, ?, ?)`, 
        ['John Doe', 'john.doe@example.com', '123-456-7890']);
    }
  });
});

// 获取用户 Profile 信息
app.get('/api/user/profile', (req, res) => {
  db.get("SELECT * FROM user_profile LIMIT 1", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row);
    }
  });
});

// 更新用户 Profile 信息
app.post('/api/user/profile', (req, res) => {
  const { username, email, phone } = req.body;
  db.run(`UPDATE user_profile SET username = ?, email = ?, phone = ? WHERE id = 1`, 
    [username, email, phone], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // 返回更新后的数据以及成功标志
      res.json({ success: true, username, email, phone });
    }
  });
});

// 服务器监听端口
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
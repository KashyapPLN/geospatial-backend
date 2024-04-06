const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const geospatialRoutes = require('./routes/geospatialRoutes');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
  }));
  

// Routes
// Example route
app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

  app.use('/auth', authRoutes);
  app.use('/geospatial', geospatialRoutes);
  

// Start server
const PORT = process.env.PORT || 5000;
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS user_geospatial (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, geospatial_data TEXT NOT NULL, geospatial_file_path TEXT, FOREIGN KEY (user_id) REFERENCES users(id))');
    console.log('User geospatial table created');

    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON;');

    console.log('Connected to SQLite database');
  });
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

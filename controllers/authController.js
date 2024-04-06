// authController.js

// Import any necessary dependencies
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const users = []; // Example in-memory storage for users
const db = new sqlite3.Database('database.db');

// Signup controller
exports.signup = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if email is already registered
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        if (row) {
          return res.status(400).json({ error: 'Email is already registered' });
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Generate UUID for user ID
        const userId = uuidv4();
  
        console.log('Inserting data into users table:', userId, email, hashedPassword); // Log the data being inserted
  
        // Insert the user into the database
        db.run('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [userId, email, hashedPassword], (err) => {
          if (err) {
            console.error('Database error:', err);
            console.error('UserID:', userId); // Log the UserID
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.status(201).json({ message: 'User created successfully' });
        });
      });
    } catch (error) {
      console.error('Signup failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  

// Login controller
exports.login = (req, res) => {
    const { email, password } = req.body;
  
    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Check if user exists
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      try {
        // Compare password with hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
  
        // Respond with user details
        res.json({ user });
      } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };

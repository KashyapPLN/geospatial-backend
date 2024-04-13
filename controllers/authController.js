import bcrypt from 'bcryptjs';
import { client } from '../index.js'; // Import MongoDB client
import { ObjectId } from 'mongodb';

// Define the MongoDB database name
const DATABASE_NAME = 'geo-spatial';

// Signup controller
export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = client.db(DATABASE_NAME); // Specify the database name

    // Check if email is already registered
    const user = await db.collection('users').findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    await db.collection('users').insertOne({
      _id: new ObjectId(), // Generate ObjectId for user ID
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = client.db(DATABASE_NAME); // Specify the database name

    // Find user by email
    const user = await db.collection('users').findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
};

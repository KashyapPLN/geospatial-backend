// index.js

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';
import geospatialRoutes from './routes/geospatialRoutes.js';


const app = express();
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌😊");
  return client;
}

export const client = await createConnection();

// Routes
// Example route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/auth', authRoutes);
app.use('/geospatial', geospatialRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

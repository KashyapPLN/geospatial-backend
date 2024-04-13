import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { client } from '../index.js'; // Import MongoDB client
import { ObjectId } from 'mongodb';

const router = express.Router();
const DATABASE_NAME = 'geo-spatial'; // Define the database name

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

/// Endpoint for uploading GeoJSON or KML files
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract the user ID from the request (assuming it's included in the request, such as in the headers or the request body)
    const userId = req.body.userId; // Adjust this according to your frontend implementation

    if (!userId) {
        return res.status(400).json({ error: 'User ID not provided' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Determine the file format based on its extension
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Process the uploaded file based on its format
    if (fileExt === '.geojson') {
        try {
            const db = client.db(DATABASE_NAME); // Use DATABASE_NAME here

            // Read the GeoJSON file
            const data = fs.readFileSync(filePath, 'utf8');

            // Insert the file path and geospatial data into the database
            const result = await db.collection('user_geospatial').insertOne({
                user_id: new ObjectId(userId), // Convert userId to ObjectId
                geospatial_file_path: filePath,
                geospatial_data: data
            });

            // Send the GeoJSON data along with the file upload success message
            res.status(201).json({ message: 'File uploaded successfully', filePath, fileType, geoJSONData: JSON.parse(data) });
        } catch (error) {
            console.error('MongoDB error:', error);
            res.status(500).json({ error: 'Failed to store file' });
        } finally {
            // Delete the uploaded file after processing
            fs.unlinkSync(filePath);
        }
    } else {
        // Unsupported file format
        return res.status(400).json({ error: 'Unsupported file format' });
    }
});

// Endpoint to update GeoJSON data
router.put('/update-geojson', async (req, res) => {
    const updatedData = req.body.updatedData;
    const userId = req.body.userId; // Convert userId to ObjectId

    try {
        const db = client.db(DATABASE_NAME); // Use DATABASE_NAME here

        // Update the GeoJSON data in the database
        const result = await db.collection('user_geospatial').updateOne(
            { user_id: new ObjectId(userId) }, // Convert userId to ObjectId
            { $set: { geospatial_data: updatedData } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found or no data updated' });
        }

        res.status(200).json({ message: 'GeoJSON data updated successfully in the database' });
    } catch (error) {
        console.error('MongoDB error:', error);
        res.status(500).json({ error: 'Failed to update GeoJSON data in the database' });
    }
});

export default router;

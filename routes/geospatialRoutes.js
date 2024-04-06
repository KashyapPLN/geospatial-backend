const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('database.db');

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
router.post('/upload', upload.single('file'), (req, res) => {
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
        // Read the GeoJSON file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Failed to read file' });
            }

            // Insert the file path and geospatial data into the database
            db.run('INSERT INTO user_geospatial (user_id, geospatial_file_path, geospatial_data) VALUES (?, ?, ?)', [userId, filePath, data], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to store file' });
                }
                // Send the GeoJSON data along with the file upload success message
                res.status(201).json({ message: 'File uploaded successfully', filePath, fileType, geoJSONData: JSON.parse(data) });
            });
        });
    } else {
        // Unsupported file format
        return res.status(400).json({ error: 'Unsupported file format' });
    }
});



  

// CRUD operations for geospatial data

// Create geospatial data
router.post('/', (req, res) => {
  const { userId, geospatialData } = req.body;
  db.run('INSERT INTO user_geospatial (user_id, geospatial_data) VALUES (?, ?)', [userId, geospatialData], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create geospatial data' });
    }
    res.status(201).json({ message: 'Geospatial data created successfully' });
  });
});

// Update geospatial data
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { geospatialData } = req.body;
  db.run('UPDATE user_geospatial SET geospatial_data = ? WHERE id = ?', [geospatialData, id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update geospatial data' });
    }
    res.json({ message: 'Geospatial data updated successfully' });
  });
});

// Retrieve geospatial data by user ID
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM user_geospatial WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve geospatial data' });
    }
    res.json({ geospatialData: rows });
  });
});

// Delete geospatial data by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM user_geospatial WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete geospatial data' });
    }
    res.json({ message: 'Geospatial data deleted successfully' });
  });
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const os = require('os');

require('dotenv').config();

// Cloudinary configuration  
cloudinary.config({  
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
}); 

const hasCloudinaryConfig = () => {
    return Boolean(process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET);
};

const app = express();
const uploadDir = path.join(os.tmpdir(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir }); // Temporary upload directory

const uploadToCloudinary = (filePath, options) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, options, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
            } else {
                console.log('Cloudinary upload result:', result);
                resolve(result);
            }
        });
    });
};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.array('file'), async (req, res) => {
    try {
        if (!hasCloudinaryConfig()) {
            return res.status(500).json({
                error: 'Missing Cloudinary configuration',
                details: 'Set CLOUD_NAME, API_KEY, and API_SECRET in the environment.'
            });
        }

        const fileType = req.body.fileType;
        const files = req.files;
        let compressedFiles = [];

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No files received',
                details: 'Upload at least one file.'
            });
        }

        for (const file of files) {
            const filePath = file.path;
            let options = {};

            if (fileType === 'video') {
                options = { 
                    resource_type: 'video', 
                    transformation: [
                        { quality: 'auto:eco', fetch_format: 'auto' }
                    ] 
                };
            } else if (fileType === 'image') {
                options = { 
                    transformation: [
                        { width: 800, crop: 'scale', quality: 'auto:eco', fetch_format: 'auto' }
                    ] 
                };
            } else if (fileType === 'document') {
                options = { 
                    resource_type: 'raw'
                };
            } else {
                options = { 
                    resource_type: 'raw'
                };
            }

            // Upload the file to Cloudinary
            const result = await uploadToCloudinary(filePath, options);

            // Get file sizes
            const originalFileSize = fs.statSync(filePath).size;
            const compressedFileSize = result.bytes;
            const compressionPercentage = ((originalFileSize - compressedFileSize) / originalFileSize) * 100;

            // Delete the original file
            fs.unlinkSync(filePath);

            compressedFiles.push({
                originalFileSize: (originalFileSize / (1024 * 1024)).toFixed(2), // Convert to MB
                compressedFileSize: (compressedFileSize / (1024 * 1024)).toFixed(2), // Convert to MB
                compressionPercentage: compressionPercentage.toFixed(2),
                downloadUrl: result.secure_url
            });
        }

        res.json(compressedFiles);
    } catch (error) {
        console.error('Error during file upload and compression:', error); // Detailed error logging
        res.status(500).json({ error: 'File compression failed', details: error.message });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000; // Change the port number here
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
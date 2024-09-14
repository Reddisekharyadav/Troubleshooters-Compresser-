const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cloudinary configuration  
cloudinary.config({  
    cloud_name: 'ddy0ut9pz', // Replace with your Cloudinary name  
    api_key: '513147674718252',        // Replace with your Cloudinary API key  
    api_secret: 'qTFrINkbHAaOj8uOQvRUjcBmGhQ'   // Replace with your Cloudinary API secret  
}); 

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary upload directory

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
        const fileType = req.body.fileType;
        const files = req.files;
        let compressedFiles = [];

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

const PORT = process.env.PORT || 3000; // Change the port number here
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const multer = require('multer');
const path = require('node:path');
const cloudinary = require('cloudinary').v2;
const fs = require('node:fs');
const os = require('node:os');

require('dotenv').config();

const cleanEnv = (value) => {
    const normalized = (value || '').trim();
    if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
        return normalized.slice(1, -1);
    }

    return normalized;
};

// Cloudinary configuration  
cloudinary.config({  
    cloud_name: cleanEnv(process.env.CLOUD_NAME), 
    api_key: cleanEnv(process.env.API_KEY), 
    api_secret: cleanEnv(process.env.API_SECRET) 
}); 

const hasCloudinaryConfig = () => {
    return Boolean(cleanEnv(process.env.CLOUD_NAME) && cleanEnv(process.env.API_KEY) && cleanEnv(process.env.API_SECRET));
};

const getPublicConfig = () => {
    return {
        cloudName: cleanEnv(process.env.CLOUD_NAME),
        uploadPreset: cleanEnv(process.env.UPLOAD_PRESET)
    };
};

const app = express();
const uploadDir = path.join(os.tmpdir(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
    dest: uploadDir,
    limits: {
        files: 10,
        fileSize: 100 * 1024 * 1024
    }
}); // Temporary upload directory

const VALID_FILE_TYPES = new Set(['image', 'video', 'document']);

const getUploadOptions = (fileType) => {
    if (fileType === 'video') {
        return {
            resource_type: 'video',
            transformation: [{ quality: 'auto:eco', fetch_format: 'auto' }]
        };
    }

    if (fileType === 'image') {
        return {
            resource_type: 'image',
            transformation: [{ width: 800, crop: 'scale', quality: 'auto:eco', fetch_format: 'auto' }]
        };
    }

    return { resource_type: 'raw' };
};

const isFileTypeMatch = (fileType, mimeType) => {
    if (fileType === 'image') {
        return mimeType.startsWith('image/');
    }

    if (fileType === 'video') {
        return mimeType.startsWith('video/');
    }

    if (fileType === 'document') {
        return mimeType.startsWith('application/') || mimeType.startsWith('text/');
    }

    return false;
};

const getCloudinaryErrorMessage = (error) => {
    if (!error) {
        return 'Cloudinary upload failed';
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    if (typeof error === 'object') {
        const errorMessage = typeof error.message === 'string' ? error.message : '';
        const errorCode = typeof error.http_code === 'number' ? ` (HTTP ${error.http_code})` : '';
        if (errorMessage) {
            return `${errorMessage}${errorCode}`;
        }
    }

    return 'Cloudinary upload failed';
};

const uploadToCloudinary = (filePath, options) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, options, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                reject(new Error(getCloudinaryErrorMessage(error)));
            } else {
                console.log('Cloudinary upload result:', result);
                resolve(result);
            }
        });
    });
};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/config', (req, res) => {
    res.json(getPublicConfig());
});

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

        if (!VALID_FILE_TYPES.has(fileType)) {
            return res.status(400).json({
                error: 'Invalid file type',
                details: 'fileType must be one of: image, video, document.'
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No files received',
                details: 'Upload at least one file.'
            });
        }

        for (const file of files) {
            const filePath = file.path;
            const mimeType = file.mimetype || '';

            if (!isFileTypeMatch(fileType, mimeType)) {
                return res.status(400).json({
                    error: 'File type mismatch',
                    details: `One or more files do not match the selected type: ${fileType}.`
                });
            }

            const options = getUploadOptions(fileType);
            const originalFileSize = Number(file.size || 0);

            try {
                const result = await uploadToCloudinary(filePath, options);
                const compressedFileSize = Number(result.bytes || originalFileSize);
                const compressionPercentage = originalFileSize > 0
                    ? ((originalFileSize - compressedFileSize) / originalFileSize) * 100
                    : 0;
                const forcedDownloadUrl = typeof result.secure_url === 'string'
                    ? result.secure_url.replace('/upload/', '/upload/fl_attachment/')
                    : '';

                compressedFiles.push({
                    fileName: file.originalname,
                    originalFileSize: (originalFileSize / (1024 * 1024)).toFixed(2),
                    compressedFileSize: (compressedFileSize / (1024 * 1024)).toFixed(2),
                    compressionPercentage: compressionPercentage.toFixed(2),
                    previewUrl: result.secure_url,
                    downloadUrl: forcedDownloadUrl || result.secure_url
                });
            } finally {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        res.json(compressedFiles);
    } catch (error) {
        console.error('Error during file upload and compression:', error); // Detailed error logging
        res.status(500).json({ error: 'File compression failed', details: error.message });
    }
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            error: 'Upload validation failed',
            details: err.message
        });
    }

    return next(err);
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000; // Change the port number here
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
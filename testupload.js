const cloudinary = require('cloudinary').v2;
const path = require('path');

require('dotenv').config();

// Cloudinary configuration  
cloudinary.config({  
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});  

// Path to the file you want to upload
const filePath = "C:\\Users\\reddi\\Downloads\\mrs.jpg"; // Use the absolute path directly

cloudinary.uploader.upload(filePath, { resource_type: 'auto' }, (error, result) => {
    if (error) {
        console.error('Upload failed:', error);
    } else {
        console.log('Upload successful:', result);
    }
});
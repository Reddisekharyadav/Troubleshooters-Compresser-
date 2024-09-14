const cloudinary = require('cloudinary').v2;
const path = require('path');

// Cloudinary configuration  
cloudinary.config({  
    cloud_name: 'ddy0ut9pz', // Replace with your Cloudinary name  
    api_key: '513147674718252',        // Replace with your Cloudinary API key  
    api_secret: 'qTFrINkbHAaOj8uOQvRUjcBmGhQ'   // Replace with your Cloudinary API secret  
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
COMPRESSED TOOL KIT

File Upload and Compression with Cloudinary
This project demonstrates a Node.js application using Express, Multer, and Cloudinary to handle file 
uploads and compression. The application allows users to upload images, videos, and documents, 
compresses them according to their type, and uploads them to Cloudinary for storage and further 
processing.

Features

File Upload: Utilizes Multer to handle file uploads.
Cloudinary Integration: Compresses and uploads files to Cloudinary.
Transformation Options: Applies different transformations based on file type (image, video, document).
File Compression Metrics:Provides detailed information on file sizes and compression efficiency.

Prerequisites

Before you begin, ensure you have the following installed:
Node.js: [Download and install Node.js](https://nodejs.org/).
Cloudinary Account: [Sign up for Cloudinary](https://cloudinary.com/) to get your Cloudinary 
credentials.
Installation
1. Clone the Repository
Clone this repository to your local machine:
gh repo clone Reddisekharyadav/Troubleshooters-Compresser-

3. Install Dependencies
   
Install the required Node.js modules:
npm install

5. Configure Cloudinary
   
Create a .env file in the root directory of your project to store your Cloudinary credentials. Use 
the following template for the .env file:
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
Replace your_cloud_name, your_api_key, and your_api_secret with your actual Cloudinary 
credentials.

7. Start the Application
Run the following command to start the server:
npm start
The server will start on http://localhost:3000 by default.
Usage
Access the Application
Open your web browser and navigate to http://localhost:3000 to access the file upload 
interface.

Upload Files

1. Use the file upload form on the main page to select files.
2. Choose the file type from the dropdown menu (options: image, video, document).
3. Click "Upload" to send the file to the server.
API Endpoints
GET /
Serves the HTML file for the root URL.
URL: /
Method: GET
 Response: HTML file (public/index.html)
POST /upload
Handles file uploads and compression.
 URL: /upload
 Method: POST
Form Data:
file: File to be uploaded (can be multiple files).
 fileType: Type of the file (image, video, document).
 Response: JSON array with details of compressed files:
[
 {
 "originalFileSize": "1.23",
 "compressedFileSize": "0.98",
 "compressionPercentage": "20.28",
 "downloadUrl":
"https://res.cloudinary.com/your_cloud_name/video/upload/v1612871234/example_
video.mp4"
 }
]
Error Handling
If an error occurs during file upload or compression, the server responds with a 500 status code 
and a JSON error message:
{
 "error": "File compression failed",
 "details": "Detailed error message"
}

Code Explanation

 Dependencies:

o express: Web framework for Node.js.
o multer: Middleware for handling multipart/form-data used for file uploads.
o cloudinary: Cloudinary SDK for uploading files and applying transformations.
o path: Provides utilities for working with file and directory paths.
o fs: Node.js file system module for handling file operations.
 File Upload Handling:
o Files are uploaded to a temporary directory (uploads/).
o After uploading, each file is processed based on its type (image, video, 
document).
o Files are uploaded to Cloudinary with appropriate transformation options.
 File Transformation Options:
o Images: Scaled to a width of 800 pixels with auto quality and format.
o Videos: Compressed with auto quality and format settings.
o Documents: Uploaded without specific transformations.
 Compression Metrics:
o Original and compressed file sizes are calculated.
o Compression percentage is determined and included in the response.
Contributing

Contributions are welcome! Please follow these steps to contribute:
1. Fork the Repository: Click the "Fork" button on the top right corner of the repository 
page.
2. Create a Branch: git checkout -b feature-branch
3. Commit Changes: git commit -am 'Add new feature'
4. Push to the Branch: git push origin feature-branch
5. Create a Pull Request: Open a pull request on GitHub to merge your changes.
Please see our Contributing Guidelines for more details.
Contact
For questions or feedback, please contact reddisekharmarugani@gmail.com

Acknowledgments

Cloudinary for cloud-based image and video management.
Express for the web server framework.
Multer for handling multipart form data.
Node.js for the runtime environment.

Summary:

Overview: Provides a clear description of what the project does.
Features: Lists the main functionalities.
Prerequisites: Details the required software and services.
Installation: Guides users through setting up the project.
Usage: Explains how to use the application and its API.
Code Explanation: Breaks down the core components of the code.
Contributing: Encourages community involvement and provides contribution 
guidelines.
License and Contact: Includes legal and contact information.
Acknowledgments: Credits relevant tools and libraries.

 THANK YOU

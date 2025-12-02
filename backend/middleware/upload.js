// middleware/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
// Cloudinary Config
cloudinary.config({ 
  cloud_name: 'dc93tf6uf', 
  api_key: '712382633241427', 
  api_secret: 'RMjpwrbP1gspJ2dkjlnf3qCerKY'
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,   // ✅ Use actual cloudinary instance
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf", "pptx"],
  },
});

// Multer Upload Middleware
const upload = multer({ storage });

module.exports = upload;

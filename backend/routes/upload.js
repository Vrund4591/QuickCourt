const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
router.post('/single', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', req.file ? 'File present' : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No image file provided' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Convert buffer to base64
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'quickcourt',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('Cloudinary upload successful:', result.secure_url);

    res.json({ 
      success: true, 
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Upload multiple images
router.post('/multiple', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: true, message: 'No image files provided' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const base64String = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64String}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'quickcourt',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({ 
      success: true, 
      images: uploadResults
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: true, message: 'Failed to upload images' });
  }
});

// Delete image
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Replace dots with slashes for nested folder structure
    const formattedPublicId = publicId.replace(/\./g, '/');
    
    await cloudinary.uploader.destroy(formattedPublicId);
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: true, message: 'Failed to delete image' });
  }
});

module.exports = router;

import express from 'express';
import { cloudinary, upload } from '../utils/cloudinary.js';
import { verifyToken } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/upload', verifyToken, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine media type based on mimetype
    let mediaType = 'document';
    let resourceType = 'raw';
    if (req.file.mimetype.startsWith('image/')) {
      mediaType = 'image';
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
      resourceType = 'video';
    }

    // Upload buffer to Cloudinary manually (multer v2 compatible)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chatx_media',
          resource_type: resourceType
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      mediaUrl: uploadResult.secure_url,
      mediaType: mediaType
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

export default router;

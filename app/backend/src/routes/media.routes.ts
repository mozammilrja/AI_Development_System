import { Router } from 'express';
import { MediaController } from '../controllers/media.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

// All routes require authentication
router.use(authMiddleware);

// Upload avatar
router.post('/avatar', upload.single('file'), MediaController.uploadAvatar);

// Get presigned upload URL
router.get('/upload-url/:conversationId', MediaController.getUploadUrl);

// Get presigned download URL
router.get('/download-url/:objectName(*)', MediaController.getDownloadUrl);

// Upload endpoints for specific media types
router.post('/:conversationId/file', upload.single('file'), MediaController.uploadFile);
router.post('/:conversationId/image', upload.single('file'), MediaController.uploadImage);
router.post('/:conversationId/voice', upload.single('file'), MediaController.uploadVoice);
router.post('/:conversationId/video', upload.single('file'), MediaController.uploadVideo);

// Delete media
router.delete('/', MediaController.deleteMedia);

export default router;

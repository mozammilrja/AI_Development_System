import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
    files: 10, // Max 10 files per upload
  },
});

// All routes require authentication
router.use(authMiddleware);

// Search messages
router.get('/search', MessageController.search);

// Get messages for a conversation
router.get('/conversation/:conversationId', MessageController.list);

// Get unread count
router.get('/conversation/:conversationId/unread', MessageController.getUnreadCount);

// Mark messages as read
router.post('/conversation/:conversationId/read/:messageId', MessageController.markAsRead);

// Send message (text only)
router.post('/conversation/:conversationId', MessageController.send);

// Send message with media files
router.post(
  '/conversation/:conversationId/media',
  upload.array('files', 10),
  MessageController.sendWithMedia
);

// Get thread messages
router.get('/:messageId/thread', MessageController.getThread);

// Edit message
router.patch('/:messageId', MessageController.edit);

// Delete message
router.delete('/:messageId', MessageController.delete);

// Reactions
router.post('/:messageId/reactions', MessageController.addReaction);
router.delete('/:messageId/reactions', MessageController.removeReaction);

export default router;

import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// List user's conversations
router.get('/', ConversationController.list);

// Search public channels
router.get('/search', ConversationController.searchChannels);

// Create a new conversation
router.post('/', ConversationController.create);

// Get specific conversation
router.get('/:conversationId', ConversationController.getById);

// Update conversation
router.patch('/:conversationId', ConversationController.update);

// Leave conversation
router.post('/:conversationId/leave', ConversationController.leave);

// Mute/unmute conversation
router.post('/:conversationId/mute', ConversationController.mute);

// Member management
router.post('/:conversationId/members', ConversationController.addMember);
router.delete('/:conversationId/members/:memberId', ConversationController.removeMember);
router.patch('/:conversationId/members/:memberId/role', ConversationController.updateMemberRole);

// Pin management
router.post('/:conversationId/pin/:messageId', ConversationController.pinMessage);

export default router;

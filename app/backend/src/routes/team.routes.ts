import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Team CRUD
router.get('/', teamController.getTeams);
router.post('/', teamController.createTeam);
router.get('/:id', teamController.getTeam);
router.patch('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

// Team members
router.post('/:id/invites', teamController.inviteMember);
router.get('/:id/invites', teamController.getTeamInvites);
router.delete('/:id/members/:userId', teamController.removeMember);
router.post('/:id/leave', teamController.leaveTeam);

// User invites
router.get('/invites/pending', teamController.getPendingInvites);
router.post('/invites/:id/accept', teamController.acceptInvite);
router.post('/invites/:id/decline', teamController.declineInvite);

export default router;

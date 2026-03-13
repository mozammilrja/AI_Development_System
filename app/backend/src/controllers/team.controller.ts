import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/team.service.js';

export class TeamController {
  async getTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const teams = await teamService.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      next(error);
    }
  }

  async getTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.json(team);
    } catch (error) {
      next(error);
    }
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { name, description } = req.body;
      const team = await teamService.createTeam(userId, { name, description });
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const team = await teamService.updateTeam(id, { name, description });
      res.json(team);
    } catch (error) {
      next(error);
    }
  }

  async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await teamService.deleteTeam(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { email, role } = req.body;
      const invite = await teamService.inviteMember(id, userId, email, role);
      res.status(201).json(invite);
    } catch (error) {
      next(error);
    }
  }

  async getTeamInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invites = await teamService.getTeamInvites(id);
      res.json(invites);
    } catch (error) {
      next(error);
    }
  }

  async getPendingInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const email = (req as any).user.email;
      const invites = await teamService.getPendingInvites(email);
      res.json(invites);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const invite = await teamService.acceptInvite(id, userId);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async declineInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invite = await teamService.declineInvite(id);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      await teamService.removeMember(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async leaveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      await teamService.leaveTeam(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();

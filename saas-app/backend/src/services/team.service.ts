import { Team, type TeamRole } from '../models/Team.js';
import { Invite, type InviteStatus } from '../models/Invite.js';
import { User } from '../models/User.js';

export class TeamService {
  async getUserTeams(userId: string) {
    const teams = await Team.find({
      'members.userId': userId,
    }).populate('members.user', 'name email avatar');
    
    return teams;
  }

  async getTeam(teamId: string) {
    const team = await Team.findById(teamId)
      .populate('members.user', 'name email avatar');
    
    return team;
  }

  async createTeam(userId: string, data: { name: string; description?: string }) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const team = await Team.create({
      name: data.name,
      slug: `${slug}-${Date.now()}`,
      description: data.description,
      ownerId: userId,
      members: [
        {
          userId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });
    
    return team;
  }

  async updateTeam(teamId: string, data: Partial<{ name: string; description: string }>) {
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $set: data },
      { new: true }
    );
    
    return team;
  }

  async deleteTeam(teamId: string) {
    await Team.findByIdAndDelete(teamId);
    await Invite.deleteMany({ teamId });
  }

  async inviteMember(teamId: string, invitedBy: string, email: string, role: TeamRole) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    // Check if already a member
    if (existingUser) {
      const team = await Team.findById(teamId);
      const isMember = team?.members.some(m => m.userId.toString() === existingUser._id.toString());
      if (isMember) {
        throw new Error('User is already a team member');
      }
    }
    
    // Check for existing pending invite
    const existingInvite = await Invite.findOne({
      teamId,
      email,
      status: 'pending',
    });
    
    if (existingInvite) {
      throw new Error('Invitation already sent to this email');
    }
    
    const invite = await Invite.create({
      teamId,
      email,
      role,
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    return invite;
  }

  async getTeamInvites(teamId: string) {
    const invites = await Invite.find({ teamId });
    return invites;
  }

  async getPendingInvites(email: string) {
    const invites = await Invite.find({
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('team');
    
    return invites;
  }

  async acceptInvite(inviteId: string, userId: string) {
    const invite = await Invite.findById(inviteId);
    
    if (!invite || invite.status !== 'pending') {
      throw new Error('Invalid or expired invitation');
    }
    
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      throw new Error('Invitation has expired');
    }
    
    // Add user to team
    await Team.findByIdAndUpdate(invite.teamId, {
      $push: {
        members: {
          userId,
          role: invite.role,
          joinedAt: new Date(),
        },
      },
    });
    
    invite.status = 'accepted';
    await invite.save();
    
    return invite;
  }

  async declineInvite(inviteId: string) {
    const invite = await Invite.findByIdAndUpdate(
      inviteId,
      { status: 'declined' },
      { new: true }
    );
    
    return invite;
  }

  async removeMember(teamId: string, userId: string) {
    await Team.findByIdAndUpdate(teamId, {
      $pull: {
        members: { userId },
      },
    });
  }

  async leaveTeam(teamId: string, userId: string) {
    const team = await Team.findById(teamId);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    if (team.ownerId.toString() === userId) {
      throw new Error('Owner cannot leave the team. Transfer ownership first.');
    }
    
    await this.removeMember(teamId, userId);
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamRole) {
    await Team.findOneAndUpdate(
      { _id: teamId, 'members.userId': userId },
      { $set: { 'members.$.role': role } }
    );
  }
}

export const teamService = new TeamService();

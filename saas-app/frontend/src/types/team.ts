export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Invite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  team?: Team;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: TeamRole;
}

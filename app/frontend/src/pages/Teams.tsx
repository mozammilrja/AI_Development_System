import { useState } from 'react';
import { AppLayout } from '../components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Badge,
  Modal,
  ModalTitle,
  ModalDescription,
  Input,
  Avatar,
} from '../components/ui';
import { useTeams, useCreateTeam, useTeam, useInviteMember } from '../hooks';
import { useTeamStore } from '../stores';
import type { Team, TeamRole } from '../types';

export function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleCreateTeam = async (data: { name: string; description?: string }) => {
    await createTeam.mutateAsync(data);
    setShowCreateModal(false);
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-500 mt-1">
              Manage your teams and collaborate with others.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : teams?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No teams yet</h3>
              <p className="text-gray-500 mb-4">
                Create a team to start collaborating with others.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>Create your first team</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams?.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar name={team.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {team.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="info">{team.members.length} members</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewTeam(team)}>
                    View Team
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Create Team Modal */}
        <CreateTeamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
          isLoading={createTeam.isPending}
        />

        {/* Team Detail Modal */}
        {selectedTeam && (
          <TeamDetailModal
            team={selectedTeam}
            isOpen={showTeamModal}
            onClose={() => {
              setShowTeamModal(false);
              setSelectedTeam(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  isLoading: boolean;
}

function CreateTeamModal({ isOpen, onClose, onSubmit, isLoading }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description: description || undefined });
    setName('');
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalTitle>Create Team</ModalTitle>
        <ModalDescription>
          Create a new team to collaborate with others.
        </ModalDescription>

        <div className="mt-4 space-y-4">
          <Input
            label="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Team"
            required
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this team for?"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface TeamDetailModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
  const inviteMember = useInviteMember(team.id);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole });
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="flex items-center gap-4 mb-4">
        <Avatar name={team.name} size="lg" />
        <div>
          <ModalTitle>{team.name}</ModalTitle>
          {team.description && (
            <p className="text-sm text-gray-500 mt-1">{team.description}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Members ({team.members.length})</h4>
          <Button size="sm" variant="outline" onClick={() => setShowInvite(!showInvite)}>
            Invite
          </Button>
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" isLoading={inviteMember.isPending}>
                Send
              </Button>
            </div>
          </form>
        )}

        <ul className="space-y-2">
          {team.members.map((member) => (
            <li key={member.userId} className="flex items-center gap-3 py-2">
              <Avatar name={member.user?.name} src={member.user?.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.user?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
              </div>
              <Badge
                variant={
                  member.role === 'owner'
                    ? 'warning'
                    : member.role === 'admin'
                    ? 'info'
                    : 'default'
                }
              >
                {member.role}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

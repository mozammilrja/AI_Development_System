import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useTeamStore } from '../stores';
import type { Team, Invite, CreateTeamRequest, InviteMemberRequest } from '../types';

export function useTeams() {
  const setTeams = useTeamStore((state) => state.setTeams);

  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const teams = await api.get<Team[]>('/teams');
      setTeams(teams);
      return teams;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => api.get<Team>(`/teams/${teamId}`),
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const addTeam = useTeamStore((state) => state.addTeam);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamRequest) => api.post<Team>('/teams', data),
    onSuccess: (team) => {
      addTeam(team);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam(teamId: string) {
  const updateTeam = useTeamStore((state) => state.updateTeam);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Team>) => api.patch<Team>(`/teams/${teamId}`, data),
    onSuccess: (team) => {
      updateTeam(teamId, team);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
}

export function useDeleteTeam(teamId: string) {
  const removeTeam = useTeamStore((state) => state.removeTeam);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(`/teams/${teamId}`),
    onSuccess: () => {
      removeTeam(teamId);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useInviteMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberRequest) =>
      api.post<Invite>(`/teams/${teamId}/invites`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamInvites', teamId] });
    },
  });
}

export function useTeamInvites(teamId: string) {
  return useQuery({
    queryKey: ['teamInvites', teamId],
    queryFn: () => api.get<Invite[]>(`/teams/${teamId}/invites`),
    enabled: !!teamId,
  });
}

export function usePendingInvites() {
  return useQuery({
    queryKey: ['pendingInvites'],
    queryFn: () => api.get<Invite[]>('/teams/invites/pending'),
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => api.post(`/teams/invites/${inviteId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => api.post(`/teams/invites/${inviteId}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
    },
  });
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.delete(`/teams/${teamId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
}

export function useLeaveTeam(teamId: string) {
  const removeTeam = useTeamStore((state) => state.removeTeam);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(`/teams/${teamId}/leave`),
    onSuccess: () => {
      removeTeam(teamId);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

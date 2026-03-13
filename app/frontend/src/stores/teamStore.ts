import { create } from 'zustand';
import type { Team } from '../types';

interface TeamState {
  currentTeam: Team | null;
  teams: Team[];
  isLoading: boolean;

  // Actions
  setCurrentTeam: (team: Team | null) => void;
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTeamStore = create<TeamState>()((set) => ({
  currentTeam: null,
  teams: [],
  isLoading: false,

  setCurrentTeam: (currentTeam) => set({ currentTeam }),

  setTeams: (teams) => set({ teams }),

  addTeam: (team) =>
    set((state) => ({
      teams: [...state.teams, team],
    })),

  updateTeam: (teamId, updates) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, ...updates } : t
      ),
      currentTeam:
        state.currentTeam?.id === teamId
          ? { ...state.currentTeam, ...updates }
          : state.currentTeam,
    })),

  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
      currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

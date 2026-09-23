import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface TeamMember {
  id: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    college?: string | null;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  hackathonId?: string | null;
  maxMembers: number;
  qrCode?: string | null;
  members: TeamMember[];
  createdAt: string;
}

export interface TeamsState {
  teams: Team[];
  activeTeam: Team | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchTeams: () => Promise<void>;
  fetchTeamById: (id: string) => Promise<Team | null>;
  createTeam: (data: { name: string; description?: string; projectId?: string; maxMembers?: number }) => Promise<Team | null>;
  joinTeamWithQr: (teamId: string, qrToken: string) => Promise<{ success: boolean; message?: string }>;
}

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'tm-1',
    name: 'VectorPulse Hackers',
    description: 'Building multimodal AI assistants for smart city transport at HackMIT 2026.',
    hackathonId: 'hack-1',
    maxMembers: 4,
    qrCode: 'qr-token-abc-123',
    members: [
      {
        id: 'm-1',
        userId: 'u-1',
        role: 'leader',
        joinedAt: new Date().toISOString(),
        user: {
          id: 'u-1',
          name: 'Alex Johnson',
          email: 'alex@college.edu',
          college: 'Stanford University',
        },
      },
      {
        id: 'm-2',
        userId: 'u-2',
        role: 'member',
        joinedAt: new Date().toISOString(),
        user: {
          id: 'u-2',
          name: 'Elena Rostova',
          email: 'elena@mit.edu',
          college: 'MIT',
        },
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tm-2',
    name: 'ZeroKnowledge Guild',
    description: 'On-chain privacy identity and verifiable student credential verification.',
    hackathonId: 'hack-2',
    maxMembers: 5,
    qrCode: 'qr-token-xyz-789',
    members: [
      {
        id: 'm-3',
        userId: 'u-3',
        role: 'leader',
        joinedAt: new Date().toISOString(),
        user: {
          id: 'u-3',
          name: 'Marcus Chen',
          email: 'marcus@berkeley.edu',
          college: 'UC Berkeley',
        },
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: DEFAULT_TEAMS,
  activeTeam: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Team[]>('/teams');
      const realTeams = Array.isArray(response.data) ? response.data : [];
      const realIds = new Set(realTeams.map((t) => t.id));
      const merged = [
        ...realTeams,
        ...DEFAULT_TEAMS.filter((t) => !realIds.has(t.id)),
      ];
      set({ teams: merged, isLoading: false });
    } catch {
      // High-fidelity fallback data
      set({
        teams: DEFAULT_TEAMS,
        isLoading: false,
      });
    }
  },

  fetchTeamById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Team>(`/teams/${id}`);
      set({ activeTeam: response.data, isLoading: false });
      return response.data;
    } catch {
      const existing = get().teams.find((t) => t.id === id) || null;
      set({ activeTeam: existing, isLoading: false });
      return existing;
    }
  },

  createTeam: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await apiClient.post<Team>('/teams', data);
      const newTeam = response.data;
      set({
        teams: [newTeam, ...get().teams],
        activeTeam: newTeam,
        isSaving: false,
      });
      return newTeam;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.response?.data?.message || 'Failed to create team.',
      });
      return null;
    }
  },

  joinTeamWithQr: async (teamId: string, qrToken: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(`/teams/${teamId}/join`, { qrToken });
      await get().fetchTeams();
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid or expired QR token.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },
}));

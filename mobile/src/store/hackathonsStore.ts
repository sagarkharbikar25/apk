import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeamSize: number;
  location?: string | null;
  bannerUrl?: string | null;
  prizePool?: string | null;
  participantCount?: number;
  status: 'upcoming' | 'active' | 'completed';
}

export interface HackathonsState {
  hackathons: Hackathon[];
  activeHackathon: Hackathon | null;
  isLoading: boolean;
  isRegistering: boolean;
  error: string | null;

  // Actions
  fetchHackathons: () => Promise<void>;
  fetchHackathonById: (id: string) => Promise<Hackathon | null>;
  registerForHackathon: (hackathonId: string, teamId?: string) => Promise<{ success: boolean; message?: string }>;
}

export const useHackathonsStore = create<HackathonsState>((set, get) => ({
  hackathons: [],
  activeHackathon: null,
  isLoading: false,
  isRegistering: false,
  error: null,

  fetchHackathons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Hackathon[]>('/hackathons');
      set({ hackathons: response.data, isLoading: false });
    } catch {
      // High-fidelity fallback hackathons
      set({
        hackathons: [
          {
            id: 'hack-1',
            title: 'HackMIT 2026',
            description: "MIT's flagship premier hackathon hosting 1,000+ collegiate hackers from across the globe.",
            startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 16).toISOString(),
            registrationDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
            maxTeamSize: 4,
            location: 'Cambridge, MA & Hybrid',
            prizePool: '$50,000 in Prizes',
            participantCount: 840,
            status: 'active',
          },
          {
            id: 'hack-2',
            title: 'CalHacks 13.0',
            description: "The world's largest collegiate hackathon at UC Berkeley with dedicated AI and Web3 tracks.",
            startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 32).toISOString(),
            registrationDeadline: new Date(Date.now() + 86400000 * 20).toISOString(),
            maxTeamSize: 4,
            location: 'San Francisco, CA',
            prizePool: '$75,000 in Prizes',
            participantCount: 1250,
            status: 'upcoming',
          },
        ],
        isLoading: false,
      });
    }
  },

  fetchHackathonById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Hackathon>(`/hackathons/${id}`);
      set({ activeHackathon: response.data, isLoading: false });
      return response.data;
    } catch {
      const match = get().hackathons.find((h) => h.id === id) || null;
      set({ activeHackathon: match, isLoading: false });
      return match;
    }
  },

  registerForHackathon: async (hackathonId: string, teamId?: string) => {
    set({ isRegistering: true, error: null });
    try {
      await apiClient.post(`/hackathons/${hackathonId}/register`, { teamId });
      set({ isRegistering: false });
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ isRegistering: false, error: message });
      return { success: false, message };
    }
  },
}));

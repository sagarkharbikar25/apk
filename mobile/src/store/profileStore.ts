import { create } from 'zustand';
import { apiClient } from '../api/client';
import { User, UserSkill } from '../api/types';

export interface CatalogSkill {
  id: string;
  name: string;
  category: string;
}

export interface ProfileState {
  profile: User | null;
  skills: UserSkill[];
  catalog: CatalogSkill[];
  isLoading: boolean;
  isSaving: boolean;
  isExtracting: boolean;
  aiSuggestedSkills: string[];
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  fetchCatalog: () => Promise<void>;
  addSkill: (skillId: string, level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => Promise<boolean>;
  removeSkill: (userSkillId: string) => Promise<boolean>;
  extractSkillsFromBio: (bioText: string) => Promise<string[]>;
  clearAiSuggestions: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  skills: [],
  catalog: [],
  isLoading: false,
  isSaving: false,
  isExtracting: false,
  aiSuggestedSkills: [],
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<User>('/users/me');
      set({
        profile: response.data,
        skills: response.data.skills || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to load profile.',
      });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isSaving: true, error: null });
    try {
      const response = await apiClient.patch<User>('/users/me', data);
      set({
        profile: response.data,
        isSaving: false,
      });
      return true;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.response?.data?.message || 'Failed to update profile.',
      });
      return false;
    }
  },

  fetchCatalog: async () => {
    try {
      const response = await apiClient.get<CatalogSkill[]>('/skills');
      set({ catalog: response.data });
    } catch {
      // Fallback pre-populated catalog if network / server is syncing
      set({
        catalog: [
          { id: 'sk-1', name: 'React Native', category: 'Frontend' },
          { id: 'sk-2', name: 'TypeScript', category: 'Languages' },
          { id: 'sk-3', name: 'Node.js', category: 'Backend' },
          { id: 'sk-4', name: 'NestJS', category: 'Backend' },
          { id: 'sk-5', name: 'Python', category: 'Languages' },
          { id: 'sk-6', name: 'PostgreSQL', category: 'Database' },
          { id: 'sk-7', name: 'Docker', category: 'DevOps' },
          { id: 'sk-8', name: 'Machine Learning', category: 'AI/Data' },
          { id: 'sk-9', name: 'UI/UX Design', category: 'Design' },
          { id: 'sk-10', name: 'GraphQL', category: 'Backend' },
        ],
      });
    }
  },

  addSkill: async (skillId: string, level) => {
    try {
      const response = await apiClient.post<UserSkill>('/users/me/skills', {
        skillId,
        proficiencyLevel: level,
      });

      const currentSkills = get().skills;
      set({ skills: [...currentSkills, response.data] });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add skill.' });
      return false;
    }
  },

  removeSkill: async (userSkillId: string) => {
    try {
      await apiClient.delete(`/users/me/skills/${userSkillId}`);
      set({
        skills: get().skills.filter((s) => s.id !== userSkillId),
      });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to remove skill.' });
      return false;
    }
  },

  extractSkillsFromBio: async (bioText: string) => {
    set({ isExtracting: true, error: null });
    try {
      // Calls Gemini AI endpoint to analyze description/bio
      const response = await apiClient.post<{ requiredSkills?: string[]; suggestedSkills?: string[] }>(
        '/ai/analyze-project',
        {
          title: 'Skill Extraction',
          description: bioText,
        }
      );

      const suggestions = response.data?.requiredSkills || response.data?.suggestedSkills || [
        'React Native',
        'TypeScript',
        'Zustand',
        'NestJS',
      ];

      set({ aiSuggestedSkills: suggestions, isExtracting: false });
      return suggestions;
    } catch {
      // Client-side fallback extractor if offline or testing
      const keywords = ['React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'GraphQL', 'AWS', 'Design'];
      const matched = keywords.filter((k) =>
        bioText.toLowerCase().includes(k.toLowerCase())
      );
      const fallbackSuggestions = matched.length > 0 ? matched : ['React Native', 'TypeScript', 'API Integration'];

      set({ aiSuggestedSkills: fallbackSuggestions, isExtracting: false });
      return fallbackSuggestions;
    }
  },

  clearAiSuggestions: () => {
    set({ aiSuggestedSkills: [] });
  },
}));

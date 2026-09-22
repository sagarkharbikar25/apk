import { useProfileStore } from '../src/store/profileStore';
import { apiClient } from '../src/api/client';

jest.mock('../src/api/client', () => {
  return {
    apiClient: {
      get: jest.fn(),
      patch: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      defaults: { baseURL: 'http://10.0.2.2:3000' },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
    setupApiClientAuth: jest.fn(),
    setApiBaseUrl: jest.fn(),
  };
});

describe('Phase 3: Profile & Skills Management Unit Tests', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: null,
      skills: [],
      catalog: [],
      isLoading: false,
      isSaving: false,
      isExtracting: false,
      aiSuggestedSkills: [],
      error: null,
    });
    jest.clearAllMocks();
  });

  it('fetches user profile and populates skills', async () => {
    const mockProfile = {
      id: 'u-10',
      email: 'builder@college.edu',
      name: 'Sam Hacker',
      role: 'student' as const,
      bio: 'Full stack mobile engineer',
      skills: [
        {
          id: 'us-1',
          skillId: 'sk-1',
          proficiencyLevel: 'advanced' as const,
          skill: { id: 'sk-1', name: 'React Native' },
        },
      ],
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    await useProfileStore.getState().fetchProfile();

    const state = useProfileStore.getState();
    expect(state.profile?.name).toBe('Sam Hacker');
    expect(state.skills.length).toBe(1);
    expect(state.skills[0].skill.name).toBe('React Native');
  });

  it('updates profile and updates state', async () => {
    const updatedUser = {
      id: 'u-10',
      email: 'builder@college.edu',
      name: 'Sam Hacker',
      role: 'student' as const,
      bio: 'Updated bio with NestJS expertise',
      availableHoursWeek: 25,
    };

    (apiClient.patch as jest.Mock).mockResolvedValueOnce({ data: updatedUser });

    const success = await useProfileStore.getState().updateProfile({
      bio: 'Updated bio with NestJS expertise',
      availableHoursWeek: 25,
    });

    expect(success).toBe(true);
    expect(useProfileStore.getState().profile?.availableHoursWeek).toBe(25);
  });

  it('adds and removes skills', async () => {
    const newSkill = {
      id: 'us-2',
      skillId: 'sk-2',
      proficiencyLevel: 'expert' as const,
      skill: { id: 'sk-2', name: 'TypeScript' },
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: newSkill });
    const addSuccess = await useProfileStore.getState().addSkill('sk-2', 'expert');
    expect(addSuccess).toBe(true);
    expect(useProfileStore.getState().skills.length).toBe(1);

    (apiClient.delete as jest.Mock).mockResolvedValueOnce({});
    const removeSuccess = await useProfileStore.getState().removeSkill('us-2');
    expect(removeSuccess).toBe(true);
    expect(useProfileStore.getState().skills.length).toBe(0);
  });

  it('extracts skills from bio via AI endpoint and populates suggestions', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        requiredSkills: ['React Native', 'Zustand', 'TypeScript'],
      },
    });

    const suggestions = await useProfileStore
      .getState()
      .extractSkillsFromBio('Experienced in React Native, Zustand and TypeScript architecture');

    expect(suggestions).toEqual(['React Native', 'Zustand', 'TypeScript']);
    expect(useProfileStore.getState().aiSuggestedSkills).toEqual([
      'React Native',
      'Zustand',
      'TypeScript',
    ]);

    useProfileStore.getState().clearAiSuggestions();
    expect(useProfileStore.getState().aiSuggestedSkills).toEqual([]);
  });
});

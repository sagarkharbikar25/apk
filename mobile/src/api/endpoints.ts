import { apiClient } from './client';
import { User, UserSkill, RecommendationItem } from './types';

// Users
export const usersApi = {
  getMe: () => apiClient.get<User>('/users/me').then(r => r.data),
  updateMe: (data: Partial<User>) => apiClient.patch<User>('/users/me', data).then(r => r.data),
  getPublicProfile: (userId: string) => apiClient.get<User>(`/users/${userId}/profile`).then(r => r.data),
};

// Skills
export const skillsApi = {
  getAll: () => apiClient.get<{id: string, name: string}[]>('/skills').then(r => r.data),
  updateMySkills: (skills: { skillId: string, level: string }[]) => apiClient.post<UserSkill[]>('/skills/me', { skills }).then(r => r.data),
  extractFromBio: (bio: string) => apiClient.post<{skills: string[]}>('/ai/extract-skills', { text: bio }).then(r => r.data),
};

// Hackathons
export const hackathonsApi = {
  getAll: () => apiClient.get('/hackathons').then(r => r.data),
  getById: (id: string) => apiClient.get(`/hackathons/${id}`).then(r => r.data),
  register: (id: string) => apiClient.post(`/hackathons/${id}/register`).then(r => r.data),
};

// Teams
export const teamsApi = {
  getMyTeams: () => apiClient.get('/teams/my-teams').then(r => r.data),
  getById: (id: string) => apiClient.get(`/teams/${id}`).then(r => r.data),
  create: (data: any) => apiClient.post('/teams', data).then(r => r.data),
  join: (teamId: string) => apiClient.post(`/teams/${teamId}/join`).then(r => r.data),
  leave: (teamId: string) => apiClient.post(`/teams/${teamId}/leave`).then(r => r.data),
  getRecommendations: (teamId: string) => apiClient.get<RecommendationItem[]>(`/teams/${teamId}/recommendations`).then(r => r.data),
};

// Notifications
export const notificationsApi = {
  getAll: () => apiClient.get('/notifications').then(r => r.data),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => apiClient.patch('/notifications/read-all').then(r => r.data),
  acceptInvite: (id: string) => apiClient.post(`/notifications/${id}/accept`).then(r => r.data),
  declineInvite: (id: string) => apiClient.post(`/notifications/${id}/decline`).then(r => r.data),
};

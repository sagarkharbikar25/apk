export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'organizer' | 'admin';
  college?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  availableHoursWeek?: number;
  lookingFor?: 'teammate' | 'project' | 'both';
  isVerified?: boolean;
  skills?: UserSkill[];
  createdAt?: string;
}

export interface UserSkill {
  id: string;
  skillId: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skill: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RecommendationBreakdown {
  skillCoverage: number; // weight: 0.40
  complementarySkills: number; // weight: 0.25
  availabilityMatch: number; // weight: 0.15
  interestOverlap: number; // weight: 0.10
  experienceLevel: number; // weight: 0.10
}

export interface RecommendationItem {
  id: string;
  type: 'candidate' | 'project';
  title: string;
  subtitle: string;
  description: string;
  avatarUrl?: string | null;
  matchScore: number; // 0.0 to 1.0
  breakdown: RecommendationBreakdown;
  skills: string[];
  aiReasoning: string[];
  college?: string;
  availableHoursWeek?: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProjectAnalysisResult {
  skills: string[];
  domain: string;
  roles: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
}

export interface SkillGapResult {
  missingSkills: string[];
  matchingSkills: string[];
  coveragePercentage: number;
  learningPathSuggestions: string[];
}

export interface EnrichedCandidateReason {
  candidateId: string;
  reasons: string[];
  fitSummary: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.6-flash';
    if (apiKey && apiKey !== 'mock-key' && apiKey !== 'test') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Gemini AI: ${err.message}`);
      }
    }
  }

  /**
   * Helper to execute Gemini prompt with strict JSON response handling
   */
  async generateJson<T>(prompt: string, fallback: T): Promise<T> {
    if (!this.model) {
      this.logger.warn('Gemini model not initialized; returning fallback JSON');
      return fallback;
    }

    try {
      const response = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.response.text();
      // Remove any accidental markdown backticks if model wrapped JSON
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      this.logger.error(`Error calling Gemini API: ${err.message}. Using fallback.`);
      return fallback;
    }
  }

  /**
   * Analyzes project title and description to extract required skills, domain, and roles
   */
  async analyzeProject(title: string, description: string): Promise<ProjectAnalysisResult> {
    const fallback: ProjectAnalysisResult = {
      skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
      domain: 'Fullstack / Web App',
      roles: ['Backend Developer', 'Frontend Developer'],
      difficulty: 'Intermediate',
      summary: `${title}: ${description.slice(0, 120)}...`,
    };

    const prompt = `
You are an expert technical recruiter and software architect.
Analyze the following project title and description:
Project Title: "${title}"
Project Description: "${description}"

Return a strict JSON object with this exact schema:
{
  "skills": ["Skill1", "Skill2", "Skill3"],
  "domain": "Domain or Category (e.g. AI / Mobile / FinTech / Web3)",
  "roles": ["Suggested Role 1", "Suggested Role 2"],
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "summary": "Brief 1-2 sentence executive summary of project goals and scope"
}
Output only valid JSON. Do not include extra text.
`;

    return this.generateJson<ProjectAnalysisResult>(prompt, fallback);
  }

  /**
   * Generates tailored learning recommendations for missing skills
   */
  async getSkillGapSuggestions(
    missingSkills: string[],
    matchingSkills: string[],
  ): Promise<string[]> {
    if (missingSkills.length === 0) {
      return ['You meet 100% of the required skills for this project!'];
    }

    const fallback = missingSkills.map(
      (s) => `Study fundamentals and build a mini-project focusing on ${s}.`,
    );

    const prompt = `
A developer is looking to join a project.
Matching Skills: ${JSON.stringify(matchingSkills)}
Missing Skills: ${JSON.stringify(missingSkills)}

Suggest concise, actionable learning roadmaps or suggestions (1 sentence per missing skill) for mastering the missing skills.
Return a strict JSON array of strings:
["Suggestion 1", "Suggestion 2", ...]
Output only valid JSON.
`;

    return this.generateJson<string[]>(prompt, fallback);
  }

  /**
   * Enriches candidate recommendations with AI reasoning
   */
  async enrichCandidates(
    projectTitle: string,
    candidates: {
      userId: string;
      displayName: string;
      matchedSkills: string[];
      score: number;
    }[],
  ): Promise<EnrichedCandidateReason[]> {
    const fallback: EnrichedCandidateReason[] = candidates.map((c) => ({
      candidateId: c.userId,
      reasons: [
        `Strong match with skills: ${c.matchedSkills.join(', ') || 'related background'}`,
        `Compatibility score: ${(c.score * 100).toFixed(0)}%`,
      ],
      fitSummary: `${c.displayName} brings key relevant competencies to ${projectTitle}.`,
    }));

    if (!this.model || candidates.length === 0) {
      return fallback;
    }

    const prompt = `
For project "${projectTitle}", we scored the following candidate developers:
${JSON.stringify(
  candidates.map((c) => ({
    id: c.userId,
    name: c.displayName,
    skills: c.matchedSkills,
    matchScore: c.score,
  })),
)}

Provide 2-3 brief reasons and a 1-sentence fit summary for why each candidate is suited for this project.
Return a strict JSON array of objects with schema:
[
  {
    "candidateId": "userId",
    "reasons": ["Reason 1", "Reason 2"],
    "fitSummary": "Brief fit summary sentence"
  }
]
`;

    const result = await this.generateJson<EnrichedCandidateReason[]>(prompt, fallback);
    return Array.isArray(result) && result.length > 0 ? result : fallback;
  }
}

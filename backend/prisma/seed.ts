import { PrismaClient, Role, SkillLevel, LookingFor, ProjectStatus, ProjectType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SKILLS_TAXONOMY = [
  // Mobile Development
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Kotlin', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },
  { name: 'Android SDK', category: 'Mobile' },
  { name: 'iOS SDK', category: 'Mobile' },
  { name: 'Expo', category: 'Mobile' },

  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'TailwindCSS', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Svelte', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Go', category: 'Backend' },
  { name: 'Java', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Rust', category: 'Backend' },
  { name: 'GraphQL', category: 'Backend' },

  // Database
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Prisma ORM', category: 'Database' },
  { name: 'Supabase DB', category: 'Database' },
  { name: 'Firebase Firestore', category: 'Database' },

  // AI & Machine Learning
  { name: 'Google Gemini', category: 'AI/ML' },
  { name: 'OpenAI API', category: 'AI/ML' },
  { name: 'PyTorch', category: 'AI/ML' },
  { name: 'TensorFlow', category: 'AI/ML' },
  { name: 'LangChain', category: 'AI/ML' },
  { name: 'Computer Vision', category: 'AI/ML' },
  { name: 'Natural Language Processing', category: 'AI/ML' },

  // UI/UX & Design
  { name: 'Figma', category: 'Design' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Design Systems', category: 'Design' },

  // Cloud & DevOps
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'GitHub Actions', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Google Cloud Platform', category: 'Cloud' },
  { name: 'Supabase', category: 'Cloud' },
  { name: 'Firebase', category: 'Cloud' },
  { name: 'Vercel', category: 'Cloud' },

  // Security & Web3
  { name: 'Cybersecurity', category: 'Security' },
  { name: 'Solidity', category: 'Blockchain' },
  { name: 'Web3.js', category: 'Blockchain' },
];

async function main() {
  console.log('🌱 Starting SkillSync database seeding...');

  // 1. Seed Skills Taxonomy
  console.log(`📦 Seeding ${SKILLS_TAXONOMY.length} skills across categories...`);
  const skillMap = new Map<string, string>();
  for (const skill of SKILLS_TAXONOMY) {
    const s = await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
    skillMap.set(s.name, s.id);
  }
  console.log(`✅ Seeded ${skillMap.size} skills.`);

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@SkillSync2026!', 12);
  const organizerPasswordHash = await bcrypt.hash('Organizer@2026!', 10);

  // 2. Seed Admin User
  const adminEmail = 'admin@skillsync.io';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.admin },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.admin,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'SkillSync Master Admin',
          bio: 'Platform Administrator & System Auditor',
          college: 'SkillSync HQ',
          location: 'San Francisco, CA',
        },
      },
    },
  });
  console.log(`✅ Admin ready: ${admin.email}`);

  // 3. Seed Organizer User
  const organizerEmail = 'organizer@skillsync.io';
  const organizer = await prisma.user.upsert({
    where: { email: organizerEmail },
    update: { role: Role.organizer },
    create: {
      email: organizerEmail,
      passwordHash: organizerPasswordHash,
      role: Role.organizer,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'TechFest Global Events',
          bio: 'Global Hackathon & Tech Innovation Summit Committee',
          college: 'Stanford Innovation Lab',
          location: 'Palo Alto, CA',
          preferredRoles: ['Hackathon Organizer', 'Event Director'],
        },
      },
    },
  });
  console.log(`✅ Organizer ready: ${organizer.email} (Password: Organizer@2026!)`);

  // 4. Seed 5 Diverse Student Users
  const studentSeeds = [
    {
      email: 'alex.chen@university.edu',
      displayName: 'Alex Chen',
      bio: 'Full-stack builder passionate about Mobile apps and Gemini AI integrations. Hackathon enthusiast.',
      college: 'UC Berkeley',
      graduationYear: 2026,
      location: 'Berkeley, CA',
      githubUrl: 'https://github.com/alexchen-dev',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
      lookingFor: LookingFor.both,
      preferredRoles: ['Full-Stack Developer', 'Mobile Lead'],
      hoursWeek: 20,
      skills: [
        { name: 'React Native', level: SkillLevel.expert },
        { name: 'TypeScript', level: SkillLevel.expert },
        { name: 'NestJS', level: SkillLevel.advanced },
        { name: 'Google Gemini', level: SkillLevel.advanced },
        { name: 'PostgreSQL', level: SkillLevel.intermediate },
      ],
    },
    {
      email: 'maya.patel@tech.edu',
      displayName: 'Maya Patel',
      bio: 'AI researcher and Python backend engineer. Working on intelligent recommendation engines.',
      college: 'Georgia Tech',
      graduationYear: 2025,
      location: 'Atlanta, GA',
      githubUrl: 'https://github.com/mayapatel-ai',
      linkedinUrl: 'https://linkedin.com/in/mayapatel',
      lookingFor: LookingFor.teammate,
      preferredRoles: ['AI/ML Engineer', 'Backend Specialist'],
      hoursWeek: 15,
      skills: [
        { name: 'Python', level: SkillLevel.expert },
        { name: 'PyTorch', level: SkillLevel.advanced },
        { name: 'FastAPI', level: SkillLevel.expert },
        { name: 'Google Gemini', level: SkillLevel.advanced },
        { name: 'Docker', level: SkillLevel.intermediate },
      ],
    },
    {
      email: 'sarah.kim@design.edu',
      displayName: 'Sarah Kim',
      bio: 'UI/UX Designer creating sleek, futuristic interfaces with obsidian dark themes and fluid animations.',
      college: 'Rhode Island School of Design',
      graduationYear: 2026,
      location: 'Providence, RI',
      githubUrl: 'https://github.com/sarahkim-ui',
      linkedinUrl: 'https://linkedin.com/in/sarahkimdesign',
      lookingFor: LookingFor.project,
      preferredRoles: ['UI/UX Designer', 'Product Designer'],
      hoursWeek: 12,
      skills: [
        { name: 'Figma', level: SkillLevel.expert },
        { name: 'UI/UX Design', level: SkillLevel.expert },
        { name: 'TailwindCSS', level: SkillLevel.advanced },
        { name: 'Design Systems', level: SkillLevel.expert },
        { name: 'React', level: SkillLevel.intermediate },
      ],
    },
    {
      email: 'marcus.vance@mit.edu',
      displayName: 'Marcus Vance',
      bio: 'Cloud architecture and DevOps fanatic. Kubernetes, Docker, and distributed systems.',
      college: 'MIT',
      graduationYear: 2025,
      location: 'Cambridge, MA',
      githubUrl: 'https://github.com/marcusvance',
      linkedinUrl: 'https://linkedin.com/in/marcusvance',
      lookingFor: LookingFor.both,
      preferredRoles: ['DevOps Engineer', 'Cloud Architect'],
      hoursWeek: 18,
      skills: [
        { name: 'Go', level: SkillLevel.advanced },
        { name: 'Docker', level: SkillLevel.expert },
        { name: 'Kubernetes', level: SkillLevel.advanced },
        { name: 'AWS', level: SkillLevel.expert },
        { name: 'PostgreSQL', level: SkillLevel.advanced },
      ],
    },
    {
      email: 'student@skillsync.io',
      displayName: 'Dev Demo Student',
      bio: 'Mobile & Web builder exploring AI-driven student platforms. Ready to win the next hackathon!',
      college: 'Stanford University',
      graduationYear: 2026,
      location: 'Stanford, CA',
      githubUrl: 'https://github.com/skillsync-dev',
      linkedinUrl: 'https://linkedin.com/in/skillsync-demo',
      lookingFor: LookingFor.both,
      preferredRoles: ['Frontend Developer', 'Mobile Engineer'],
      hoursWeek: 25,
      skills: [
        { name: 'React Native', level: SkillLevel.advanced },
        { name: 'TypeScript', level: SkillLevel.advanced },
        { name: 'Next.js', level: SkillLevel.advanced },
        { name: 'Supabase', level: SkillLevel.intermediate },
        { name: 'Redis', level: SkillLevel.intermediate },
      ],
    },
  ];

  const createdStudents: any[] = [];
  for (const seed of studentSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: { emailVerified: true },
      create: {
        email: seed.email,
        passwordHash: defaultPasswordHash,
        role: Role.student,
        emailVerified: true,
        profile: {
          create: {
            displayName: seed.displayName,
            bio: seed.bio,
            college: seed.college,
            graduationYear: seed.graduationYear,
            location: seed.location,
            githubUrl: seed.githubUrl,
            linkedinUrl: seed.linkedinUrl,
            lookingFor: seed.lookingFor,
            preferredRoles: seed.preferredRoles,
          },
        },
        availability: {
          create: {
            hoursWeek: seed.hoursWeek,
            startDate: new Date(),
            timezone: 'UTC-8',
          },
        },
      },
    });

    // Add user skills
    for (const skill of seed.skills) {
      const skillId = skillMap.get(skill.name);
      if (skillId) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId: {
              userId: user.id,
              skillId,
            },
          },
          update: { level: skill.level },
          create: {
            userId: user.id,
            skillId,
            level: skill.level,
          },
        });
      }
    }
    createdStudents.push(user);
    console.log(`✅ Seeded student: ${seed.displayName} (${seed.email})`);
  }

  // 5. Seed Hackathons
  const hackathonsData = [
    {
      title: 'AI In Action Global Hackathon 2026',
      description: 'Build cutting-edge multi-agent AI and mobile solutions to revolutionize student collaboration and campus tech.',
      organizerId: organizer.id,
      startDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      maxTeamSize: 4,
      isActive: true,
    },
    {
      title: 'Campus Web3 & Cloud Summit 2026',
      description: 'Design next-generation decentralized infrastructure, cross-platform apps, and cloud native tools for universities.',
      organizerId: organizer.id,
      startDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 22 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 18 * 24 * 3600 * 1000),
      maxTeamSize: 5,
      isActive: true,
    },
  ];

  const createdHackathons: any[] = [];
  for (const hData of hackathonsData) {
    const existing = await prisma.hackathon.findFirst({ where: { title: hData.title } });
    if (!existing) {
      const h = await prisma.hackathon.create({ data: hData });
      createdHackathons.push(h);
      console.log(`✅ Created hackathon: ${h.title}`);
    } else {
      createdHackathons.push(existing);
    }
  }

  // 6. Seed Sample Projects
  const primaryStudent = createdStudents[0];
  const secondaryStudent = createdStudents[1];

  const sampleProject = await prisma.project.create({
    data: {
      creatorId: primaryStudent.id,
      title: 'SkillSync Multi-Agent Matching Engine',
      description: 'An AI-powered matchmaking platform matching hackers with complementary skills, timezones, and project visions.',
      status: ProjectStatus.open,
      type: ProjectType.hackathon,
      maxMembers: 4,
      requirements: {
        create: [
          { skillId: skillMap.get('React Native')!, isRequired: true },
          { skillId: skillMap.get('Google Gemini')!, isRequired: true },
          { skillId: skillMap.get('NestJS')!, isRequired: false },
        ],
      },
      members: {
        create: [
          { userId: primaryStudent.id, role: 'Lead Architect' },
        ],
      },
    },
  });
  console.log(`✅ Created sample project: ${sampleProject.title}`);

  // 7. Seed Sample Squad / Team
  const sampleTeam = await prisma.team.create({
    data: {
      name: 'CyberVanguard Squad',
      creatorId: primaryStudent.id,
      projectId: sampleProject.id,
      maxMembers: 4,
      members: {
        create: [
          { userId: primaryStudent.id, role: 'Team Lead', isAdmin: true },
          { userId: secondaryStudent.id, role: 'AI Researcher', isAdmin: false },
        ],
      },
      hackathonParticipants: {
        create: [
          { hackathonId: createdHackathons[0].id, userId: primaryStudent.id },
          { hackathonId: createdHackathons[0].id, userId: secondaryStudent.id },
        ],
      },
    },
  });
  console.log(`✅ Created sample squad: ${sampleTeam.name} (QR Code: ${sampleTeam.qrCode})`);

  // 8. Seed Sample Notification
  await prisma.notification.create({
    data: {
      userId: primaryStudent.id,
      type: 'HACKATHON_ANNOUNCEMENT',
      title: 'Welcome to AI In Action Global Hackathon 2026',
      body: 'Your registration is confirmed! Team formation phase is now live.',
      data: { hackathonId: createdHackathons[0].id },
      isRead: false,
    },
  });

  // 9. Seed Sample AI Recommendation
  await prisma.aiRecommendation.create({
    data: {
      forUserId: primaryStudent.id,
      recommendedUserId: secondaryStudent.id,
      projectId: sampleProject.id,
      score: 94.5,
      scoreBreakdown: {
        skillOverlap: 96,
        complementarity: 95,
        availability: 90,
      },
      reasons: [
        'Complementary expertise in PyTorch and Google Gemini AI',
        'Compatible graduation year and weekly commitment',
        'High skill synergy for Hackathon AI project',
      ],
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  console.log('🎉 SkillSync complete database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, Role, SkillLevel, LookingFor, HackathonStatus, InvitationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const DEMO_PASSWORD = 'Password@123';

const SKILLS_TAXONOMY = [
  // Frontend
  { name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js'] },
  { name: 'Next.js', category: 'Frontend', aliases: ['nextjs', 'next'] },
  { name: 'TypeScript', category: 'Frontend', aliases: ['ts', 'typescript'] },
  { name: 'JavaScript', category: 'Frontend', aliases: ['js', 'javascript', 'es6'] },
  { name: 'TailwindCSS', category: 'Frontend', aliases: ['tailwind', 'tailwind css'] },
  { name: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vuejs'] },
  { name: 'Angular', category: 'Frontend', aliases: ['angularjs', 'ng'] },
  { name: 'Svelte', category: 'Frontend', aliases: ['sveltekit', 'svelte js'] },

  // Backend
  { name: 'Node.js', category: 'Backend', aliases: ['nodejs', 'node', 'node js'] },
  { name: 'NestJS', category: 'Backend', aliases: ['nest', 'nest.js'] },
  { name: 'Python', category: 'Backend', aliases: ['py', 'python3'] },
  { name: 'FastAPI', category: 'Backend', aliases: ['fast api'] },
  { name: 'Go', category: 'Backend', aliases: ['golang'] },
  { name: 'Java', category: 'Backend', aliases: ['java 17', 'jvm'] },
  { name: 'Spring Boot', category: 'Backend', aliases: ['spring', 'springboot'] },
  { name: 'Rust', category: 'Backend', aliases: ['rustlang'] },
  { name: 'GraphQL', category: 'Backend', aliases: ['gql', 'apollo'] },

  // Mobile
  { name: 'React Native', category: 'Mobile', aliases: ['rn', 'react-native'] },
  { name: 'Flutter', category: 'Mobile', aliases: ['dart/flutter', 'flutter sdk'] },
  { name: 'Kotlin', category: 'Mobile', aliases: ['kotlin/android'] },
  { name: 'Swift', category: 'Mobile', aliases: ['swift/ios', 'swiftui'] },
  { name: 'Expo', category: 'Mobile', aliases: ['expo go', 'expo sdk'] },

  // ML/AI
  { name: 'Google Gemini', category: 'ML/AI', aliases: ['gemini', 'gemini-1.5', 'gemini api'] },
  { name: 'OpenAI API', category: 'ML/AI', aliases: ['gpt-4', 'openai'] },
  { name: 'PyTorch', category: 'ML/AI', aliases: ['torch', 'pytorch'] },
  { name: 'TensorFlow', category: 'ML/AI', aliases: ['tf', 'tensorflow'] },
  { name: 'LangChain', category: 'ML/AI', aliases: ['lang chain', 'langchain'] },
  { name: 'Computer Vision', category: 'ML/AI', aliases: ['cv', 'opencv'] },
  { name: 'NLP', category: 'ML/AI', aliases: ['natural language processing', 'transformers'] },

  // DevOps
  { name: 'Docker', category: 'DevOps', aliases: ['dockerfile', 'container'] },
  { name: 'Kubernetes', category: 'DevOps', aliases: ['k8s', 'kube'] },
  { name: 'GitHub Actions', category: 'DevOps', aliases: ['ci/cd', 'gha'] },
  { name: 'Terraform', category: 'DevOps', aliases: ['tf', 'iac'] },
  { name: 'Linux', category: 'DevOps', aliases: ['ubuntu', 'bash', 'shell'] },

  // Data
  { name: 'PostgreSQL', category: 'Data', aliases: ['postgres', 'psql'] },
  { name: 'MongoDB', category: 'Data', aliases: ['mongo', 'nosql'] },
  { name: 'Redis', category: 'Data', aliases: ['key-value', 'upstash'] },
  { name: 'Prisma ORM', category: 'Data', aliases: ['prisma'] },
  { name: 'Supabase', category: 'Data', aliases: ['supabase db'] },

  // Design
  { name: 'Figma', category: 'Design', aliases: ['figma app', 'ui/ux'] },
  { name: 'UI/UX Design', category: 'Design', aliases: ['wireframing', 'prototyping'] },
  { name: 'Design Systems', category: 'Design', aliases: ['component design'] },

  // Language
  { name: 'C++', category: 'Language', aliases: ['cpp', 'c plus plus'] },
  { name: 'C#', category: 'Language', aliases: ['csharp', '.net'] },
  { name: 'SQL', category: 'Language', aliases: ['ansi sql', 'queries'] },
];

async function main() {
  console.log('🌱 Starting SkillSync Schema v2 database seeding...');

  // 1. Seed Skills Taxonomy (~45 skills with aliases)
  console.log(`📦 Seeding ${SKILLS_TAXONOMY.length} skills with aliases...`);
  const skillMap = new Map<string, string>();
  for (const s of SKILLS_TAXONOMY) {
    const record = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category, aliases: s.aliases },
      create: { name: s.name, category: s.category, aliases: s.aliases },
    });
    skillMap.set(record.name, record.id);
  }
  console.log(`✅ Seeded ${skillMap.size} skills.`);

  const defaultPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 2. Seed 1 Organizer
  const organizerEmail = 'organizer@demo.skillsync';
  const organizer = await prisma.user.upsert({
    where: { email: organizerEmail },
    update: { role: Role.organizer },
    create: {
      email: organizerEmail,
      passwordHash: defaultPasswordHash,
      role: Role.organizer,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Global Hackathon Committee',
          bio: 'Official organizer of collegiate hackathons worldwide.',
          college: 'SkillSync Foundation',
          lookingFor: LookingFor.not_looking,
          preferredRoles: ['Organizer'],
        },
      },
    },
  });
  console.log(`✅ Organizer ready: ${organizer.email}`);

  // 3. Seed 2 Hackathons (1 Open + 1 Closed)
  const openHackathon = await prisma.hackathon.upsert({
    where: { id: '00000000-0000-4000-a000-000000000001' },
    update: {
      title: 'SkillSync Global Hackathon 2026',
      status: HackathonStatus.open,
      isActive: true,
    },
    create: {
      id: '00000000-0000-4000-a000-000000000001',
      organizerId: organizer.id,
      title: 'SkillSync Global Hackathon 2026',
      description: 'The flagship collegiate AI & Mobile engineering challenge with $50k in prizes.',
      venue: 'San Francisco & Hybrid Remote',
      startDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      maxTeamSize: 4,
      status: HackathonStatus.open,
      isActive: true,
    },
  });

  const closedHackathon = await prisma.hackathon.upsert({
    where: { id: '00000000-0000-4000-a000-000000000002' },
    update: {
      title: 'Winter Innovators Hackathon 2025',
      status: HackathonStatus.completed,
      isActive: false,
    },
    create: {
      id: '00000000-0000-4000-a000-000000000002',
      organizerId: organizer.id,
      title: 'Winter Innovators Hackathon 2025',
      description: 'Past engineering sprint celebrating cross-platform innovation.',
      venue: 'Online',
      startDate: new Date(Date.now() - 90 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() - 87 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() - 95 * 24 * 3600 * 1000),
      maxTeamSize: 4,
      status: HackathonStatus.completed,
      isActive: false,
    },
  });
  console.log(`✅ Hackathons ready: Open ("${openHackathon.title}"), Closed ("${closedHackathon.title}")`);

  // 4. Seed 12 Students with Diverse Skill Sets
  const studentData = [
    {
      id: '10000000-0000-4000-a000-000000000001',
      email: 'alex.chen@demo.skillsync',
      displayName: 'Alex Chen',
      bio: 'React Native & Gemini AI specialist.',
      college: 'UC Berkeley',
      graduationYear: 2026,
      lookingFor: LookingFor.both,
      skills: [{ name: 'React Native', level: SkillLevel.expert }, { name: 'Google Gemini', level: SkillLevel.advanced }, { name: 'TypeScript', level: SkillLevel.expert }],
    },
    {
      id: '10000000-0000-4000-a000-000000000002',
      email: 'priya.sharma@demo.skillsync',
      displayName: 'Priya Sharma',
      bio: 'Fullstack backend architect with NestJS and Postgres.',
      college: 'IIT Bombay',
      graduationYear: 2025,
      lookingFor: LookingFor.team,
      skills: [{ name: 'NestJS', level: SkillLevel.expert }, { name: 'PostgreSQL', level: SkillLevel.expert }, { name: 'Docker', level: SkillLevel.advanced }],
    },
    {
      id: '10000000-0000-4000-a000-000000000003',
      email: 'marcus.vance@demo.skillsync',
      displayName: 'Marcus Vance',
      bio: 'Product designer focusing on micro-interactions and dark UI.',
      college: 'Stanford University',
      graduationYear: 2026,
      lookingFor: LookingFor.teammate,
      skills: [{ name: 'Figma', level: SkillLevel.expert }, { name: 'UI/UX Design', level: SkillLevel.expert }, { name: 'TailwindCSS', level: SkillLevel.intermediate }],
    },
    {
      id: '10000000-0000-4000-a000-000000000004',
      email: 'elena.rostova@demo.skillsync',
      displayName: 'Elena Rostova',
      bio: 'Machine learning researcher and NLP practitioner.',
      college: 'MIT',
      graduationYear: 2025,
      lookingFor: LookingFor.both,
      skills: [{ name: 'PyTorch', level: SkillLevel.expert }, { name: 'NLP', level: SkillLevel.advanced }, { name: 'Python', level: SkillLevel.expert }],
    },
    {
      id: '10000000-0000-4000-a000-000000000005',
      email: 'david.kim@demo.skillsync',
      displayName: 'David Kim',
      bio: 'DevOps & SRE enthusiast with Kubernetes mastery.',
      college: 'Georgia Tech',
      graduationYear: 2026,
      lookingFor: LookingFor.both,
      skills: [{ name: 'Kubernetes', level: SkillLevel.expert }, { name: 'Docker', level: SkillLevel.expert }, { name: 'Go', level: SkillLevel.advanced }],
    },
    {
      id: '10000000-0000-4000-a000-000000000006',
      email: 'sarah.jenkins@demo.skillsync',
      displayName: 'Sarah Jenkins',
      bio: 'Next.js frontend engineer and performance optimizer.',
      college: 'Carnegie Mellon',
      graduationYear: 2027,
      lookingFor: LookingFor.team,
      skills: [{ name: 'Next.js', level: SkillLevel.expert }, { name: 'React', level: SkillLevel.expert }, { name: 'TypeScript', level: SkillLevel.advanced }],
    },
    {
      id: '10000000-0000-4000-a000-000000000007',
      email: 'carlos.mendez@demo.skillsync',
      displayName: 'Carlos Mendez',
      bio: 'Mobile dev transitioning from Flutter to React Native.',
      college: 'UT Austin',
      graduationYear: 2026,
      lookingFor: LookingFor.both,
      skills: [{ name: 'Flutter', level: SkillLevel.expert }, { name: 'React Native', level: SkillLevel.intermediate }, { name: 'Firebase', level: SkillLevel.advanced }],
    },
    {
      id: '10000000-0000-4000-a000-000000000008',
      email: 'ananya.iyer@demo.skillsync',
      displayName: 'Ananya Iyer',
      bio: 'Distributed databases and Redis caching expert.',
      college: 'BITS Pilani',
      graduationYear: 2025,
      lookingFor: LookingFor.team,
      skills: [{ name: 'Redis', level: SkillLevel.expert }, { name: 'PostgreSQL', level: SkillLevel.advanced }, { name: 'Go', level: SkillLevel.intermediate }],
    },
    {
      id: '10000000-0000-4000-a000-000000000009',
      email: 'jordan.lee@demo.skillsync',
      displayName: 'Jordan Lee',
      bio: 'FastAPI microservices and AI agent builder.',
      college: 'University of Waterloo',
      graduationYear: 2026,
      lookingFor: LookingFor.both,
      skills: [{ name: 'FastAPI', level: SkillLevel.expert }, { name: 'LangChain', level: SkillLevel.advanced }, { name: 'Python', level: SkillLevel.expert }],
    },
    {
      id: '10000000-0000-4000-a000-000000000010',
      email: 'lucas.silva@demo.skillsync',
      displayName: 'Lucas Silva',
      bio: 'Fullstack developer exploring mobile UI/UX.',
      college: 'Universidade de São Paulo',
      graduationYear: 2027,
      lookingFor: LookingFor.team,
      skills: [{ name: 'TypeScript', level: SkillLevel.advanced }, { name: 'React', level: SkillLevel.advanced }, { name: 'Node.js', level: SkillLevel.intermediate }],
    },
    {
      id: '10000000-0000-4000-a000-000000000011',
      email: 'zara.khan@demo.skillsync',
      displayName: 'Zara Khan',
      bio: 'UI designer with Figma component systems experience.',
      college: 'Imperial College London',
      graduationYear: 2026,
      lookingFor: LookingFor.teammate,
      skills: [{ name: 'Figma', level: SkillLevel.expert }, { name: 'Design Systems', level: SkillLevel.advanced }],
    },
    {
      id: '10000000-0000-4000-a000-000000000012',
      email: 'kevin.zhao@demo.skillsync',
      displayName: 'Kevin Zhao',
      bio: 'Rust systems engineer and WebAssembly enthusiast.',
      college: 'Cornell University',
      graduationYear: 2025,
      lookingFor: LookingFor.both,
      skills: [{ name: 'Rust', level: SkillLevel.expert }, { name: 'C++', level: SkillLevel.advanced }, { name: 'Linux', level: SkillLevel.expert }],
    },
  ];

  const studentUsers = [];
  for (const st of studentData) {
    const user = await prisma.user.upsert({
      where: { email: st.email },
      update: { emailVerified: true },
      create: {
        id: st.id,
        email: st.email,
        passwordHash: defaultPasswordHash,
        role: Role.student,
        emailVerified: true,
        profile: {
          create: {
            displayName: st.displayName,
            bio: st.bio,
            college: st.college,
            graduationYear: st.graduationYear,
            lookingFor: st.lookingFor,
          },
        },
      },
    });

    // Add skills
    for (const sk of st.skills) {
      const skillId = skillMap.get(sk.name);
      if (skillId) {
        await prisma.userSkill.upsert({
          where: { userId_skillId: { userId: user.id, skillId } },
          update: { level: sk.level },
          create: { userId: user.id, skillId, level: sk.level },
        });
      }
    }
    studentUsers.push(user);
  }
  console.log(`✅ Seeded ${studentUsers.length} students with profiles and user_skills.`);

  // 5. Register all 12 students for open hackathon
  for (const st of studentUsers) {
    await prisma.hackathonRegistration.upsert({
      where: { hackathonId_userId: { hackathonId: openHackathon.id, userId: st.id } },
      update: {},
      create: { hackathonId: openHackathon.id, userId: st.id, checkedIn: true },
    });
  }
  console.log(`✅ Registered all 12 students to "${openHackathon.title}".`);

  // 6. Seed 4 Teams in Open Hackathon
  // Team 1: FULL (4/4 members) -> Students 0, 1, 2, 3
  const team1 = await prisma.team.upsert({
    where: { id_hackathonId: { id: '20000000-0000-4000-a000-000000000001', hackathonId: openHackathon.id } },
    update: { maxMembers: 4 },
    create: {
      id: '20000000-0000-4000-a000-000000000001',
      hackathonId: openHackathon.id,
      creatorId: studentUsers[0].id,
      name: 'AI Visionaries',
      description: 'Building multimodal hackathon assistants with Gemini 1.5 Pro and React Native.',
      maxMembers: 4,
    },
  });

  const team1Members = [
    { user: studentUsers[0], isLeader: true, role: 'Mobile & AI Lead' },
    { user: studentUsers[1], isLeader: false, role: 'Backend Engineer' },
    { user: studentUsers[2], isLeader: false, role: 'UI/UX Designer' },
    { user: studentUsers[3], isLeader: false, role: 'ML Specialist' },
  ];
  for (const m of team1Members) {
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team1.id, userId: m.user.id } },
      update: { isLeader: m.isLeader, role: m.role },
      create: {
        teamId: team1.id,
        hackathonId: openHackathon.id,
        userId: m.user.id,
        isLeader: m.isLeader,
        role: m.role,
      },
    });
  }

  // Team 2: SKILL GAP (3/4 members, missing DevOps/Kubernetes) -> Students 4 (creator), 5, 6
  const team2 = await prisma.team.upsert({
    where: { id_hackathonId: { id: '20000000-0000-4000-a000-000000000002', hackathonId: openHackathon.id } },
    update: { maxMembers: 4 },
    create: {
      id: '20000000-0000-4000-a000-000000000002',
      hackathonId: openHackathon.id,
      creatorId: studentUsers[5].id, // Sarah
      name: 'CloudScale Squad',
      description: 'Building micro-frontend platforms. Looking for a DevOps engineer with Kubernetes.',
      maxMembers: 4,
    },
  });

  // Team 2 required skills
  for (const skName of ['Next.js', 'Kubernetes', 'Docker']) {
    const sId = skillMap.get(skName);
    if (sId) {
      await prisma.teamRequiredSkill.upsert({
        where: { teamId_skillId: { teamId: team2.id, skillId: sId } },
        update: {},
        create: { teamId: team2.id, skillId: sId },
      });
    }
  }

  const team2Members = [
    { user: studentUsers[5], isLeader: true, role: 'Frontend Lead' },
    { user: studentUsers[6], isLeader: false, role: 'Mobile Dev' },
  ];
  for (const m of team2Members) {
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team2.id, userId: m.user.id } },
      update: { isLeader: m.isLeader, role: m.role },
      create: {
        teamId: team2.id,
        hackathonId: openHackathon.id,
        userId: m.user.id,
        isLeader: m.isLeader,
        role: m.role,
      },
    });
  }

  // Team 3: RECRUITING (1/4 members) -> Student 7
  const team3 = await prisma.team.upsert({
    where: { id_hackathonId: { id: '20000000-0000-4000-a000-000000000003', hackathonId: openHackathon.id } },
    update: { maxMembers: 4 },
    create: {
      id: '20000000-0000-4000-a000-000000000003',
      hackathonId: openHackathon.id,
      creatorId: studentUsers[7].id,
      name: 'HighSpeed DataLab',
      description: 'In-memory real-time leaderboards and state cache.',
      maxMembers: 4,
    },
  });
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team3.id, userId: studentUsers[7].id } },
    update: { isLeader: true },
    create: {
      teamId: team3.id,
      hackathonId: openHackathon.id,
      userId: studentUsers[7].id,
      isLeader: true,
      role: 'Database Engineer',
    },
  });

  // Team 4: RECRUITING (0/4 -> Student 8)
  const team4 = await prisma.team.upsert({
    where: { id_hackathonId: { id: '20000000-0000-4000-a000-000000000004', hackathonId: openHackathon.id } },
    update: { maxMembers: 4 },
    create: {
      id: '20000000-0000-4000-a000-000000000004',
      hackathonId: openHackathon.id,
      creatorId: studentUsers[8].id,
      name: 'Agentic AI Bots',
      description: 'Autonomous LLM agent swarms for developer productivity.',
      maxMembers: 4,
    },
  });
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team4.id, userId: studentUsers[8].id } },
    update: { isLeader: true },
    create: {
      teamId: team4.id,
      hackathonId: openHackathon.id,
      userId: studentUsers[8].id,
      isLeader: true,
      role: 'Agent Architect',
    },
  });

  console.log(`✅ Seeded 4 teams (Team 1 Full at 4/4, Team 2 with Skill Gap, Team 3 & 4 recruiting).`);
  console.log(`ℹ️ Students 4, 9, 10, 11 are registered and deliberately teamless for recommendation queries.`);

  // 7. Seed 2 Pending Invitations
  await prisma.teamInvitation.upsert({
    where: { id: '30000000-0000-4000-a000-000000000001' },
    update: { status: InvitationStatus.pending },
    create: {
      id: '30000000-0000-4000-a000-000000000001',
      teamId: team2.id,
      inviterId: studentUsers[5].id,
      inviteeId: studentUsers[4].id, // Inviting David (Kubernetes expert)
      status: InvitationStatus.pending,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  await prisma.teamInvitation.upsert({
    where: { id: '30000000-0000-4000-a000-000000000002' },
    update: { status: InvitationStatus.pending },
    create: {
      id: '30000000-0000-4000-a000-000000000002',
      teamId: team3.id,
      inviterId: studentUsers[7].id,
      inviteeId: studentUsers[9].id, // Inviting Lucas
      status: InvitationStatus.pending,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });
  console.log(`✅ Seeded 2 pending team invitations.`);

  // 8. Seed Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUsers[4].id,
        type: 'team_invite',
        title: 'Team Invitation Received',
        body: 'Sarah Jenkins invited you to join CloudScale Squad!',
        data: { teamId: team2.id, route: 'Invitations' },
        isRead: false,
      },
      {
        userId: studentUsers[0].id,
        type: 'hackathon_announcement',
        title: 'Welcome to SkillSync Hack 2026',
        body: 'Opening keynote begins this Friday at 10:00 AM UTC.',
        data: { hackathonId: openHackathon.id, route: 'HackathonDetail' },
        isRead: false,
      },
    ],
  });
  console.log(`✅ Seeded sample notifications.`);

  console.log('🎉 SkillSync Schema v2 database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

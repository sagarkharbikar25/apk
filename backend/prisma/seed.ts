import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_SKILLS = [
  // Mobile
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Kotlin', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },
  { name: 'Android SDK', category: 'Mobile' },
  { name: 'iOS SDK', category: 'Mobile' },

  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'TailwindCSS', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Go', category: 'Backend' },
  { name: 'Java', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },

  // Database
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Prisma ORM', category: 'Database' },

  // AI & Machine Learning
  { name: 'Google Gemini', category: 'AI/ML' },
  { name: 'OpenAI API', category: 'AI/ML' },
  { name: 'PyTorch', category: 'AI/ML' },
  { name: 'TensorFlow', category: 'AI/ML' },
  { name: 'LangChain', category: 'AI/ML' },

  // DevOps & Cloud
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'GitHub Actions', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'GCP', category: 'Cloud' },
  { name: 'Supabase', category: 'Cloud' },
  { name: 'Firebase', category: 'Cloud' },
  { name: 'Render', category: 'Cloud' },
];

async function main() {
  console.log('🌱 Starting SkillSync database seeding...');

  // 1. Seed Skills
  console.log('Seeding initial skills...');
  for (const skill of DEFAULT_SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }
  console.log(`✅ Seeded ${DEFAULT_SKILLS.length} skills`);

  // 2. Seed Default Admin User
  const adminEmail = 'admin@skillsync.io';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@SkillSync2026!', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.admin,
        emailVerified: true,
        profile: {
          create: {
            displayName: 'SkillSync Admin',
            bio: 'Platform Administrator',
            college: 'SkillSync HQ',
          },
        },
      },
    });
    console.log(`✅ Created default admin user: ${admin.email} / Admin@SkillSync2026!`);
  }

  // 3. Seed Sample Hackathon
  const hackathonTitle = 'Campus AI Hackathon 2026';
  const existingHackathon = await prisma.hackathon.findFirst({
    where: { title: hackathonTitle },
  });

  if (!existingHackathon) {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (admin) {
      await prisma.hackathon.create({
        data: {
          title: hackathonTitle,
          description: 'Build AI-powered mobile and web applications to solve real-world student challenges.',
          organizerId: admin.id,
          startDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          endDate: new Date(Date.now() + 9 * 24 * 3600 * 1000),
          registrationDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
          maxTeamSize: 4,
          isActive: true,
        },
      });
      console.log(`✅ Created sample hackathon: ${hackathonTitle}`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

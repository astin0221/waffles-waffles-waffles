import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.userEvent.deleteMany();
  await prisma.event.deleteMany();
  await prisma.team.deleteMany();
  await prisma.league.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Existing data cleared\n');

  // Create Sports
  console.log('📊 Creating sports...');
  const soccer = await prisma.sport.create({
    data: { name: 'Soccer' },
  });
  const basketball = await prisma.sport.create({
    data: { name: 'Basketball' },
  });
  const football = await prisma.sport.create({
    data: { name: 'American Football' },
  });
  console.log(`✓ Created ${3} sports\n`);

  // Create Leagues
  console.log('🏆 Creating leagues...');
  const premierLeague = await prisma.league.create({
    data: {
      name: 'English Premier League',
      sportId: soccer.id,
    },
  });
  const laLiga = await prisma.league.create({
    data: {
      name: 'La Liga',
      sportId: soccer.id,
    },
  });
  const nba = await prisma.league.create({
    data: {
      name: 'NBA',
      sportId: basketball.id,
    },
  });
  const nfl = await prisma.league.create({
    data: {
      name: 'NFL',
      sportId: football.id,
    },
  });
  console.log(`✓ Created ${4} leagues\n`);

  // Create Teams - Premier League
  console.log('👥 Creating teams...');
  const arsenal = await prisma.team.create({
    data: { name: 'Arsenal', leagueId: premierLeague.id },
  });
  const chelsea = await prisma.team.create({
    data: { name: 'Chelsea', leagueId: premierLeague.id },
  });
  const liverpool = await prisma.team.create({
    data: { name: 'Liverpool', leagueId: premierLeague.id },
  });
  const manCity = await prisma.team.create({
    data: { name: 'Manchester City', leagueId: premierLeague.id },
  });

  // La Liga Teams
  const barcelona = await prisma.team.create({
    data: { name: 'Barcelona', leagueId: laLiga.id },
  });
  const realMadrid = await prisma.team.create({
    data: { name: 'Real Madrid', leagueId: laLiga.id },
  });

  // NBA Teams
  const lakers = await prisma.team.create({
    data: { name: 'Los Angeles Lakers', leagueId: nba.id },
  });
  const warriors = await prisma.team.create({
    data: { name: 'Golden State Warriors', leagueId: nba.id },
  });
  const celtics = await prisma.team.create({
    data: { name: 'Boston Celtics', leagueId: nba.id },
  });

  // NFL Teams
  const chiefs = await prisma.team.create({
    data: { name: 'Kansas City Chiefs', leagueId: nfl.id },
  });
  const eagles = await prisma.team.create({
    data: { name: 'Philadelphia Eagles', leagueId: nfl.id },
  });
  console.log(`✓ Created ${11} teams\n`);

  // Create Events
  console.log('📅 Creating events...');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const twoWeeks = new Date(now);
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  // Premier League Events
  await prisma.event.create({
    data: {
      leagueId: premierLeague.id,
      homeTeamId: arsenal.id,
      awayTeamId: chelsea.id,
      eventDatetime: tomorrow,
      status: 'Scheduled',
      externalApiId: 'seed-epl-1',
    },
  });

  await prisma.event.create({
    data: {
      leagueId: premierLeague.id,
      homeTeamId: liverpool.id,
      awayTeamId: manCity.id,
      eventDatetime: nextWeek,
      status: 'Scheduled',
      externalApiId: 'seed-epl-2',
    },
  });

  // La Liga Events
  await prisma.event.create({
    data: {
      leagueId: laLiga.id,
      homeTeamId: barcelona.id,
      awayTeamId: realMadrid.id,
      eventDatetime: nextWeek,
      status: 'Scheduled',
      externalApiId: 'seed-laliga-1',
    },
  });

  // NBA Events
  await prisma.event.create({
    data: {
      leagueId: nba.id,
      homeTeamId: lakers.id,
      awayTeamId: warriors.id,
      eventDatetime: tomorrow,
      status: 'Scheduled',
      externalApiId: 'seed-nba-1',
    },
  });

  await prisma.event.create({
    data: {
      leagueId: nba.id,
      homeTeamId: celtics.id,
      awayTeamId: lakers.id,
      eventDatetime: twoWeeks,
      status: 'Scheduled',
      externalApiId: 'seed-nba-2',
    },
  });

  // NFL Events
  await prisma.event.create({
    data: {
      leagueId: nfl.id,
      homeTeamId: chiefs.id,
      awayTeamId: eagles.id,
      eventDatetime: nextWeek,
      status: 'Scheduled',
      externalApiId: 'seed-nfl-1',
    },
  });

  // Past event with scores
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  await prisma.event.create({
    data: {
      leagueId: premierLeague.id,
      homeTeamId: chelsea.id,
      awayTeamId: liverpool.id,
      eventDatetime: yesterday,
      status: 'Final',
      homeScore: 2,
      awayScore: 1,
      externalApiId: 'seed-epl-past-1',
    },
  });

  console.log(`✓ Created ${7} events\n`);

  // Create Test Users
  console.log('👤 Creating test users...');
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log(`✓ Created ${2} test users\n`);

  // Add some events to test user's calendar
  console.log('📆 Adding events to test user calendar...');
  await prisma.userEvent.create({
    data: {
      userId: testUser.id,
      eventId: (await prisma.event.findFirst({ where: { homeTeamId: arsenal.id } }))!.id,
    },
  });

  await prisma.userEvent.create({
    data: {
      userId: testUser.id,
      eventId: (await prisma.event.findFirst({ where: { homeTeamId: lakers.id } }))!.id,
    },
  });

  console.log(`✓ Added ${2} events to test user calendar\n`);

  console.log('✅ Database seeding completed successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123\n');
  console.log('   Email: demo@example.com');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
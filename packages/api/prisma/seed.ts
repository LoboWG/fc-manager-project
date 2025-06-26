// Fichier final et corrigé : packages/api/prisma/seed.ts

import { PrismaClient, Role } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Nettoyage des anciennes données ---
  await prisma.playerMatchStats.deleteMany();
  await prisma.lineupPlayer.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.match.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.competitionProvider.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Old data cleaned');

  // --- Création des Organisateurs ---
  const vpg = await prisma.competitionProvider.create({ data: { name: 'VPG France' } });
  console.log('✅ Providers created');

  // --- Création du Répertoire d'Équipes ---
  const teamNames = ['Equipe A', 'Equipe B', 'Equipe C', 'Equipe D', 'FC Manager Team'];
  await prisma.team.createMany({
    data: teamNames.map(name => ({ name })),
  });
  const allTeams = await prisma.team.findMany();
  const ourTeam = allTeams.find(t => t.name === 'FC Manager Team')!;
  console.log('✅ Teams created');

  // --- Création d'une Compétition et liaison des équipes ---
  const ligue1 = await prisma.competition.create({
    data: {
      name: 'Ligue 1',
      format: 'LIGUE',
      season: 'Saison Test 1',
      providerId: vpg.id,
      teams: {
        connect: allTeams.map(t => ({ id: t.id })),
      },
    },
  });
  console.log('✅ Competition created and teams linked');

  // --- Création des Fixtures (matchs non datés) pour la J1 ---
  await prisma.match.createMany({
    data: [
      {
        round: 'Journée 1',
        homeTeamId: allTeams[0].id, // Equipe A
        awayTeamId: allTeams[1].id, // Equipe B
        isOurMatch: false,
        competitionId: ligue1.id,
      },
      {
        round: 'Journée 1',
        homeTeamId: ourTeam.id, // Notre équipe
        awayTeamId: allTeams[2].id, // Equipe C
        isOurMatch: true,
        competitionId: ligue1.id,
      },
    ],
  });
  console.log('✅ J1 Fixtures created');
  
  // --- Création des Utilisateurs de Test ---
  await prisma.user.create({
    data: {
      discordId: 'MANAGER_DISCORD_ID',
      username: 'LoboW (Manager)',
      role: Role.MANAGER
    }
  });
  await prisma.user.create({
    data: {
      discordId: 'PLAYER_DISCORD_ID',
      username: 'Gatheglobow (Player)',
      role: Role.PLAYER
    }
  });
  console.log('✅ Test users created');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
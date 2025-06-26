import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFriendlyMatchDto } from './dto/create-friendly-match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMatchDto: CreateMatchDto) {
  // On extrait tous les IDs et le reste des données
  const {
    homeTeamId,
    awayTeamId,
    competitionId,
    sessionId,
    ...otherData // Contient round, isOurMatch
  } = createMatchDto;

  return this.prisma.match.create({
    data: {
      ...otherData, // On passe les données simples
      // On convertit la date si elle existe
      matchDate: createMatchDto.matchDate ? new Date(createMatchDto.matchDate) : undefined,

      // On crée les relations via les ID
      homeTeam: {
        connect: { id: homeTeamId },
      },
      awayTeam: {
        connect: { id: awayTeamId },
      },
      // On connecte la compétition et la session si leurs IDs sont fournis
      ...(competitionId && {
        competition: { connect: { id: competitionId } },
      }),
      ...(sessionId && {
        session: { connect: { id: sessionId } },
      }),
    },
  });
}

  findAll(competitionId?: string, unassigned?: boolean) {
  const whereClause: any = {};

  if (competitionId) {
    whereClause.competitionId = competitionId;
  }
  if (unassigned) {
    whereClause.sessionId = null;
    whereClause.isOurMatch = true;
  }

  return this.prisma.match.findMany({
    where: whereClause,
    include: {
      // On fait un include "imbriqué" !
      competition: {
        include: {
          provider: true, // On inclut les détails du provider DANS la compétition
        },
      },
      session: true,
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}


update(id: string, updateMatchDto: UpdateMatchDto) {
    return this.prisma.match.update({
      where: { id: id },
      data: updateMatchDto, // On passe directement le DTO
    });
  }


createMany(fixtures: CreateMatchDto[]) {
  // On s'assure que les dates sont bien au format Date si elles sont fournies
  const dataToCreate = fixtures.map(fixture => ({
    ...fixture,
    matchDate: fixture.matchDate ? new Date(fixture.matchDate) : undefined,
  }));

  return this.prisma.match.createMany({
    data: dataToCreate,
  });
}
async createFriendly(createFriendlyDto: CreateFriendlyMatchDto, myTeamId: string) {
  const { opponentName, isOurTeamHome, matchDate, sessionId } = createFriendlyDto;

  // Logique "Find or Create" (Trouver ou Créer) pour l'adversaire
  const opponentTeam = await this.prisma.team.upsert({
    where: { name: opponentName }, // Cherche une équipe avec ce nom
    update: {}, // Si elle existe, ne rien faire
    create: { name: opponentName }, // Si elle n'existe pas, la créer
  });

  // Définir qui est à domicile et qui est à l'extérieur
  const homeTeamId = isOurTeamHome ? myTeamId : opponentTeam.id;
  const awayTeamId = isOurTeamHome ? opponentTeam.id : myTeamId;

  // Créer le match
  return this.prisma.match.create({
    data: {
      homeTeamId,
      awayTeamId,
      isOurMatch: true,
      round: 'Amical',
      matchDate: new Date(matchDate),
      sessionId,
    },
  });
}
}
import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMatchDto: CreateMatchDto) {
  // On extrait les ID et le reste des données du DTO
  const { competitionId, sessionId, ...matchData } = createMatchDto;

  return this.prisma.match.create({
    data: {
      ...matchData, // On passe les données simples (opponent, round, matchDate si présent)
      competition: {
        connect: { id: competitionId }, // On connecte obligatoirement la compétition
      },
      // On ajoute la connexion à la session CONDITIONNELLEMENT
      ...(sessionId && {
        session: {
          connect: { id: sessionId },
        },
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
}
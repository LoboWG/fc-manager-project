import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMatchDto: CreateMatchDto) {
  const { competitionId, sessionId, ...matchData } = createMatchDto;

  return this.prisma.match.create({
    data: {
      ...matchData, // opponent, round, matchDate...
      // On connecte la compétition SEULEMENT si un competitionId est fourni
      ...(competitionId && {
        competition: {
          connect: { id: competitionId },
        },
      }),
      // On connecte la session SEULEMENT si un sessionId est fourni
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
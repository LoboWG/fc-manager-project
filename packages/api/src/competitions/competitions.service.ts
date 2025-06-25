import { Injectable } from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCompetitionDto: CreateCompetitionDto) {
  // On sépare le providerId du reste des données
  const { providerId, ...competitionData } = createCompetitionDto;

  return this.prisma.competition.create({
    data: {
      ...competitionData, // On passe le nom, format, saison...
      provider: {
        // Et on connecte la relation au bon fournisseur
        connect: { id: providerId },
      },
    },
  });
}

  findAll() {
  return this.prisma.competition.findMany({
    include: {
      provider: true, // On demande à Prisma d'inclure les données de l'organisateur lié
    },
  });
}

  findOne(id: string) {
  return this.prisma.competition.findUnique({
    where: { id: id },
    include: {
      provider: true,
      teams: true, // <-- ON AJOUTE CET INCLUDE pour charger les équipes liées
    },
  });
}

  async addTeamsToCompetition(competitionId: string, teamIds: string[]) {
    return this.prisma.competition.update({
      where: { id: competitionId },
      data: {
        teams: {
          set: teamIds.map(id => ({ id: id })),
        },
      },
      include: {
        teams: true,
      },
    });
  }

  // Les autres méthodes générées par le CLI que nous n'utilisons pas encore
  update(id: string, updateCompetitionDto: UpdateCompetitionDto) {
    return `This action updates a #${id} competition`;
  }

  remove(id: string) {
    return `This action removes a #${id} competition`;
  }
}




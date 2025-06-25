import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SetLineupDto } from './dto/set-lineup.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSessionDto: CreateSessionDto) {
    return this.prisma.session.create({
      data: createSessionDto,
    });
  }

  findAll() {
    return this.prisma.session.findMany({
      orderBy: {
        startTime: 'asc',
      },
      include: {
        matches: { /* ... la logique d'include reste la même ... */ },
      },
    });
  }

  // Les méthodes ci-dessous ont été générées par le CLI, nous les laissons pour le moment.
  findOne(id: string) {
  return this.prisma.session.findUnique({
    where: { id },
    include: {
      // La logique pour les matchs ne change pas
      matches: {
        orderBy: { matchDate: 'asc' },
        include: {
          competition: {
            include: {
              provider: true,
            },
          },
        },
      },
      // La logique pour les présences ne change pas
      availabilities: {
        include: {
          user: true, 
        },
      },
      // ON AJOUTE CETTE PARTIE POUR CHARGER LA COMPO
      lineup: {
        include: {
          user: true, // On inclut les infos du joueur dans la compo
        }
      }
    },
  });
}

  update(id: string, updateSessionDto: UpdateSessionDto) {
    return `This action updates a #${id} session`;
  }

  remove(id: string) {
    return `This action removes a #${id} session`;
  }


async setLineup(sessionId: string, setLineupDto: SetLineupDto) {
    const { lineup } = setLineupDto;

    // On utilise une transaction pour s'assurer que les deux opérations
    // (supprimer et créer) réussissent ou échouent ensemble.
    return this.prisma.$transaction(async (tx) => {
      // 1. On supprime l'ancienne composition pour cette session
      await tx.lineupPlayer.deleteMany({
        where: { sessionId: sessionId },
      });

      // 2. On crée toutes les nouvelles entrées de la composition
      // On transforme notre liste de joueurs DTO en données pour Prisma
      const lineupData = lineup.map(player => ({
        sessionId: sessionId, // On ajoute l'ID de la session à chaque joueur
        userId: player.userId,
        position: player.position,
        status: player.status,
      }));

      const createdLineup = await tx.lineupPlayer.createMany({
        data: lineupData,
      });

      return createdLineup;
    });
  }
}
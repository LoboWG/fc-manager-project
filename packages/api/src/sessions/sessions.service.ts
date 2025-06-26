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
          homeTeam: true, 
          awayTeam: true,
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

    // Étape 1 : On effectue la transaction avec la base de données
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. On supprime l'ancienne composition pour cette session
      await tx.lineupPlayer.deleteMany({
        where: { sessionId: sessionId },
      });

      // 2. On crée toutes les nouvelles entrées de la composition
      const lineupData = lineup.map(player => ({
        sessionId: sessionId,
        userId: player.userId,
        position: player.position,
        status: player.status,
      }));

      const createdLineup = await tx.lineupPlayer.createMany({
        data: lineupData,
      });

      return createdLineup;
    });

    // --- C'EST LE BLOC DE CODE À AJOUTER ---
    // Étape 2 : Si la transaction a réussi, on notifie le bot
    try {
      console.log(`[API] Notifying bot about lineup for session ${sessionId}...`);
      await fetch('http://localhost:3002/webhooks/lineup-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId }),
      });
    } catch (error) {
      // Si le bot n'est pas démarré, on affiche une erreur mais on ne fait pas planter l'API
      console.error('[API] Failed to notify bot:', error.message);
    }
    // ------------------------------------

    // Étape 3 : On retourne le résultat de la transaction au contrôleur
    return result;
  }

  findForPlayer(userId: string) {
    return this.prisma.session.findMany({
      orderBy: {
        startTime: 'asc',
      },
      include: {
        // On inclut la présence UNIQUEMENT pour le joueur connecté
        availabilities: {
          where: {
            userId: userId,
          },
        },
      },
    });
  }
}
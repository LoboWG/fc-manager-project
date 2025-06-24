import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async setForSession(
    userId: string,
    sessionId: string,
    dto: SetAvailabilityDto,
  ) {
    // "upsert" est la combinaison de "update" (mettre à jour) et "insert" (insérer).
    return this.prisma.availability.upsert({
      where: {
        // On cherche une entrée unique basée sur la combinaison de l'ID du joueur et de l'ID de la session.
        // Ceci fonctionne grâce à la contrainte @@unique que nous avons mise dans le schéma Prisma.
        userId_sessionId: {
          userId: userId,
          sessionId: sessionId,
        },
      },
      update: {
        // Si une entrée est trouvée, on met simplement à jour le statut.
        status: dto.status,
      },
      create: {
        // Si aucune entrée n'est trouvée, on en crée une nouvelle.
        status: dto.status,
        userId: userId,
        sessionId: sessionId,
      },
    });
  }
}
import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from '../prisma/prisma.service';

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
      // On inclut les matchs liés à chaque session !
      include: {
        matches: {
          orderBy: {
            // On trie les matchs par heure de coup d'envoi
            matchDate: 'asc', 
          },
          // Et on inclut toutes les infos du match pour l'affichage
          include: {
            competition: {
              include: {
                provider: true, 
              },
            },
          },
        },
      },
    });
  }

  // Les méthodes ci-dessous ont été générées par le CLI, nous les laissons pour le moment.
  findOne(id: string) {
  return this.prisma.session.findUnique({
    where: { id },
    // On inclut tous les matchs associés à cette session
    include: {
      matches: {
        // On trie les matchs par heure pour un affichage logique
        orderBy: {
          matchDate: 'asc',
        },
        // Pour chaque match, on inclut aussi les infos de la compétition et de l'organisateur
        include: {
          competition: {
            include: {
              provider: true,
            },
          },
        },
      },
    },
  });
}

  update(id: string, updateSessionDto: UpdateSessionDto) {
    return `This action updates a #${id} session`;
  }

  remove(id: string) {
    return `This action removes a #${id} session`;
  }
} // <-- L'erreur venait très probablement de cette accolade manquante
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../generated/prisma'; // Assurez-vous d'importer Role

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(profile: any) {
    // Vérifie si un utilisateur avec cet ID Discord existe déjà
    const user = await this.prisma.user.findUnique({
      where: { discordId: profile.id },
    });

    if (user) {
      // Si l'utilisateur existe, on le retourne
      return user;
    }

    // Si l'utilisateur n'existe pas, on le crée
    const newUser = await this.prisma.user.create({
      data: {
        discordId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        // Par défaut, tout nouvel utilisateur est un 'PLAYER'
        role: Role.PLAYER, 
      },
    });

    return newUser;
  }
}
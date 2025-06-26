import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(profile: any) {
    const user = await this.prisma.user.findUnique({
      where: { discordId: profile.id },
    });
    if (user) { return user; }

    const newUser = await this.prisma.user.create({
      data: {
        discordId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        role: Role.PLAYER,
      },
    });
    return newUser;
  }
}
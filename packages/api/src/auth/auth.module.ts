import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './discord.strategy';
import { PrismaModule } from '../prisma/prisma.module'; // <--- IMPORTER ICI

@Module({
  imports: [PassportModule, PrismaModule], // <--- AJOUTER ICI
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy],
})
export class AuthModule {}
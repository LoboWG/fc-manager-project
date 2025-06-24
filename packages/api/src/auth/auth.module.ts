import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './discord.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PassportModule.register({ session: true }), PrismaModule], 
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy, SessionSerializer],
})
export class AuthModule {}
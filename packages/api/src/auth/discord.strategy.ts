// Contenu complet et final pour : src/auth/discord.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('DISCORD_CLIENT_ID')!,
      clientSecret: configService.get('DISCORD_CLIENT_SECRET')!,
      callbackURL: configService.get('DISCORD_CALLBACK_URL')!,
      scope: ['identify', 'email', 'guilds'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: Profile) {
    return this.authService.validateUser(profile);
  }
}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'; // <--- IMPORTER ICI
import { CompetitionsModule } from './competitions/competitions.module';
import { SessionsModule } from './sessions/sessions.module';
import { MatchesModule } from './matches/matches.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { CompetitionProvidersModule } from './competition-providers/competition-providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // <--- AJOUTER CETTE CONFIGURATION
      isGlobal: true,      // Rend le module global
    }),
    PrismaModule,
    AuthModule,
    CompetitionsModule,
    SessionsModule,
    MatchesModule,
    AvailabilitiesModule,
    CompetitionProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
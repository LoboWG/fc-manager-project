import { Module } from '@nestjs/common';
import { CompetitionProvidersService } from './competition-providers.service';
import { CompetitionProvidersController } from './competition-providers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompetitionProvidersController],
  providers: [CompetitionProvidersService],
})
export class CompetitionProvidersModule {}

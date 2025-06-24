import { Injectable } from '@nestjs/common';
import { CreateCompetitionProviderDto } from './dto/create-competition-provider.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompetitionProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDto: CreateCompetitionProviderDto) {
    return this.prisma.competitionProvider.create({
      data: createDto,
    });
  }

  findAll() {
    return this.prisma.competitionProvider.findMany();
  }
}
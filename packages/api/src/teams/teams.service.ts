import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: createTeamDto,
    });
  }

  findAll() {
    return this.prisma.team.findMany();
  }

  // Laissez les autres méthodes générées par le CLI pour le moment
  findOne(id: string) { return `This action returns a #${id} team`; }
  update(id: string, updateTeamDto: UpdateTeamDto) { return `This action updates a #${id} team`; }
  remove(id: string) { return `This action removes a #${id} team`; }
}
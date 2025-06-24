import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  create(@Body() createCompetitionDto: CreateCompetitionDto) {
    return this.competitionsService.create(createCompetitionDto);
  }

  @Get()
  findAll() {
    return this.competitionsService.findAll();
  }

  @Get(':id')
    findOne(@Param('id') id: string) {
      return this.competitionsService.findOne(id);
    }
  }

import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompetitionProvidersService } from './competition-providers.service';
import { CreateCompetitionProviderDto } from './dto/create-competition-provider.dto';

@Controller('competition-providers')
export class CompetitionProvidersController {
  constructor(
    private readonly competitionProvidersService: CompetitionProvidersService,
  ) {}

  @Post()
  create(@Body() createDto: CreateCompetitionProviderDto) {
    return this.competitionProvidersService.create(createDto);
  }

  @Get()
  findAll() {
    return this.competitionProvidersService.findAll();
  }
}
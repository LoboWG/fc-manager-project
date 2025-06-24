import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
findAll(
  @Query('competitionId') competitionId?: string,
  @Query('unassigned') unassigned?: string, // On lit le nouveau paramètre
) {
  // On convertit le string "true" en un vrai booléen
  return this.matchesService.findAll(competitionId, unassigned === 'true');
}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchesService.update(id, updateMatchDto);
  }
}
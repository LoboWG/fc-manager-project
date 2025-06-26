import { Controller, Get, Post, Body, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { CreateBulkMatchesDto } from './dto/create-bulk-matches.dto';
import { CreateFriendlyMatchDto } from './dto/create-friendly-match.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

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

  @Post('bulk')
createBulk(@Body() createBulkMatchesDto: CreateBulkMatchesDto) {
  return this.matchesService.createMany(createBulkMatchesDto.fixtures);
}

@Post('friendly')
@UseGuards(AuthenticatedGuard) // Route protégée
createFriendly(
  @Body() createFriendlyDto: CreateFriendlyMatchDto,
  @Req() req: any,
) {
  // Pour l'instant, on va tricher pour l'ID de notre équipe
  // Plus tard, on le mettra dans une config globale
  const MY_TEAM_ID = "cmcc7dop30003i0mfqa31kd0n";
  return this.matchesService.createFriendly(createFriendlyDto, MY_TEAM_ID);
}

}
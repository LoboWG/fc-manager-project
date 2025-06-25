// Fichier : packages/api/src/sessions/sessions.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { SetLineupDto } from './dto/set-lineup.dto'; // N'oubliez pas cet import si vous l'avez retiré

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  // ON PLACE LA ROUTE SPÉCIFIQUE "my-schedule" AVANT LA ROUTE GÉNÉRIQUE ":id"
  @Get('my-schedule')
  @UseGuards(AuthenticatedGuard)
  async findMySchedule(@Req() req: any) {
    console.log(`--- [Player] FIND MY SCHEDULE CALLED for user: ${req.user.username} ---`);
    const sessionsData = await this.sessionsService.findForPlayer(req.user.id);
    console.log('--- [Player] Data returned from service: ---');
    console.log(sessionsData);
    return sessionsData;
  }

  // LA ROUTE GÉNÉRIQUE AVEC PARAMÈTRE VIENT APRÈS
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post(':id/lineup')
  setLineup(@Param('id') id: string, @Body() setLineupDto: SetLineupDto) {
    return this.sessionsService.setLineup(id, setLineupDto);
  }
}
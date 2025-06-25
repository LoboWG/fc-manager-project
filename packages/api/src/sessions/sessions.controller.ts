import { Controller, Get, Post, Body, Param } from '@nestjs/common'; // <-- On ajoute Param ici
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SetLineupDto } from './dto/set-lineup.dto';

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

  // --- LA MÉTHODE MANQUANTE À AJOUTER ---
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post(':id/lineup')
  setLineup(@Param('id') id: string, @Body() setLineupDto: SetLineupDto) {
    return this.sessionsService.setLineup(id, setLineupDto);
  }
}
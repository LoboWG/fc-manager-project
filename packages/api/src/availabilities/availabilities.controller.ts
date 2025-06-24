import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

// Notez la route : elle est "imbriquée" dans les sessions
@Controller('sessions/:sessionId/availabilities')
@UseGuards(AuthGuard('discord')) // On protège TOUTES les routes de ce contrôleur
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  set(
    @Param('sessionId') sessionId: string,
    @Body() setAvailabilityDto: SetAvailabilityDto,
    @Req() req: Request & { user: any }, // On récupère la requête pour trouver l'utilisateur
  ) {
    const userId = req.user.id; // L'AuthGuard a placé l'utilisateur authentifié dans req.user
    return this.availabilitiesService.setForSession(
      userId,
      sessionId,
      setAvailabilityDto,
    );
  }
}
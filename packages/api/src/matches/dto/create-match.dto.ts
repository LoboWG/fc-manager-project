// Fichier : packages/api/src/matches/dto/create-match.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  homeTeamId: string; // On attend maintenant l'ID de l'équipe à domicile

  @IsString()
  @IsNotEmpty()
  awayTeamId: string; // Et l'ID de l'équipe à l'extérieur

  @IsString()
  @IsOptional()
  round?: string;

  @IsBoolean()
  @IsOptional()
  isOurMatch?: boolean;

  @IsString()
  @IsOptional()
  competitionId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsDateString() // On garde IsDateString car le frontend enverra un string ISO
  @IsOptional()
  matchDate?: string;
}
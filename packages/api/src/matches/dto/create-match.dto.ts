import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional, // <-- On importe le nouveau décorateur
} from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  opponent: string;

  // Le tour/journée est optionnel
  @IsString()
  @IsOptional()
  round?: string;

  // La date du match est maintenant optionnelle
  @IsDateString()
  @IsOptional()
  matchDate?: Date;

  // La compétition reste obligatoire pour créer un match
  @IsString()
  @IsNotEmpty()
  competitionId: string;

  // La session est maintenant optionnelle
  @IsString()
  @IsOptional()
  sessionId?: string;
}
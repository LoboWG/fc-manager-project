import { IsBoolean, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateFriendlyMatchDto {
  @IsString()
  @IsNotEmpty()
  opponentName: string;

  @IsBoolean()
  @IsNotEmpty()
  isOurTeamHome: boolean; // Pour savoir si on joue à domicile ou extérieur

  @IsDateString()
  @IsNotEmpty()
  matchDate: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty()
  name: string; // ex: "Ligue 1", "Coupe de France"

  @IsString()
  @IsNotEmpty()
  format: string; // "LIGUE" ou "COUPE"

  @IsString()
  @IsNotEmpty()
  season: string; // ex: "Saison 1"

  @IsString()
  @IsNotEmpty()
  providerId: string; // L'ID du fournisseur (ex: VPG France) auquel se lier
}
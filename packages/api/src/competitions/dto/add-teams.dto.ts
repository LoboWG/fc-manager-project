import { IsArray, IsString } from 'class-validator';

export class AddTeamsToCompetitionDto {
  @IsArray()
  @IsString({ each: true }) // Valide que chaque élément du tableau est un string
  teamIds: string[];
}
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LineupStatus } from '../../../generated/prisma';

// Ce DTO représente UN joueur dans la liste
class LineupPlayerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsEnum(LineupStatus) // Valide que le statut est bien TITULAIRE ou REMPLACANT
  @IsNotEmpty()
  status: LineupStatus;
}

// Ce DTO principal représente l'objet envoyé dans le corps de la requête
export class SetLineupDto {
  @IsArray()
  @ValidateNested({ each: true }) // Dit à NestJS de valider chaque objet dans le tableau
  @Type(() => LineupPlayerDto) // Spécifie que chaque objet du tableau est un LineupPlayerDto
  lineup: LineupPlayerDto[];
}
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompetitionProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
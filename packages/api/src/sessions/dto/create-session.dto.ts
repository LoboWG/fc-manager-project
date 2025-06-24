import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @IsDateString()
  @IsNotEmpty()
  endTime: Date;
}
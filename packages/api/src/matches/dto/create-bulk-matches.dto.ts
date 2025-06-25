import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMatchDto } from './create-match.dto';

export class CreateBulkMatchesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMatchDto)
  fixtures: CreateMatchDto[];
}
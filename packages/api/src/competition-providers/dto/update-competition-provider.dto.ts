import { PartialType } from '@nestjs/mapped-types';
import { CreateCompetitionProviderDto } from './create-competition-provider.dto';

export class UpdateCompetitionProviderDto extends PartialType(CreateCompetitionProviderDto) {}

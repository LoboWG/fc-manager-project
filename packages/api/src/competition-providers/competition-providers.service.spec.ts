import { Test, TestingModule } from '@nestjs/testing';
import { CompetitionProvidersService } from './competition-providers.service';

describe('CompetitionProvidersService', () => {
  let service: CompetitionProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetitionProvidersService],
    }).compile();

    service = module.get<CompetitionProvidersService>(CompetitionProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CompetitionProvidersController } from './competition-providers.controller';
import { CompetitionProvidersService } from './competition-providers.service';

describe('CompetitionProvidersController', () => {
  let controller: CompetitionProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetitionProvidersController],
      providers: [CompetitionProvidersService],
    }).compile();

    controller = module.get<CompetitionProvidersController>(CompetitionProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

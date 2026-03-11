import { Test, TestingModule } from '@nestjs/testing';
import { FeaturedWorksService } from './featured-works.service';

describe('FeaturedWorksService', () => {
  let service: FeaturedWorksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeaturedWorksService],
    }).compile();

    service = module.get<FeaturedWorksService>(FeaturedWorksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FeaturedWorksController } from './featured-works.controller';
import { FeaturedWorksService } from './featured-works.service';

describe('FeaturedWorksController', () => {
  let controller: FeaturedWorksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturedWorksController],
      providers: [FeaturedWorksService],
    }).compile();

    controller = module.get<FeaturedWorksController>(FeaturedWorksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

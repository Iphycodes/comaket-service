import { Test, TestingModule } from '@nestjs/testing';
import { SavedProductsController } from './saved-products.controller';
import { SavedProductsService } from './saved-products.service';

describe('SavedProductsController', () => {
  let controller: SavedProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedProductsController],
      providers: [SavedProductsService],
    }).compile();

    controller = module.get<SavedProductsController>(SavedProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

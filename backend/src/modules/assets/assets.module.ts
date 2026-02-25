import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { SellerController } from './seller.controller';

@Module({
  controllers: [AssetsController, SellerController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}

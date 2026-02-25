import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { AdminController } from '../assets/admin.controller';

@Module({
  imports: [AssetsModule],
  controllers: [AdminController],
})
export class AdminModule {}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AssetsService } from './assets.service';
import { ListAssetsQueryDto } from './dto/assets.dto';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Public()
  @Get('/categories')
  async categories() {
    return this.assetsService.listCategories();
  }

  @Public()
  @Get()
  async list(@Query() query: ListAssetsQueryDto) {
    return this.assetsService.listPublicAssets(query);
  }

  @Public()
  @Get(':id')
  async byId(@Param('id') id: string) {
    return this.assetsService.getPublicAsset(id);
  }
}

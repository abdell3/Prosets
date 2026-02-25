import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import {
  AttachPreviewDto,
  AttachSourceDto,
  CreateAssetDto,
  UpdateAssetDto,
} from './dto/assets.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('seller')
@Roles(UserRole.SELLER, UserRole.ADMIN)
export class SellerController {
  constructor(private assetsService: AssetsService) {}

  @Post('assets')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetsService.createSellerAsset(user, dto);
  }

  @Patch('assets/:id')
  async update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.updateSellerAsset(user, id, dto);
  }

  @Get('assets')
  async mine(@CurrentUser() user: CurrentUserPayload) {
    return this.assetsService.listSellerAssets(user);
  }

  @Get('sales')
  async sales(@CurrentUser() user: CurrentUserPayload) {
    return this.assetsService.sellerSales(user);
  }

  @Post('assets/:id/attach-preview')
  async attachPreview(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: AttachPreviewDto,
  ) {
    return this.assetsService.attachPreview(user, id, dto.url);
  }

  @Post('assets/:id/attach-source')
  async attachSource(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: AttachSourceDto,
  ) {
    return this.assetsService.attachSource(user, id, dto);
  }
}

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AssetStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

class ToggleAssetDto {
  @IsEnum(AssetStatus)
  status!: AssetStatus;
}

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private assetsService: AssetsService) {}

  @Get('assets')
  async listAssets() {
    return this.assetsService.adminListAssets();
  }

  @Patch('assets/:id/status')
  async toggleStatus(
    @Param('id') id: string,
    @Body() dto: ToggleAssetDto,
  ) {
    return this.assetsService.adminToggleAsset(id, dto.status);
  }
}

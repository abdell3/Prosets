import { Body, Controller, Post } from '@nestjs/common';
import { StorageService } from './storage.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('presign-upload')
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async presignUpload(@Body() dto: PresignUploadDto) {
    return this.storageService.presignUpload(dto);
  }
}

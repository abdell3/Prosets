import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(user: CurrentUserPayload) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
    });
  }
}

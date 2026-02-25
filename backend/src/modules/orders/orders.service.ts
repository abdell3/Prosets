import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async listMyOrders(user: CurrentUserPayload) {
    return this.prisma.order.findMany({
      where: { buyerId: user.id },
      include: {
        items: {
          include: {
            asset: {
              include: { medias: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async downloadAsset(user: CurrentUserPayload, assetId: string) {
    const paidItem = await this.prisma.orderItem.findFirst({
      where: {
        assetId,
        order: {
          buyerId: user.id,
          status: OrderStatus.PAID,
        },
      },
      include: {
        asset: { include: { file: true } },
      },
    });

    if (!paidItem) {
      throw new ForbiddenException('Asset not purchased');
    }
    if (!paidItem.asset.file) {
      throw new NotFoundException('Source file not attached');
    }

    return this.storageService.presignDownload(paidItem.asset.file.s3Key);
  }

  async hasAccess(user: CurrentUserPayload, assetId: string) {
    const count = await this.prisma.orderItem.count({
      where: {
        assetId,
        order: {
          buyerId: user.id,
          status: OrderStatus.PAID,
        },
      },
    });
    return { hasAccess: count > 0 };
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetStatus, OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  AttachSourceDto,
  CreateAssetDto,
  ListAssetsQueryDto,
  UpdateAssetDto,
} from './dto/assets.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async listPublicAssets(query: ListAssetsQueryDto) {
    const where = {
      status: AssetStatus.ACTIVE,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.query
        ? {
            OR: [
              { title: { contains: query.query, mode: 'insensitive' as const } },
              {
                description: {
                  contains: query.query,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          category: true,
          medias: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  async getPublicAsset(id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, status: AssetStatus.ACTIVE },
      include: {
        category: true,
        seller: true,
        medias: true,
      },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async createSellerAsset(user: CurrentUserPayload, dto: CreateAssetDto) {
    if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seller access required');
    }
    return this.prisma.asset.create({
      data: {
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        currency: 'usd',
        categoryId: dto.categoryId,
        sellerId: user.id,
        status: dto.status ?? AssetStatus.INACTIVE,
      },
      include: { category: true },
    });
  }

  async updateSellerAsset(
    user: CurrentUserPayload,
    assetId: string,
    dto: UpdateAssetDto,
  ) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    if (user.role !== UserRole.ADMIN && asset.sellerId !== user.id) {
      throw new ForbiddenException('Not your asset');
    }
    return this.prisma.asset.update({
      where: { id: assetId },
      data: dto,
      include: { medias: true, file: true },
    });
  }

  async listSellerAssets(user: CurrentUserPayload) {
    return this.prisma.asset.findMany({
      where: {
        ...(user.role === UserRole.ADMIN ? {} : { sellerId: user.id }),
      },
      include: {
        category: true,
        medias: true,
        file: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async attachPreview(user: CurrentUserPayload, assetId: string, url: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    if (user.role !== UserRole.ADMIN && asset.sellerId !== user.id) {
      throw new ForbiddenException('Not your asset');
    }
    return this.prisma.assetMedia.create({
      data: {
        assetId,
        type: url.includes('.mp4') ? 'VIDEO' : 'IMAGE',
        url,
      },
    });
  }

  async attachSource(
    user: CurrentUserPayload,
    assetId: string,
    dto: AttachSourceDto,
  ) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    if (user.role !== UserRole.ADMIN && asset.sellerId !== user.id) {
      throw new ForbiddenException('Not your asset');
    }
    if (!dto.key.startsWith(`${assetId}/`) && !dto.key.includes(assetId)) {
      throw new BadRequestException('Invalid source key');
    }
    return this.prisma.assetFile.upsert({
      where: { assetId },
      update: {
        s3Key: dto.key,
        originalName: dto.originalName,
        sizeBytes: dto.sizeBytes,
      },
      create: {
        assetId,
        s3Key: dto.key,
        originalName: dto.originalName,
        sizeBytes: dto.sizeBytes,
      },
    });
  }

  async sellerSales(user: CurrentUserPayload) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: { status: OrderStatus.PAID },
        asset: user.role === UserRole.ADMIN ? undefined : { sellerId: user.id },
      },
      include: {
        order: true,
        asset: true,
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    const totalCents = items.reduce((acc, item) => acc + item.priceCents, 0);
    return {
      totalCents,
      sales: items,
    };
  }

  async adminListAssets() {
    return this.prisma.asset.findMany({
      include: { category: true, seller: true, medias: true, file: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminToggleAsset(assetId: string, status: AssetStatus) {
    return this.prisma.asset.update({
      where: { id: assetId },
      data: { status },
    });
  }
}

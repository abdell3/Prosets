import { AssetStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class ListAssetsQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 12;
}

export class CreateAssetDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(100)
  priceCents!: number;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  priceCents?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}

export class AttachPreviewDto {
  @IsString()
  url!: string;
}

export class AttachSourceDto {
  @IsString()
  key!: string;

  @IsString()
  originalName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sizeBytes!: number;
}

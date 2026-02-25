import { IsEnum, IsString } from 'class-validator';

export enum PresignKind {
  PREVIEW = 'PREVIEW',
  SOURCE = 'SOURCE',
}

export class PresignUploadDto {
  @IsEnum(PresignKind)
  kind!: PresignKind;

  @IsString()
  assetId!: string;

  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;
}

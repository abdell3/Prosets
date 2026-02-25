import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { getS3Client } from '../../config/s3.config';
import { v4 as uuidv4 } from 'uuid';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignKind } from './dto/presign-upload.dto';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

  async presignUpload(input: {
    kind: PresignKind;
    assetId: string;
    filename: string;
    contentType: string;
  }) {
    const ext = input.filename.split('.').pop() || 'bin';
    const key = `${input.assetId}/${uuidv4()}.${ext}`;
    const isPreview = input.kind === PresignKind.PREVIEW;
    const bucket = isPreview
      ? this.configService.s3PublicBucket
      : this.configService.s3PrivateBucket;

    const client = getS3Client(this.configService);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: input.contentType,
      ACL: isPreview ? 'public-read' : undefined,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    const publicUrl = isPreview
      ? `${this.configService.s3PublicBaseUrl}/${key}`
      : undefined;

    return {
      uploadUrl,
      publicUrl,
      key,
    };
  }

  async presignDownload(privateKey: string) {
    if (!privateKey) {
      throw new BadRequestException('Missing source key');
    }
    const client = getS3Client(this.configService);
    const command = new GetObjectCommand({
      Bucket: this.configService.s3PrivateBucket,
      Key: privateKey,
    });
    const downloadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    return { downloadUrl };
  }
}

import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from './config.service';

export const getS3Config = (configService: ConfigService) => ({
  region: configService.s3Region,
  endpoint: configService.s3Endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: configService.s3AccessKey,
    secretAccessKey: configService.s3SecretKey,
  },
});

export const getS3Client = (configService: ConfigService): S3Client => {
  return new S3Client(getS3Config(configService));
};

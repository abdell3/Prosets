import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', '');
  }

  get auth0Domain(): string {
    return this.configService.get<string>('AUTH0_DOMAIN', '');
  }

  get auth0Audience(): string {
    return this.configService.get<string>('AUTH0_AUDIENCE', '');
  }

  get auth0IssuerBaseUrl(): string {
    return this.configService.get<string>('AUTH0_ISSUER_BASE_URL', '');
  }

  get stripeSecretKey(): string {
    return this.configService.get<string>('STRIPE_SECRET_KEY', '');
  }

  get stripeWebhookSecret(): string {
    return this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
  }

  get appUrl(): string {
    return this.configService.get<string>('APP_URL', 'http://localhost:3000');
  }

  get apiUrl(): string {
    return this.configService.get<string>('API_URL', 'http://localhost:4000');
  }

  get s3Endpoint(): string {
    return this.configService.get<string>('S3_ENDPOINT', '');
  }

  get s3AccessKey(): string {
    return this.configService.get<string>('S3_ACCESS_KEY', '');
  }

  get s3SecretKey(): string {
    return this.configService.get<string>('S3_SECRET_KEY', '');
  }

  get s3Region(): string {
    return this.configService.get<string>('S3_REGION', 'us-east-1');
  }

  get s3PublicBucket(): string {
    return this.configService.get<string>('S3_PUBLIC_BUCKET', 'public-previews');
  }

  get s3PrivateBucket(): string {
    return this.configService.get<string>(
      'S3_PRIVATE_BUCKET',
      'private-sources',
    );
  }

  get s3PublicBaseUrl(): string {
    return this.configService.get<string>(
      'S3_PUBLIC_BASE_URL',
      `${this.s3Endpoint}/${this.s3PublicBucket}`,
    );
  }

  get devAuthBypass(): boolean {
    return this.configService.get<string>('DEV_AUTH_BYPASS', 'false') === 'true';
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}

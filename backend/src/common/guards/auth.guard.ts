import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwksClient;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.jwksClient = jwksRsa({
      jwksUri: `${this.configService.auth0IssuerBaseUrl}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{
        headers: Record<string, string | undefined>;
        user?: {
          id: string;
          sub: string;
          email: string;
          name?: string | null;
          role: UserRole;
        };
      }>();

    if (this.configService.devAuthBypass) {
      const devHeader = request.headers['x-dev-user'];
      if (devHeader) {
        const [emailRaw, roleRaw] = devHeader.split('|');
        const email = (emailRaw ?? '').trim().toLowerCase();
        const role = (roleRaw ?? 'BUYER').trim().toUpperCase() as UserRole;
        if (!email) {
          throw new UnauthorizedException('Invalid x-dev-user header');
        }

        const safeRole = Object.values(UserRole).includes(role)
          ? role
          : UserRole.BUYER;

        const dbUser = await this.prisma.user.upsert({
          where: { email },
          update: { role: safeRole },
          create: {
            email,
            role: safeRole,
            name: email.split('@')[0],
          },
        });

        request.user = {
          id: dbUser.id,
          sub: `dev|${dbUser.id}`,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        };

        return true;
      }
    }

    const authHeader = request.headers.authorization ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const decodedHeader = jwt.decode(token, { complete: true });
    const kid = decodedHeader?.header?.kid;
    if (!kid) {
      throw new UnauthorizedException('Invalid token header');
    }

    const key = await this.jwksClient.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const payload = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: `${this.configService.auth0IssuerBaseUrl}/`,
      audience: this.configService.auth0Audience,
    }) as jwt.JwtPayload;

    const email = (payload.email as string | undefined)?.toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Token missing email claim');
    }

    const dbUser = await this.prisma.user.upsert({
      where: { email },
      update: {
        name: (payload.name as string | undefined) ?? undefined,
      },
      create: {
        email,
        name: (payload.name as string | undefined) ?? email.split('@')[0],
        role: UserRole.BUYER,
      },
    });

    request.user = {
      id: dbUser.id,
      sub: (payload.sub as string | undefined) ?? `auth0|${dbUser.id}`,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
    return true;
  }
}

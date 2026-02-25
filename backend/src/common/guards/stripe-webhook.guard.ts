import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import Stripe from 'stripe';

interface StripeWebhookRequest {
  headers: { [key: string]: string | string[] | undefined };
  body: string | Buffer;
  stripeEvent?: Stripe.Event;
}

@Injectable()
export class StripeWebhookGuard implements CanActivate {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<StripeWebhookRequest>();
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      throw new UnauthorizedException('Missing Stripe signature');
    }

    try {
      const webhookSecret = this.configService.stripeWebhookSecret;
      const event = this.stripe.webhooks.constructEvent(
        request.body,
        signature as string,
        webhookSecret,
      );

      request.stripeEvent = event;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid Stripe webhook signature');
    }
  }
}

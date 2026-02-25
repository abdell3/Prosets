import { Controller, Headers, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from '../../config/config.service';
import { getStripeInstance } from '../../config/stripe.config';
import { PaymentsService } from '../payments/payments.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
    private paymentsService: PaymentsService,
  ) {}

  @Public()
  @Post('stripe')
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature?: string,
  ) {
    const stripe = getStripeInstance(this.configService);
    if (!signature || !req.rawBody) {
      this.logger.warn('Missing Stripe signature or raw body');
      return { received: false };
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.configService.stripeWebhookSecret,
      );
    } catch (error) {
      this.logger.error('Stripe webhook signature verification failed', error);
      return { received: false };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.paymentsService.markPaidFromStripe(
        session.id,
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      );
      this.logger.log(`Order marked PAID for session ${session.id}`);
    }

    return { received: true };
  }
}

import { ConfigService } from './config.service';
import Stripe from 'stripe';

export const getStripeConfig = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Kept for API consistency with getStripeInstance
  configService: ConfigService,
): Stripe.StripeConfig => ({
  apiVersion: '2025-02-24.acacia',
});

export const getStripeInstance = (configService: ConfigService): Stripe => {
  return new Stripe(
    configService.stripeSecretKey,
    getStripeConfig(configService),
  );
};

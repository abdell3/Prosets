import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetStatus, OrderStatus } from '@prisma/client';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { getStripeInstance } from '../../config/stripe.config';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createCheckoutSession(user: CurrentUserPayload, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { seller: true },
    });
    if (!asset || asset.status !== AssetStatus.ACTIVE) {
      throw new NotFoundException('Asset not found or inactive');
    }
    if (asset.sellerId === user.id) {
      throw new BadRequestException('You cannot buy your own asset');
    }

    const stripe = getStripeInstance(this.configService);
    const order = await this.prisma.order.create({
      data: {
        buyerId: user.id,
        status: OrderStatus.PENDING,
        totalCents: asset.priceCents,
        currency: asset.currency,
        items: {
          create: {
            assetId: asset.id,
            priceCents: asset.priceCents,
          },
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${this.configService.appUrl}/dashboard?paid=1`,
      cancel_url: `${this.configService.appUrl}/asset/${asset.id}?canceled=1`,
      metadata: {
        orderId: order.id,
        assetId: asset.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: asset.currency,
            unit_amount: asset.priceCents,
            product_data: {
              name: asset.title,
              description: asset.description,
            },
          },
        },
      ],
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return { checkoutUrl: session.url };
  }

  async markPaidFromStripe(
    stripeSessionId: string,
    paymentIntentId?: string | null,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { stripeSessionId },
    });
    if (!order) {
      return null;
    }
    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        paymentIntentId: paymentIntentId ?? undefined,
      },
    });
  }

  async simulatePaid(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });
  }
}

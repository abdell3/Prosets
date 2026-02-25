import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ConfigService } from '../../config/config.service';

@Controller()
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {}

  @Post('checkout/create-session')
  async createSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createCheckoutSession(user, dto.assetId);
  }

  @Post('checkout/simulate-paid/:orderId')
  async simulatePaid(@Param('orderId') orderId: string) {
    if (!this.configService.devAuthBypass) {
      return { message: 'Enable DEV_AUTH_BYPASS=true to use simulation.' };
    }
    return this.paymentsService.simulatePaid(orderId);
  }
}

import { Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('orders/my')
  async myOrders(@CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.listMyOrders(user);
  }

  @Post('assets/:id/download')
  async download(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.ordersService.downloadAsset(user, id);
  }

  @Get('assets/:id/has-access')
  async hasAccess(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.ordersService.hasAccess(user, id);
  }
}

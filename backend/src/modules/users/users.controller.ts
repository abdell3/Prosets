import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  async me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.me(user);
  }
}

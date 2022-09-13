import { Controller, Get, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../service/user.service';
import { BaseController, CurrentUser, QueryParser } from 'finfrac/core';
import { JwtAuthGuard } from '../../auth/guards';

@Controller('users')
export class UserController extends BaseController {
  constructor(
    protected service: UserService,
    protected config: ConfigService
  ) {
    super(config, service);
  }
  
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async getLoggedInUser(
    @CurrentUser() authUser: any,
    @Res() res,
    @Req() req
  ) {
    const queryParser = new QueryParser(req.query);
    const user = await this.service.findObject(String(authUser._id));
    const response = await this.service.getResponse({
      code: HttpStatus.OK,
      value: user,
      queryParser
    });
    return res.status(HttpStatus.OK).json(response);
  }
}

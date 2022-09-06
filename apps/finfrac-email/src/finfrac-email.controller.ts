import { Controller, HttpCode, HttpStatus, Post, Req, Res, Next } from "@nestjs/common";
import { FinfracEmailService } from './sendgrid/finfrac-email.service';
import { NextFunction } from "express";

@Controller()
export class FinfracEmailController {
  constructor(private readonly finfracEmailService: FinfracEmailService) {}

  @Post('/me')
  @HttpCode(HttpStatus.OK)
  public async updateMe(
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    return this.finfracEmailService.sendEmail({});
  }
}

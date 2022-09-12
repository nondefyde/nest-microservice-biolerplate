import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { FinfracEmailService } from './sendgrid/finfrac-email.service';

@Controller()
export class FinfracEmailController {
  constructor(private readonly finfracEmailService: FinfracEmailService) {}

  @Post('/me')
  @HttpCode(HttpStatus.OK)
  public async updateMe() {
    return this.finfracEmailService.sendEmail({});
  }
}

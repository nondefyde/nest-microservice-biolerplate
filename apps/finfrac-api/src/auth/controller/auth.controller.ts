import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { AuthSMS } from '../auth.sms';
import { AuthEmail } from '../auth.email';
import * as _ from 'lodash';
import {
  ChangePasswordDto,
  PasswordResetDto,
  ResetCodeDto,
  SendVerificationDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
  VerifyMobileDto
} from 'finfrac/core/shared/dto';
import { CurrentUser, QueryParser, ResponseOption } from 'finfrac/core/shared';
import { JwtAuthGuard, LocalAuthGuard } from 'finfrac/core/shared/guards';

@Controller('auth')
export class AuthController {
  constructor(
    protected service: AuthService,
    protected config: ConfigService,
  ) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  public async signUp(@Body() signUpDto: SignUpDto, @Req() req, @Res() res) {
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const { accessToken, auth } = await this.service.signUp(signUpDto);
    const email = await AuthEmail.verifyEmail(
        {
          from: this.config.get('app.fromEmail'),
          template: this.config.get('app.templates.email.verify'),
          verificationCodes: auth.verificationCodes?.email?.code,
        },
        auth,
      )
    const response = await this.service.getResponse(<ResponseOption>{
      email,
      token: accessToken,
      queryParser,
      code: HttpStatus.OK,
      value: {
        ..._.pick(auth, ['verifications', 'bvn', '_id']),
      },
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  public async signIn(@Body() signInDto: SignInDto, @Req() req, @Res() res) {
    // console.log('req:::', req);
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const { accessToken, auth } = await this.service.signIn(req.user);
    const response = await this.service.getResponse(<ResponseOption>{
      token: accessToken,
      queryParser,
      code: HttpStatus.OK,
      value: auth,
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/send-verification')
  @HttpCode(HttpStatus.OK)
  public async sendVerification(
    @CurrentUser() authUser: any,
    @Body() sendVerificationDto: SendVerificationDto,
    @Req() req,
    @Res() res,
  ) {
    const auth = await this.service.sendVerification(
      authUser,
      sendVerificationDto,
    );

    const { type } = sendVerificationDto;
    let filter: any = {
      email: await AuthEmail.verifyEmail(
        {
          from: this.config.get('app.fromEmail'),
          template: this.config.get('app.templates.email.verify'),
          verificationCodes: auth.verificationCodes?.email?.code,
        },
        auth,
      ),
    };
    if (type === 'mobile') {
      filter = {
        sms: await AuthSMS.verifyMobile(
          {
            template: this.config.get('app.templates.sms.verify'),
            verificationCodes: auth.verificationCodes?.mobile?.code,
          },
          auth,
        ),
      };
    }
    const response = await this.service.getResponse(<ResponseOption>{
      code: HttpStatus.OK,
      ...filter,
      value: {
        ..._.pick(auth, ['verifications', 'bvn', '_id']),
      },
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('/verify-email')
  @HttpCode(HttpStatus.OK)
  public async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req,
    @Res() res,
  ) {
    const auth = await this.service.verifyEmail(verifyEmailDto);
    const response = await this.service.getResponse(<ResponseOption>{
      code: HttpStatus.OK,
      value: {
        ..._.pick(auth, ['verifications', 'bvn', '_id']),
      },
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('/password-reset')
  @HttpCode(HttpStatus.OK)
  public async passwordReset(@Body() resetCodeDto: ResetCodeDto, @Res() res) {
    const auth = await this.service.requestPasswordRequest(resetCodeDto);
    let OTPCall: any = {};
    if (resetCodeDto.mobile) {
      OTPCall = {
        sms: await AuthSMS.verifyMobile(
          {
            template: this.config.get('app.templates.sms.verify'),
            verificationCodes: auth.verificationCodes?.resetPassword?.code,
          },
          auth,
        ),
      };
    }
    if (resetCodeDto.email) {
      OTPCall = {
        email: await AuthEmail.verifyEmail(
          {
            from: this.config.get('app.fromEmail'),
            type: 'password reset',
            subject: 'Reset password verification',
            template: this.config.get('app.templates.email.verify'),
            verificationCodes: auth.verificationCodes?.resetPassword?.code,
          },
          auth,
        ),
      };
    }
    const response = await this.service.getResponse({
      code: HttpStatus.OK,
      value: {
        email: auth.email,
        success: true,
      },
      ...OTPCall,
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(
    @Body() passwordResetDto: PasswordResetDto,
    @Res() res,
  ) {
    const auth = await this.service.resetPassword(passwordResetDto);
    const response = await this.service.getResponse({
      code: HttpStatus.OK,
      value: {
        email: auth.email,
        success: true,
      },
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async changePassword(
    @CurrentUser() authUser: any,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res,
  ) {
    const auth = await this.service.changePassword(authUser, changePasswordDto);
    const response = await this.service.getResponse({
      code: HttpStatus.OK,
      value: {
        email: auth.email,
        success: true,
      },
    });
    return res.status(HttpStatus.OK).json(response);
  }
}

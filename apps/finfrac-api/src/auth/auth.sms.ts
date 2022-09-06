import { SmsOption, Utils } from 'finfrac/core/shared';

export class AuthSMS {
  static async verifyBVN(config, auth, bvnBasic): Promise<SmsOption> {
    return {
      mobile: Utils.cleanUpMobileNumber(bvnBasic.phone_number1),
      template: config.template,
      content: {
        type: 'bvn',
        code: auth.verificationCodes?.bvn?.code,
      },
      from: config?.from,
    };
  }

  static async verifyMobile(config, auth): Promise<SmsOption> {
    return {
      mobile: Utils.cleanUpMobileNumber(auth.mobile.phoneNumber),
      template: config.template,
      content: {
        type: 'mobile',
        code: config.verificationCodes,
      },
      from: config?.from,
    };
  }
}

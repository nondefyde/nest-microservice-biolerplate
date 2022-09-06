import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import lang from '../../../lang';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  AppException,
  ChangePasswordDto,
  PasswordResetDto,
  ResetCodeDto,
  ResponseOption,
  SendVerificationDto,
  SignUpDto,
  Utils,
  VerifyEmailDto,
  VerifyMobileDto
} from 'finfrac/core/shared';
import { Auth, AuthDocument, User, UserDocument } from 'finfrac/core/models';
import { WorkService } from 'finfrac/core/service';
import { BaseService } from 'finfrac/core/base';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @InjectModel(Auth.name) protected model: Model<AuthDocument>,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
    private jwtService: JwtService,
    protected workService: WorkService,
    protected httpService: HttpService,
    protected config: ConfigService,
  ) {
    super();
    this.model = model;
  }

  /**
   * @param {SignUpDto} signUpDto signup payload
   * @return {Object} The success response object
   */
  public async signUp(signUpDto: SignUpDto): Promise<any> {
    let session;
    try {
      /**
       * Throws error if bvn already exist
       */
      const { email, password } = signUpDto;

      let auth = await this.model.findOne({email});
      if (auth) {
        throw AppException.CONFLICT(lang.get('auth').userExist);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const expiration = Utils.addHourToDate(1);
      const code = this.getCode();

      let filter: any = { email: email };
      let verificationCode: any = {
        'verificationCodes.email': { code, expiration },
      };
      session = await this.model.startSession();
      await session.startTransaction();
      auth = await this.model.findOneAndUpdate(
        filter,
        {
          $setOnInsert: {
            publicId: Utils.generateUniqueId('auth'),
          },
          password: hashedPassword,
          $set: verificationCode,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, session },
      );
      // console.log('auth ::: ', auth);
      await this.userModel.findOneAndUpdate(
        { _id: auth._id },
        {
          $setOnInsert: {
            publicId: Utils.generateUniqueId('user'),
            ...signUpDto,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          session,
        },
      );
      // console.log('auth 2 ::: ', auth);
      await session?.commitTransaction();
      return this.signIn(auth);
    } catch (error) {
      await session?.abortTransaction();
      throw error;
    } finally {
      await session?.endSession();
    }
  }

  /**
   * @param {Object} authUser The authenticated user
   * @param {BvnDto} verifyMobileDto The payload object
   * @return {Object}
   */
  public async verifyMobile(authUser: any, verifyMobileDto: VerifyMobileDto) {
    try {
      let auth = await this.model.findOne({
        _id: authUser._id,
        'mobile.phoneNumber': verifyMobileDto.mobile.phoneNumber,
      });
      if (!auth) {
        throw AppException.NOT_FOUND(lang.get('error').not_found);
      }
      const authData = {
        verified: auth.verifications?.mobile,
        expiration: auth.verificationCodes?.mobile?.expiration,
        code: auth.verificationCodes?.mobile?.code,
      };
      const canVerifyError = await this.canVerify(authData, {
        code: verifyMobileDto.verificationCode,
      });
      if (canVerifyError) {
        throw canVerifyError;
      }
      const { verifications, verificationCodes } = Utils.updateVerification(
        auth,
        'mobile',
      );
      auth.verifications = verifications;
      auth.verificationCodes = verificationCodes;
      auth = await auth.save();
      return auth;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {Object} authUser The authenticated user
   * @param {SendVerificationDto} resendVerificationDto The payload object
   * @return {Object}
   */
  public async sendVerification(
    authUser: any,
    resendVerificationDto: SendVerificationDto,
  ) {
    try {
      const { type } = resendVerificationDto;
      if (authUser.verifications[type]) {
        throw AppException.NOT_FOUND(lang.get('auth').dataVerified);
      }
      let auth: any = await this.model.findOne({
        _id: authUser._id,
      });
      if (!authUser[type]) {
        await this.userModel.updateOne(
          { _id: authUser._id },
          { [type]: resendVerificationDto[type] },
        );
        auth[type] = resendVerificationDto[type];
        auth = await auth.save();
      }
      const expiration = Utils.addHourToDate(1);
      const code = this.getCode();
      auth.verificationCodes = {
        ...auth.verificationCodes,
        [type]: { code, expiration },
      };
      return auth.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {VerifyEmailDto} verifyEmailDto The payload object
   * @return {Object}
   */
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      let auth = await this.model.findOne({
        email: verifyEmailDto.email,
      });
      if (!auth) {
        throw AppException.NOT_FOUND(lang.get('error').not_found);
      }
      const canVerifyError = await this.canVerify(
        {
          verified: auth.verifications?.email,
          expiration: auth.verificationCodes?.email?.expiration,
          code: auth.verificationCodes?.email?.code,
        },
        {
          code: verifyEmailDto.verificationCode,
        },
      );

      if (canVerifyError) {
        throw canVerifyError;
      }
      const { verifications, verificationCodes } = Utils.updateVerification(
        auth,
        'email',
      );
      auth.verifications = verifications;
      auth.verificationCodes = verificationCodes;
      auth = await auth.save();
      return auth;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {Auth} auth The payload object
   * @return {Object}
   */
  async signIn(auth) {
    const payload = {
      username: auth.email ? auth.email : auth?.mobile?.phoneNumber,
      sub: auth._id,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      auth,
    };
  }

  /**
   * @param {Object} authData The auth object
   * @param {Object} payloadData The payload data
   * @return {Object} returns error or null for pass
   */
  async canVerify(authData, payloadData: any) {
    if (authData.verified) {
      throw AppException.UNAUTHORIZED(lang.get('auth').dataVerified);
    }
    if (payloadData.code) {
      if (authData.code !== payloadData.code) {
        return AppException.UNAUTHORIZED(lang.get('auth').invalidCode);
      }
      if (new Date() > new Date(authData.expiration)) {
        return AppException.UNAUTHORIZED(lang.get('auth').expiredCode);
      }
      // Todo format dob for proper comparison
    } else if (
      authData.dob !== payloadData.dob ||
      authData?.gender?.toLowerCase() !== payloadData?.gender?.toLowerCase()
    ) {
      return AppException.UNAUTHORIZED(lang.get('auth').dataInvalid);
    }
    return null;
  }

  /**
   * @param {SendVerificationDto} payload The access token for verification
   * @return {Promise} The result of the find
   */
  async requestPasswordRequest(payload: ResetCodeDto) {
    const auth = await this.model.findOne({email: payload.email});
    if (!auth) {
      throw AppException.NOT_FOUND(lang.get('error').not_found);
    }
    const expiration = Utils.addHourToDate(1);
    const code = this.getCode();
    auth.verificationCodes = {
      ...auth.verificationCodes,
      resetPassword: { code, expiration },
    };
    return auth.save();
  }

  /**
   * @param {SendVerificationDto} passwordResetDto The access token for verification
   * @return {Promise} The result of the find
   */
  async resetPassword(passwordResetDto: PasswordResetDto) {
    const auth = await this.model.findOne({ email: passwordResetDto.email });
    if (!auth) {
      throw AppException.NOT_FOUND(lang.get('error').not_found);
    }

    const canResetError = await this.cannotResetPassword(
      {
        expiration: auth.verificationCodes?.resetPassword?.expiration,
        code: auth.verificationCodes?.resetPassword?.code,
      },
      {
        code: passwordResetDto.verificationCode,
      },
    );

    if (canResetError) {
      throw canResetError;
    }
    auth.password = await bcrypt.hash(passwordResetDto.password, 10);
    auth.verificationCodes = _.omit(
      {
        ...auth.verificationCodes,
      },
      ['resetPassword'],
    );
    return auth.save();
  }

  /**
   * @param {Object} authData The main property
   * @param {Object} payloadData The object properties
   * @return {Object} returns the main error if main cannot be verified
   */
  async cannotResetPassword(authData, payloadData: any) {
    if (!authData.code) {
      return AppException.UNAUTHORIZED(lang.get('error').un_authorized);
    }
    if (authData.code !== payloadData.code) {
      return AppException.UNAUTHORIZED(lang.get('auth').invalidCode);
    }
    if (new Date() > new Date(authData.expiration)) {
      return AppException.UNAUTHORIZED(lang.get('auth').expiredCode);
    }
    return null;
  }

  /**
   * @param {Object} authUser The access token for verification
   * @param {SendVerificationDto} payload The access token for verification
   * @return {Promise} The result of the find
   */
  async changePassword(authUser: any, payload: ChangePasswordDto) {
    const auth = await this.model.findById(authUser._id).select('+password');
    const isAuthenticated = await bcrypt.compare(
      payload.currentPassword,
      auth.password,
    );
    if (!isAuthenticated) {
      throw AppException.UNAUTHORIZED(lang.get('auth').invalidUser);
    }
    auth.password = await bcrypt.hash(payload.password, 10);
    return auth.save();
  }

  /**
   * @param {ResponseOption} option should throw error if true
   * @return {Object} The success response object
   */
  public async getResponse(option: ResponseOption) {
    if (option.email) {
      this.workService.queueToSendEmail(option.email);
    }
    if (option.sms) {
      this.workService.queueToSendSms(option.sms);
    }
    return super.getResponse(option);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const auth: any = await this.model
      .findOne({
        $or: [{ email: username }, { 'mobile.phoneNumber': username }],
      })
      .select('+password');
    console.log('auth:::', auth);
    if (!auth) {
      return null;
    }

    const valid = await bcrypt.compare(pass, auth.password);

    console.log('valid ::: ', valid);

    if (valid) {
      return auth;
    }
    return null;
  }
  /**
   * @return {String} return code
   */
  public getCode() {
    return this.config.get('app.environment') === 'production'
      ? Utils.generateOTCode(4)
      : this.config.get('app.defaultVerifyCode');
  }
}

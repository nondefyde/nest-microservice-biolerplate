import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MobileDto } from 'finfrac/core/shared/dto';

export class SendVerificationDto {
  @Transform((s) => String(s.value).trim().toLowerCase())
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ValidateNested({ message: 'invalid mobile number' })
  @ValidateIf((o) => !o.email)
  @Type(() => MobileDto)
  @IsNotEmpty()
  readonly mobile: MobileDto;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['mobile', 'email', 'resetPassword'])
  readonly type: string;
}

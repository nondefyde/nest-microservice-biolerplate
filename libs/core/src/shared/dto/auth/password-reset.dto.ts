import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class PasswordResetDto {
  @Transform((s) => String(s.value).trim().toLowerCase())
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;

  @IsString()
  @IsNotEmpty()
  @Transform((s) => String(s).trim())
  readonly password: string;
}

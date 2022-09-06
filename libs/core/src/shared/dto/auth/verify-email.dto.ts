import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly verificationCode: string;
}

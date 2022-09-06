import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpDto {
  @Transform((s) => String(s.value).trim().toLowerCase())
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @MinLength(8, { message: 'Password is too short (8 characters min)' })
  @MaxLength(20, { message: 'Password is too long (20 characters max)' })
  password: string;
}

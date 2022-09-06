import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
  @Transform((s) => String(s.value).trim().toLowerCase())
  @IsString()
  @IsOptional()
  readonly email: string;

  @IsString()
  @MinLength(8, { message: 'Password is too short (8 characters min)' })
  @MaxLength(20, { message: 'Password is too long (20 characters max)' })
  password: string;
}

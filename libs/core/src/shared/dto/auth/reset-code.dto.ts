import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetCodeDto {
  @Transform((s) => String(s.value).trim().toLowerCase())
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

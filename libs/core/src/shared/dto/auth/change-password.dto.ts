import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  @Transform((s) => String(s.value).trim())
  readonly currentPassword: string;

  @IsString()
  @Transform((s) => String(s.value).trim())
  readonly password: string;
}

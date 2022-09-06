import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform((s) => String(s.value).trim().toLowerCase())
  readonly email: string;
}

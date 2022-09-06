import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MobileDto } from 'finfrac/core/shared';

export class VerifyMobileDto {
  @IsNotEmpty()
  @ValidateNested({ message: 'invalid mobile number' })
  @Type(() => MobileDto)
  readonly mobile: MobileDto;

  @IsString()
  @IsNotEmpty()
  readonly verificationCode: string;
}

import { ArgumentMetadata } from '@nestjs/common';
import { IsString, ValidateNested } from 'class-validator';
import { ValidationPipe } from './validation.pipe';
import { Type } from 'class-transformer';

describe('ValidationPipe - test', () => {
  class MockDto {
    @IsString()
    phoneNumber: string;
    @IsString()
    isoCode: string;
  }

  class MockDtoNoValidation {
    @ValidateNested()
    @Type(() => MockDto)
    mockdto: MockDto;
    @IsString()
    name: string;
  }

  let validationPipe: any;
  beforeEach(() => {
    validationPipe = new ValidationPipe();
  });
  it('ValidationPipe - should be defined', () => {
    expect(validationPipe).toBeDefined();
  });
  it('ValidationPipe - validate offer with metaType', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: MockDto,
      data: '',
    };
    await validationPipe.transform(<MockDto>{}, metadata).catch((e) => {
      //   console.log(e);
      expect(e).toBeInstanceOf(Object);
    });
  });
  it('ValidationPipe - validate offer without metaType', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      data: '',
    };
    const validator = await validationPipe.transform(<MockDto>{}, metadata);
    expect(validator).toBeInstanceOf(Object);
  });
  it('ValidationPipe - validate offer with Nested Validation', async () => {
    const metadata2: ArgumentMetadata = {
      type: 'body',
      metatype: MockDtoNoValidation,
      data: '',
    };
    // expect(
    //   async () =>
    //     await validationPipe.transform(
    //       <MockDtoNoValidation>{
    //         mockdto: {} as MockDto,
    //       },
    //       metadata2,
    //     ),
    // ).rejects.toThrow(AppException);
  });
  it('ValidationPipe - validate offer with valid offer metaTpe', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: MockDto,
      data: '',
    };
    const validator = await validationPipe.transform(
      <MockDto>{
        phoneNumber: '09099889988',
        isoCode: '+234',
      },
      metadata,
    );
    expect(validator).toBeInstanceOf(Object);
    expect(validator).toHaveProperty('phoneNumber');
    expect(validator).toHaveProperty('isoCode');
  });
});

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../../exceptions';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const meta: any = {};
    let code = 500;
    if (
      exception instanceof AppException ||
      exception instanceof HttpException
    ) {
      code = exception.getStatus();
      meta.statusCode = exception.getStatus();
      meta.error = exception.getResponse();
    } else if (exception instanceof Error) {
      code = HttpStatus.INTERNAL_SERVER_ERROR;
      meta.statusCode = code;
      meta.error = { code, message: exception.message };
      meta.developer_message = exception;
    } else {
      code = HttpStatus.INTERNAL_SERVER_ERROR;
      meta.statusCode = code;
      meta.error = {
        code: code,
        message: 'A problem with our server, please try again later',
      };
      meta.developer_message = exception;
    }

    response.status(code).send({ meta });
  }
}

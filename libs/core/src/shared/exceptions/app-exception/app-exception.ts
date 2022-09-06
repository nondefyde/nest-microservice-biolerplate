import { HttpStatus } from '@nestjs/common';

export class AppException {
  constructor(
    readonly code: number,
    readonly message: any,
    readonly messages?: string[],
  ) {}

  static NOT_FOUND = (message) => {
    return new AppException(HttpStatus.NOT_FOUND, message);
  };

  static FORBIDDEN = (message) => {
    return new AppException(HttpStatus.FORBIDDEN, message);
  };

  static PRECONDITION_FAILED = (message) => {
    return new AppException(HttpStatus.PRECONDITION_FAILED, message);
  };

  static UNAUTHORIZED = (message) => {
    return new AppException(HttpStatus.UNAUTHORIZED, message);
  };

  static INVALID_TOKEN() {
    return new AppException(
      HttpStatus.UNAUTHORIZED,
      'Invalid authentication token',
    );
  }

  static INTERNAL_SERVER = (message, messages?) => {
    return new AppException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      messages,
    );
  };

  static CONFLICT = (message) => {
    return new AppException(HttpStatus.CONFLICT, message);
  };

  static INVALID_INPUT = (message) => {
    return new AppException(HttpStatus.BAD_REQUEST, message);
  };

  getStatus() {
    return this.code;
  }

  getResponse() {
    const response: any = {
      code: this.code || 500,
      message: this.message,
    };
    if (this.messages) {
      response.messages = this.messages;
    }
    return response;
  }
}

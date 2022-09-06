import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppException } from 'finfrac/core/shared';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/v1/ping' && req.method === 'GET') {
      return next();
    }
    const apiKey: any = req.query.api_key || req.headers['x-api-key'];
    if (!apiKey) {
      return next(new AppException(HttpStatus.UNAUTHORIZED, 'Api key absent'));
    }
    if (apiKey === this.config.get('app.apikey')) {
      return next();
    }
    next();
  }
}

import { Get, HttpCode, HttpStatus, Next, Param, Req, Res } from "@nestjs/common";
import { NextFunction } from "express";
import { BaseService } from "finfrac/core/base";

export class BaseController {
  constructor(protected service: BaseService) {
  }

  @Get("/")
  @HttpCode(HttpStatus.OK)
  public async find(
    @Res() res,
    @Req() req,
    @Next() next: NextFunction
  ) {
    try {
      const value = await this.service.find();
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
}

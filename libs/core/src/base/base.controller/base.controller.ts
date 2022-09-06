import { ConfigService } from '@nestjs/config';
import { Body, Delete, Get, HttpCode, HttpStatus, Next, Param, Patch, Post, Put, Req, Res } from '@nestjs/common';
import * as _ from 'lodash';
import { NextFunction } from 'express';
import { AppException, Pagination, QueryParser } from 'finfrac/core/shared';
import { BaseService, PGBaseService } from 'finfrac/core/base';

export class BaseController {
  protected lang: any = {
    get: (key = 'Data') => {
      return {
        created: `${key} successfully created`,
        updated: `${key} successfully updated`,
        deleted: `${key} successfully deleted`,
        not_found: `${key} not found`,
      };
    },
  };

  constructor(
    protected config: ConfigService,
    protected service: BaseService | PGBaseService,
  ) {}

  @Get('/unique/:key')
  @HttpCode(HttpStatus.OK)
  public async findByUniqueKey(
    @Param('key') key: string,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const value = await this.service.findByUniqueKey(key, req.params);
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
  
  @Post('/')
  @HttpCode(HttpStatus.OK)
  public async create(
    @Body() payload: any,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));

      if (!this.service.routes.create) {
        const appError = new AppException(
          HttpStatus.METHOD_NOT_ALLOWED,
          'Create is not allowed for this Item',
        );
        return next(appError);
      }

      const obj = await this.service.prepareBodyObject(req);
      let value = await this.service.retrieveExistingResource(obj);

      if (value) {
        const returnIfFound = this.service.entity.config.returnDuplicate;
        if (!returnIfFound) {
          const messageObj =
            this.service.entity.config.uniques.length > 0
              ? this.service.entity.config.uniques.map((m) => ({
                  [m]: `${m} must be unique`,
                }))
              : '';
          const appError = new AppException(
            HttpStatus.CONFLICT,
            'Duplicate record is not allowed',
            messageObj,
          );
          return next(appError);
        }
      } else {
        const checkError = await this.service.validateCreate(obj);
        if (checkError) {
          return next(checkError);
        }

        value = await this.service.createNewObject(obj);
      }

      const response = await this.service.getResponse(
        await this.service.postCreate({
          queryParser,
          value,
          code: HttpStatus.CREATED,
          message: this.lang.get(this.service.modelName).created,
        }),
      );

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  public async find(@Req() req, @Res() res, @Next() next: NextFunction) {
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const pagination = new Pagination(
      req.originalUrl,
      this.service.baseUrl,
      this.service.itemsPerPage,
    );

    try {
      const { value, count } = await this.service.buildModelQueryObject(
        pagination,
        queryParser,
      );

      const response = await this.service.getResponse(
        await this.service.postFind({
          code: HttpStatus.OK,
          value,
          count,
          queryParser,
          pagination,
        }),
      );

      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  public async findOne(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const object = await this.service.findObject(id, queryParser);

      const response = await this.service.getResponse(
        await this.service.postFindOne({
          queryParser,
          code: HttpStatus.OK,
          value: object,
        }),
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
  
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  public async patch(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      if (!this.service.routes.patch) {
        const appError = new AppException(
          HttpStatus.METHOD_NOT_ALLOWED,
          'Patch is not allowed for this Item',
        );
        return next(appError);
      }

      if (req?.user?.walletAddress) {
        Object.assign(req.query, { walletAddress: req?.user?.walletAddress });
        payload = Object.assign(payload, {
          walletAddress: req.user.walletAddress,
        });
      }

      const queryParser = new QueryParser(Object.assign({}, req.query));
      let object = await this.service.findObject(id, queryParser);
      object = await this.service.patchUpdate(object, payload);
      const canUpdateError = await this.service.validateUpdate(object, payload);
      if (!_.isEmpty(canUpdateError)) {
        throw canUpdateError;
      }
      const response = await this.service.getResponse(
        await this.service.postPatch({
          queryParser,
          code: HttpStatus.OK,
          value: object,
          message: this.lang.get(this.service.modelName).updated,
        }),
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      return next(err);
    }
  }
  
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      if (!this.service.routes.update) {
        // throw AppException.NOT_FOUND;
        const appError = new AppException(
          HttpStatus.METHOD_NOT_ALLOWED,
          'Put is not allowed for this Item',
        );
        return next(appError);
      }
      const queryParser = new QueryParser(Object.assign({}, req.query));
      let object = await this.service.findObject(id, queryParser);
      if (!object) {
        throw AppException.NOT_FOUND;
      }

      const canUpdateError = await this.service.validateUpdate(object, payload);

      if (!_.isEmpty(canUpdateError)) {
        throw canUpdateError;
      }

      object = await this.service.updateObject(id, payload);
      const response = await this.service.getResponse(
        await this.service.postUpdate({
          queryParser,
          code: HttpStatus.OK,
          value: object,
          message: this.lang.get(this.service.modelName).updated,
        }),
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
  
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  public async remove(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      if (!this.service.routes.remove) {
        // throw AppException.NOT_FOUND;
        const appError = new AppException(
          HttpStatus.METHOD_NOT_ALLOWED,
          'Delete is not allowed for this Item',
        );
        return next(appError);
      }
      req.query = req.query ? req.query : {};
      if (req.user.walletAddress) {
        Object.assign(req.query, { walletAddress: req.user.walletAddress });
      }

      const queryParser = new QueryParser(Object.assign({}, req.query));
      let object = await this.service.findObject(id, queryParser);

      if (!object) {
        throw AppException.NOT_FOUND;
      }
      const canDeleteError = await this.service.validateDelete(object);
      if (!_.isEmpty(canDeleteError)) {
        throw canDeleteError;
      }

      object = await this.service.deleteObject(object);

      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value: { _id: object._id || object.publicId },
        message: this.lang.get(this.service.modelName).deleted,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Get('/:id/validate')
  @HttpCode(HttpStatus.OK)
  public async validate(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      const payLoad = { id };
      const object = await this.service.validateObject(payLoad);
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value: {
          _id: object ? object._id || object.publicId : null,
        },
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Get('/search/one')
  @HttpCode(HttpStatus.OK)
  public async searchOne(@Req() req, @Res() res, @Next() next: NextFunction) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      // const query = _.omit(queryParser.query, ['deleted']);
      let object = null;
      if (!_.isEmpty(queryParser.query)) {
        object = await this.service.searchOneObject(queryParser.query);
      }
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value: object ?? { _id: null },
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
}

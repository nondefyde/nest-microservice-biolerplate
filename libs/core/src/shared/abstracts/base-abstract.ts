import * as _ from 'lodash';
import { AppResponse, ResponseOption } from 'finfrac/core/shared';

export abstract class BaseAbstract {
  public routes = {
    create: true,
    findOne: true,
    find: true,
    update: true,
    patch: true,
    remove: true,
  };
  public modelName: string;
  public baseUrl = 'localhost:3000';
  public itemsPerPage = 10;
  public entity;
  protected model;
  protected defaultConfig = {
    idToken: 'key',
    softDelete: false,
    uniques: [],
    returnDuplicate: false,
    fillables: [],
    updateFillables: [],
    dateFilters: [],
    hiddenFields: ['deleted'],
  };

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateCreate(obj) {
    return null;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateDelete(obj) {
    return null;
  }

  /**
   * @param {Object} current required for response
   * @param {Object} obj required for response
   * @return {Object}
   */
  public async validateUpdate(current, obj: any) {
    return null;
  }

  /**
   * @param {Object} response required for response
   * @return {Object}
   */
  public async postCreate(response: any) {
    return response;
  }

  /**
   * @param {Object} response required for response
   * @return {Object}
   */
  public async postUpdate(response: any) {
    return response;
  }

  /**
   * @param {Object} response required for response
   * @return {Object}
   */
  public async postPatch(response: any) {
    return response;
  }

  /**
   * @param {Object} response required for response
   * @return {Object}
   */
  public async postFind(response) {
    return response;
  }

  /**
   * @param {Object} response required for response
   * @return {Object}
   */
  public async postFindOne(response) {
    return response;
  }

  /**
   * @param {ResponseOption} option: required email for search
   * @return {Object} The formatted response
   */
  public async getResponse(option: ResponseOption) {
    try {
      this.model = option.model ?? this.model;
      const meta: any = AppResponse.getSuccessMeta();
      if (option.token) {
        meta.token = option.token;
      }
      Object.assign(meta, { statusCode: option.code });
      if (option.message) {
        meta.message = option.message;
      }
      if (option.value && option.queryParser && option.queryParser.population) {
        option.value = await this.model.populate(
          option.value,
          option.queryParser.population,
        );
      }
      if (option.pagination && !option.queryParser.getAll) {
        option.pagination.totalCount = option.count;
        if (option.pagination.morePages(option.count)) {
          option.pagination.next = option.pagination.current + 1;
        }
        meta.pagination = option.pagination.done();
      }
      if (
        this.entity.config.hiddenFields &&
        this.entity.config.hiddenFields.length
      ) {
        const isFunction = typeof option.value.toJSON === 'function';
        if (Array.isArray(option.value)) {
          option.value = option.value.map((v) =>
            typeof v === 'string'
              ? v
              : _.omit(
                  isFunction ? v.toJSON() : v,
                  ...this.entity.config.hiddenFields,
                ),
          );
        } else {
          option.value = _.omit(
            isFunction ? option.value.toJSON() : option.value,
            ...this.entity.config.hiddenFields,
          );
        }
      }
      return AppResponse.format(meta, option.value);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} req The request object
   * @return {Promise<Object>}
   */
  public async prepareBodyObject(req) {
    let obj = Object.assign({}, req.body);
    if (req.user) {
      obj = Object.assign(obj, { user: req.user, userId: req.user._id });
    }
    return obj;
  }

  /**
   * @param {Object} pagination The pagination object
   * @param {Object} query The query
   * @param {Object} queryParser The query parser
   * @return {Object}
   */
  public async buildModelAggregateQueryObject(
    pagination,
    query,
    queryParser = null,
  ) {
    return null;
  }

  /**
   * @param {Object} obj The request object
   * @return {Promise<Object>}
   */
  public async retrieveExistingResource(obj) {
    return null;
  }
}

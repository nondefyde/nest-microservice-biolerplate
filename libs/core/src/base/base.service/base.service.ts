import { AppResponse, ResponseOption } from 'finfrac/core/shared';
import * as _ from 'lodash';

export class BaseService {
  protected model: any;
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
        this.model.config.hiddenFields &&
        this.model.config.hiddenFields.length
      ) {
        const isFunction = typeof option.value.toJSON === 'function';
        if (Array.isArray(option.value)) {
          option.value = option.value.map((v) =>
            typeof v === 'string'
              ? v
              : _.omit(
                isFunction ? v.toJSON() : v,
                ...this.model.config.hiddenFields,
              ),
          );
        } else {
          option.value = _.omit(
            isFunction ? option.value.toJSON() : option.value,
            ...this.model.config.hiddenFields,
          );
        }
      }
      return AppResponse.format(meta, option.value);
    } catch (e) {
      throw e;
    }
  }
  
  public async find() {
    console.log('hello ');
    return [
      {name: "Emma"},
      {name: "Tobi"},
      {name: "Ayo"},
    ]
  }
}

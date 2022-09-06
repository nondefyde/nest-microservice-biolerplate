import * as _ from 'lodash';
import { AppException, BaseAbstract, Pagination, QueryParser, Utils } from 'finfrac/core/shared';

export class PGBaseService extends BaseAbstract {
  public routes = {
    create: true,
    findOne: true,
    find: true,
    update: true,
    patch: true,
    remove: true,
  };
  public readonly modelName: string;
  public baseUrl = 'localhost:3000';
  public itemsPerPage = 10;
  public entity;

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

  constructor(protected repository: any) {
    super();
    this.modelName = repository.target.name;
    this.entity = repository.target;
    if (!this?.entity?.config) {
      this.entity.config = { ...this.defaultConfig };
      Object.assign(this.defaultConfig, this.entity.config());
    }
    Object.assign(this.routes, this.entity.routes);
    this.entity.config = this.defaultConfig;
  }

  /**
   * @param {Object} obj The payload object
   * @param {Object} session The payload object
   * @return {Object}
   */
  public async createNewObject(obj, session?) {
    const tofill = this.entity.config.fillables;
    let payload = { ...obj };
    if (tofill && tofill.length > 0) {
      payload = _.pick(obj, ...tofill);
    }
    if (obj.userId) {
      payload.userId = String(obj.userId);
    }
    let data = this.repository.create({
      ...payload,
    });
    data = await this.repository.save(data);
    return data;
  }

  /**
   * @param {String} id The payload object
   * @param {QueryParser} queryParser The payload object
   * @return {Object}
   */
  public async findObject(id, queryParser: QueryParser = null) {
    const condition: any = {};
    if (!isNaN(id)) {
      condition['id'] = id;
    } else {
      condition['publicId'] = id;
    }
    const object: any = await this.repository.findOne({
      where: {
        ...condition,
      },
    });
    if (!object) {
      throw AppException.NOT_FOUND('Resource doesnt exist');
    }
    return object;
  }

  /**
   * @param {Object} id The payload object
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async updateObject(id, obj) {
    const tofill = this.entity.config.updateFillables;
    if (tofill && tofill.length > 0) {
      obj = _.pick(obj, ...tofill);
    }
    let object = await this.findObject(id);
    object = await this.repository.merge(object, obj);
    return this.repository.save(object);
  }

  /**
   * @param {Object} current The payload object
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async patchUpdate(current, obj) {
    const tofill = this.entity.config.updateFillables;
    if (tofill && tofill.length > 0) {
      obj = _.pick(obj, ...tofill);
    }
    const object = await this.repository.merge(current, obj);
    return this.repository.save(object);
  }

  /**
   * @param {Object} object The payload object
   * @return {Object}
   */
  public async deleteObject(object) {
    if (this.entity.config.softDelete) {
      object = await this.repository.softDelete(object);
    } else {
      object = await this.repository.remove(object);
    }
    if (!object) {
      throw AppException.NOT_FOUND;
    }

    return object;
  }

  /**
   * @param {Pagination} pagination The pagination object
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   */
  async buildModelQueryObject(
    pagination: Pagination,
    queryParser: QueryParser = null,
  ) {
    const dateFilters = this?.entity?.config?.dateFilters;
    if (dateFilters && dateFilters.length > 0) {
      dateFilters.forEach((key: string) => {
        if (queryParser.query[key]) {
          queryParser.query[key] = Utils.generateDateRange(
            queryParser.query[key],
            'SQL'
          );
        }
      });
    }

    const query = await this.repository
      .createQueryBuilder(this.modelName)
      .setFindOptions({
        where: {
          ..._.omit(queryParser.query, ['deleted']),
        },
      });
    if (
      queryParser.search &&
      this.entity.searchQuery &&
      this.entity.searchQuery(queryParser.search).length > 0
    ) {
      const searchQuery = this.entity.searchQuery(queryParser.search);
      for (const q of searchQuery) {
        query.orWhere(q.query, q.data);
      }
    }

    const orders =
      queryParser && queryParser.sort
        ? Object.assign(queryParser.sort, { createdAt: 'ASC' })
        : { createdAt: 'ASC' };

    query.setFindOptions({
      order: orders,
    });

    if (!queryParser.getAll) {
      query.take(pagination.perPage);
      query.skip(pagination.skip);
    }

    if (queryParser.selection && queryParser.selection.length) {
      await query.select(queryParser.selection || []);
    }

    const [value, count] = await query.getManyAndCount();
    return {
      value,
      count,
    };
  }

  /**
   * @param {Object} key The unique key
   * @param {Object} params The request param
   * @return {Array}
   */
  public async findByUniqueKey(key, params = {}) {
    const data = await this.repository
      .createQueryBuilder(this.modelName)
      .select(key)
      .distinct(true)
      .getRawMany();
    return data.map((d) => d[key]);
  }

  /**
   * @param {String} payLoad The payload object
   * @return {Object}
   */
  public async validateObject(payLoad) {
    return this.findObject(payLoad.id);
  }

  /**
   * @param {QueryParser} queryString The query object
   * @return {Object}
   */

  public async searchOneObject(queryString: Record<string, any>) {
    const queryParams = _.omit(queryString, ['latest', 'deleted']);
    console.log('queryParams ::: ', queryParams);
    const query = await this.repository
      .createQueryBuilder(this.modelName)
      .setFindOptions({
        where: {
          ...queryParams,
        },
      });
    if (query.latest) {
      try {
        const latestQuery = JSON.parse(query.latest);
        query.setFindOptions({
          order: latestQuery,
        });
      } catch (e) {}
    }
    return query.getOne();
  }
}

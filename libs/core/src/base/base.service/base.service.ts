import * as _ from 'lodash';
import {
  AppException,
  BaseAbstract,
  Pagination,
  QueryParser,
  Utils,
} from 'finfrac/core/shared';

export class BaseService extends BaseAbstract {
  constructor(protected model: any) {
    super();
    this.modelName = model.collection.collectionName;
    this.entity = model;

    if (!this?.entity?.config) {
      this.entity.config = { ...this.defaultConfig };
    }
    Object.assign(this.defaultConfig, this.entity.config());
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
      payload.user = obj.userId;
    }
    const data = new this.model({
      ...payload,
      publicId: Utils.generateUniqueId(this.defaultConfig.idToken),
    });
    return data.save();
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
    return this.model.findOneAndUpdate(
      { _id: id },
      {
        $setOnInsert: {
          publicId: Utils.generateUniqueId(this.defaultConfig.idToken),
        },
        ...obj,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
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
    _.extend(current, obj);
    return current.save();
  }

  /**
   * @param {String} id The payload object
   * @param {QueryParser} options The payload object
   * @return {Object}
   */
  public async findObject(id, options: any = {}) {
    const condition: any = {
      deleted: false,
    };
    if (Utils.IsObjectId(id)) {
      condition['_id'] = id;
    } else {
      condition['publicId'] = id;
    }
    const object: any = await this.model
      .findOne(condition)
      .populate(options.population || []);
    if (!object) {
      throw AppException.NOT_FOUND('Data doesnt exist');
    }
    return object;
  }

  /**
   * @param {Object} object The payload object
   * @return {Object}
   */
  public async deleteObject(object) {
    if (this.entity.config.softDelete) {
      _.extend(object, { deleted: true });
      object = await object.save();
    } else {
      object = await object.remove();
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
          );
        }
      });
    }

    let query = this.model.find(queryParser.query);
    if (
      queryParser.search &&
      this.entity.searchQuery &&
      this.entity.searchQuery(queryParser.search).length > 0
    ) {
      const searchQuery = this.entity.searchQuery(queryParser.search);
      queryParser.query = {
        $or: [...searchQuery],
        ...queryParser.query,
      };
      query = this.model.find({ ...queryParser.query });
    }
    if (!queryParser.getAll) {
      query = query.skip(pagination.skip).limit(pagination.perPage);
    }
    query = query.sort(
      queryParser && queryParser.sort
        ? Object.assign(queryParser.sort, { createdAt: -1 })
        : '-createdAt',
    );

    return {
      value: await query.select(queryParser.selection).exec(),
      count: await this.model.countDocuments(queryParser.query).exec(),
    };
  }

  /**
   * @param {Object} queryParser The query parser
   * @return {Object}
   */
  public async buildSearchQuery(queryParser = null) {
    return _.omit(queryParser.query, ['deleted']);
  }

  /**
   * @param {Object} query The query object
   * @return {Promise<Object>}
   */
  public async countQueryDocuments(query) {
    let count = await this.model.aggregate(query.concat([{ $count: 'total' }]));
    count = count[0] ? count[0].total : 0;
    return count;
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
    const count = await this.countQueryDocuments(query);
    query.push({
      $sort: queryParser.sort
        ? Object.assign({}, { ...queryParser.sort, createdAt: -1 })
        : { createdAt: -1 },
    });
    if (!queryParser.getAll) {
      query.push(
        {
          $skip: pagination.skip,
        },
        {
          $limit: pagination.perPage,
        },
      );
    }
    return {
      value: await this.model
        .aggregate(query)
        .collation({ locale: 'en', strength: 1 }),
      count,
    };
  }

  /**
   * @param {Object} obj The request object
   * @return {Promise<Object>}
   */
  public async retrieveExistingResource(obj) {
    const query = {};

    if (this.entity.config.uniques) {
      const uniqueKeys = this.entity.config.uniques;
      for (const key of uniqueKeys) {
        query[key] = obj[key];
      }
    }
    const found = !_.isEmpty(query)
      ? await this.model.findOne({
          ...query,
          deleted: false,
        })
      : false;
    if (found) {
      return found;
    }
    return null;
  }

  /**
   * @param {String} payLoad The payload object
   * @return {Object}
   */
  public async validateObject(payLoad) {
    const moreCondition = { deleted: false };
    const condition: any = {
      $or: [{ publicId: payLoad.id }, { _id: payLoad.id }],
      ...moreCondition,
    };
    return this.model.findOne(condition);
  }

  /**
   * @param {QueryParser} query The query object
   * @return {Object}
   */

  public async searchOneObject(query: Record<string, any>) {
    const queryParams = _.omit(query, ['latest']);
    const queryToExec = this.model.findOne({ ...queryParams });
    if (query.latest) {
      try {
        const latestQuery = JSON.parse(query.latest);
        queryToExec.sort({ ...latestQuery });
      } catch (e) {}
    }
    return queryToExec.exec();
  }

  /**
   * @param {Object} key The unique key
   * @param {Object} params The request param
   * @return {Array}
   */
  public async findByUniqueKey(key, params = {}) {
    return this.model.distinct(key, {
      ...params,
      deleted: false,
    });
  }
}

export class MockBaseModelClass {
  public static collection = { collectionName: 'MockAttributeModel' };
  public static config = {
    fillables: ['name'],
    updateFillables: ['name'],
    uniques: ['name'],
    softDelete: true,
  };
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  static findOne(data: any) {
    return { data, save: jest.fn() };
  }

  static find(data: any) {
    return { data, save: jest.fn() };
  }

  static searchQuery(data: any) {
    return { data, save: jest.fn().mockImplementation(() => data) };
  }

  static async distinct(key: any, obj: any) {
    return { key, obj };
  }

  static aggregate(data: any) {
    return { data, collation: jest.fn().mockImplementation(() => data) };
  }

  static countDocuments(data: any) {
    return { data, exec: jest.fn().mockImplementation(() => data) };
  }

  static findOneAndUpdate(data: any, options1: any, options2: any) {
    return { data, save: jest.fn() };
  }

  static deleteMany(data: any, options1: any, options2: any) {
    return { data, save: jest.fn() };
  }

  static populate(data: any, options1: any, options2: any) {
    return { data, save: jest.fn() };
  }

  save() {
    return this.data;
  }

  remove(data: any, options1: any, options2: any) {
    return { data, save: jest.fn() };
  }
}

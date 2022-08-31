import { Injectable } from '@nestjs/common';

@Injectable()
export class TodoService {
  public routes = {
    create: false,
    findOne: true,
    find: true,
    update: false,
    patch: false,
    remove: false,
  };
  constructor(
  ) {
  }
}

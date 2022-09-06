import { Controller } from "@nestjs/common";
import { BaseController } from "finfrac/core/base";
import { TodoService } from "../service/todo.service";

@Controller('todos')
export class TodoController extends BaseController{
  constructor(protected service: TodoService) {
    super(service)
  }
}

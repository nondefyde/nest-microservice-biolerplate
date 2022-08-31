import { Controller } from '@nestjs/common';
import { TodoService } from '../service/todo.service';

@Controller('todos')
export class TodoController {
  constructor(
    protected service: TodoService
  ) {
  }
}

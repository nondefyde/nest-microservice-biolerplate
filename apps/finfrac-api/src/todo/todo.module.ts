import { Global, Module } from '@nestjs/common';
import { TodoController } from './controller/todo.controller';
import { HttpModule } from '@nestjs/axios';
import { TodoService } from './service/todo.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}

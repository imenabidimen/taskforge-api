import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { AuthGuard } from './auth.guard';
import { TasksService } from './tasks.service';

class CreateTaskDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;
}

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.tasks.findMine(req.user.sub);
  }

  @Post()
  create(
    @Body() body: CreateTaskDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.tasks.create(req.user.sub, body.title);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.tasks.complete(req.user.sub, id);
  }
}
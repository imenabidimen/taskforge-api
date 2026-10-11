import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { AuthGuard } from './auth.guard';
import { TasksService } from './tasks.service';

class CreateTaskDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;
}

class ListTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(
    @Query() query: ListTasksQueryDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.tasks.findMine(req.user.sub, query.limit, query.offset);
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

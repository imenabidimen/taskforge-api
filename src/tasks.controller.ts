import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { TasksService } from './tasks.service';
class CreateTask { @IsString() @MinLength(2) title!: string; }
@Controller('tasks') export class TasksController {
  constructor(private readonly tasks:TasksService){}
  @Get() list(@Req() req:any){return this.tasks.findMine(req.user?.sub ?? 'demo-user');}
  @Post() create(@Body() body:CreateTask,@Req() req:any){return this.tasks.create(req.user?.sub ?? 'demo-user',body.title);}
  @Post(':id/complete') complete(@Param('id') id:string,@Req() req:any){return this.tasks.complete(req.user?.sub ?? 'demo-user',id);}
}

import { Injectable, NotFoundException } from '@nestjs/common';
@Injectable() export class TasksService {
  private tasks: {id:string;ownerId:string;title:string;completed:boolean}[]=[];
  create(ownerId:string,title:string){const task={id:crypto.randomUUID(),ownerId,title,completed:false};this.tasks.push(task);return task;}
  findMine(ownerId:string){return this.tasks.filter(t=>t.ownerId===ownerId);}
  complete(ownerId:string,id:string){const t=this.tasks.find(x=>x.id===id&&x.ownerId===ownerId);if(!t)throw new NotFoundException('Task not found');t.completed=true;return t;}
}

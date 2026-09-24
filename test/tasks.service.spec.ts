import { NotFoundException } from '@nestjs/common';
import { TasksService } from '../src/tasks.service';

describe('TasksService', () => {
  it('creates and lists tasks for their owner', () => {
    const s = new TasksService();
    const task = s.create('u1', 'Ship release');
    expect(task).toMatchObject({ ownerId: 'u1', title: 'Ship release', completed: false });
    expect(s.findMine('u1')).toHaveLength(1);
    expect(s.findMine('u2')).toHaveLength(0);
  });

  it('completes an owned task', () => {
    const s = new TasksService();
    const task = s.create('u1', 'Ship release');
    expect(s.complete('u1', task.id).completed).toBe(true);
  });

  it('prevents one user from completing another user task', () => {
    const s = new TasksService();
    const task = s.create('u1', 'Private task');
    expect(() => s.complete('u2', task.id)).toThrow(NotFoundException);
  });
});
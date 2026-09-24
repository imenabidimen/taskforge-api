import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'dev-only-secret', signOptions: { expiresIn: '15m' } })],
  controllers: [AuthController, TasksController],
  providers: [AuthService, TasksService],
})
export class AppModule {}

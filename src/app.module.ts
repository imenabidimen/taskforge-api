import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthGuard } from './auth.guard';
import { PrismaModule } from './prisma.module';
import { HealthController } from './health.controller';
import { RequestLoggingMiddleware } from './request-logging.middleware';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController, TasksController, HealthController],
  providers: [AuthService, TasksService, AuthGuard, RequestLoggingMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}

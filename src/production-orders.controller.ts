import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductionOrderStatus } from '@prisma/client';
import { AuthGuard } from './auth.guard';
import { ProductionOrdersService } from './production-orders.service';

class CreateProductionOrderDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  orderNumber!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  materialCode!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  plannedQuantity!: number;
}

class TransitionProductionOrderDto {
  @IsEnum(ProductionOrderStatus)
  status!: ProductionOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason?: string;
}

@Controller('production-orders')
@UseGuards(AuthGuard)
export class ProductionOrdersController {
  constructor(private readonly productionOrders: ProductionOrdersService) {}

  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.productionOrders.listMine(req.user.sub);
  }

  @Post()
  create(
    @Body() body: CreateProductionOrderDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.productionOrders.create(req.user.sub, body);
  }

  @Patch(':id/status')
  transition(
    @Param('id') id: string,
    @Body() body: TransitionProductionOrderDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.productionOrders.transition(
      req.user.sub,
      id,
      body.status,
      body.reason,
    );
  }
}

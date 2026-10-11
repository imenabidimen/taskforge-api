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
import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { ProductionOrdersService } from './production-orders.service';

class CreateProductionOrderDto {\n  @ApiProperty({ example: 'PO-2026-001', description: 'Unique production order identifier.' })
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
  @ApiProperty({ example: 'MAT-42', description: 'Material identifier in this fictional domain.' })\n  materialCode!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  @ApiProperty({ example: 250, minimum: 1, maximum: 1000000 })\n  plannedQuantity!: number;
}

class TransitionProductionOrderDto {\n  @ApiProperty({ enum: ProductionOrderStatus, example: ProductionOrderStatus.RELEASED })
  @IsEnum(ProductionOrderStatus)
  status!: ProductionOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  @ApiPropertyOptional({ example: 'Material and schedule verified', maxLength: 250 })\n  reason?: string;
}

@ApiTags('production-orders')\n@Controller('production-orders')
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

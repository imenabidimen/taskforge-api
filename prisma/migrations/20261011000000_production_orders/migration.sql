CREATE TYPE "ProductionOrderStatus" AS ENUM ('CREATED', 'RELEASED', 'RUNNING', 'COMPLETED', 'CANCELLED');

CREATE TABLE "ProductionOrder" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "materialCode" TEXT NOT NULL,
  "plannedQuantity" INTEGER NOT NULL,
  "status" "ProductionOrderStatus" NOT NULL DEFAULT 'CREATED',
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionOrderEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "fromStatus" "ProductionOrderStatus",
  "toStatus" "ProductionOrderStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductionOrderEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductionOrder_orderNumber_key" ON "ProductionOrder"("orderNumber");
CREATE INDEX "ProductionOrder_createdById_status_createdAt_idx" ON "ProductionOrder"("createdById", "status", "createdAt");
CREATE INDEX "ProductionOrderEvent_orderId_createdAt_idx" ON "ProductionOrderEvent"("orderId", "createdAt");

ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionOrderEvent" ADD CONSTRAINT "ProductionOrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

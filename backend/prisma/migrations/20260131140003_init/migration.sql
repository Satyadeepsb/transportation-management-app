-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('TRUCK', 'VAN', 'TRAILER', 'FLATBED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "shipperName" TEXT NOT NULL,
    "shipperPhone" TEXT NOT NULL,
    "shipperEmail" TEXT,
    "shipperAddress" TEXT NOT NULL,
    "shipperCity" TEXT NOT NULL,
    "shipperState" TEXT NOT NULL,
    "shipperZip" TEXT NOT NULL,
    "consigneeName" TEXT NOT NULL,
    "consigneePhone" TEXT NOT NULL,
    "consigneeEmail" TEXT,
    "consigneeAddress" TEXT NOT NULL,
    "consigneeCity" TEXT NOT NULL,
    "consigneeState" TEXT NOT NULL,
    "consigneeZip" TEXT NOT NULL,
    "cargoDescription" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "dimensions" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "estimatedRate" DOUBLE PRECISION NOT NULL,
    "actualRate" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "estimatedDelivery" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "driverId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_trackingNumber_idx" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipments_createdById_idx" ON "shipments"("createdById");

-- CreateIndex
CREATE INDEX "shipments_driverId_idx" ON "shipments"("driverId");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

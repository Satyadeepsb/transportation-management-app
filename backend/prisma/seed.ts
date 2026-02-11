import { PrismaClient, UserRole, ShipmentStatus, VehicleType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all test users (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transport.com' },
    update: {
      password: hashedPassword, // Update password if user exists
    },
    create: {
      email: 'admin@transport.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '+1-555-0100',
      isActive: true,
      createdAt: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email, '(password: password123)');

  // Create Dispatcher
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@transport.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'dispatcher@transport.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Dispatcher',
      role: UserRole.DISPATCHER,
      phone: '+1-555-0101',
      isActive: true,
      createdAt: new Date(),
    },
  });
  console.log('✅ Dispatcher created:', dispatcher.email, '(password: password123)');

  // Create Drivers
  const driver1 = await prisma.user.upsert({
    where: { email: 'driver1@transport.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'driver1@transport.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Driver',
      role: UserRole.DRIVER,
      phone: '+1-555-0201',
      isActive: true,
      createdAt: new Date(),
    },
  });
  console.log('✅ Driver 1 created:', driver1.email, '(password: password123)');

  const driver2 = await prisma.user.upsert({
    where: { email: 'driver2@transport.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'driver2@transport.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.DRIVER,
      phone: '+1-555-0202',
      isActive: true,
      createdAt: new Date(),
    },
  });
  console.log('✅ Driver 2 created:', driver2.email, '(password: password123)');

  // Create Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
      phone: '+1-555-0300',
      isActive: true,
      createdAt: new Date(),
    },
  });
  console.log('✅ Customer created:', customer.email, '(password: password123)');

  // Create Sample Shipments
  const shipment1 = await prisma.shipment.create({
    data: {
      shipperName: 'ABC Electronics Corp',
      shipperPhone: '+1-555-1001',
      shipperEmail: 'shipping@abcelectronics.com',
      shipperAddress: '123 Tech Park Drive',
      shipperCity: 'San Francisco',
      shipperState: 'CA',
      shipperZip: '94105',
      consigneeName: 'XYZ Retail Store',
      consigneePhone: '+1-555-2001',
      consigneeEmail: 'receiving@xyzretail.com',
      consigneeAddress: '456 Market Street',
      consigneeCity: 'Los Angeles',
      consigneeState: 'CA',
      consigneeZip: '90012',
      cargoDescription: 'Electronics - Laptops and Monitors',
      weight: 500.5,
      dimensions: '120x80x60 cm',
      vehicleType: VehicleType.TRUCK,
      estimatedRate: 1500.00,
      currency: 'USD',
      pickupDate: new Date('2026-02-01'),
      estimatedDelivery: new Date('2026-02-03'),
      status: ShipmentStatus.ASSIGNED,
      createdById: dispatcher.id,
      driverId: driver1.id,
      notes: 'Handle with care - fragile electronics',
      createdAt: new Date(),
    },
  });
  console.log('✅ Shipment 1 created:', shipment1.trackingNumber);

  const shipment2 = await prisma.shipment.create({
    data: {
      shipperName: 'Fresh Foods Supplier',
      shipperPhone: '+1-555-1002',
      shipperEmail: 'logistics@freshfoods.com',
      shipperAddress: '789 Farm Road',
      shipperCity: 'Sacramento',
      shipperState: 'CA',
      shipperZip: '95814',
      consigneeName: 'Downtown Grocery',
      consigneePhone: '+1-555-2002',
      consigneeEmail: 'store@downtowngrocery.com',
      consigneeAddress: '321 Main Street',
      consigneeCity: 'San Diego',
      consigneeState: 'CA',
      consigneeZip: '92101',
      cargoDescription: 'Fresh Produce - Vegetables and Fruits',
      weight: 800.0,
      dimensions: '150x100x80 cm',
      vehicleType: VehicleType.TRUCK,
      estimatedRate: 2000.00,
      currency: 'USD',
      pickupDate: new Date('2026-02-02'),
      estimatedDelivery: new Date('2026-02-04'),
      status: ShipmentStatus.IN_TRANSIT,
      createdById: dispatcher.id,
      driverId: driver2.id,
      notes: 'Temperature-controlled transport required',
      createdAt: new Date(),
    },
  });
  console.log('✅ Shipment 2 created:', shipment2.trackingNumber);

  const shipment3 = await prisma.shipment.create({
    data: {
      shipperName: 'BuildCo Construction',
      shipperPhone: '+1-555-1003',
      shipperAddress: '555 Industrial Blvd',
      shipperCity: 'Oakland',
      shipperState: 'CA',
      shipperZip: '94607',
      consigneeName: 'New Construction Site',
      consigneePhone: '+1-555-2003',
      consigneeAddress: '999 Development Ave',
      consigneeCity: 'San Jose',
      consigneeState: 'CA',
      consigneeZip: '95110',
      cargoDescription: 'Construction Materials - Steel Beams',
      weight: 2500.0,
      dimensions: '600x200x150 cm',
      vehicleType: VehicleType.FLATBED,
      estimatedRate: 3500.00,
      currency: 'USD',
      pickupDate: new Date('2026-02-05'),
      estimatedDelivery: new Date('2026-02-06'),
      status: ShipmentStatus.PENDING,
      createdById: customer.id,
      notes: 'Requires flatbed truck and crane at delivery',
      createdAt: new Date(),
    },
  });
  console.log('✅ Shipment 3 created:', shipment3.trackingNumber);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Shipment, ShipmentStatus, VehicleType } from '@prisma/client';

/**
 * Creates a mock shipment with default values
 * @param overrides - Optional partial shipment object to override defaults
 * @returns Mock Shipment object
 */
export const createMockShipment = (overrides?: Partial<Shipment>): Shipment => ({
  id: 'shipment-1',
  trackingNumber: 'TRK-123456789012',
  status: ShipmentStatus.PENDING,
  shipperName: 'Shipper Company Inc',
  shipperPhone: '1234567890',
  shipperEmail: 'shipper@example.com',
  shipperAddress: '123 Main St',
  shipperCity: 'New York',
  shipperState: 'NY',
  shipperZip: '10001',
  consigneeName: 'Consignee Company LLC',
  consigneePhone: '0987654321',
  consigneeEmail: 'consignee@example.com',
  consigneeAddress: '456 Oak Avenue',
  consigneeCity: 'Los Angeles',
  consigneeState: 'CA',
  consigneeZip: '90001',
  cargoDescription: 'Electronics and computer equipment',
  weight: 1000,
  dimensions: '2m x 1m x 1m',
  vehicleType: VehicleType.TRUCK,
  estimatedRate: 5000,
  actualRate: null,
  currency: 'USD',
  pickupDate: new Date('2026-02-01T10:00:00.000Z'),
  deliveryDate: null,
  estimatedDelivery: new Date('2026-02-05T16:00:00.000Z'),
  createdById: 'user-1',
  driverId: null,
  notes: null,
  createdAt: new Date('2026-01-15T08:00:00.000Z'),
  updatedAt: new Date('2026-01-15T08:00:00.000Z'),
  ...overrides,
});

/**
 * Creates a mock shipment with ASSIGNED status
 * @returns Mock Assigned Shipment
 */
export const createMockAssignedShipment = (): Shipment => createMockShipment({
  id: 'shipment-assigned-1',
  status: ShipmentStatus.ASSIGNED,
  driverId: 'driver-1',
  trackingNumber: 'TRK-ASSIGNED-123',
});

/**
 * Creates a mock shipment with IN_TRANSIT status
 * @returns Mock In Transit Shipment
 */
export const createMockInTransitShipment = (): Shipment => createMockShipment({
  id: 'shipment-transit-1',
  status: ShipmentStatus.IN_TRANSIT,
  driverId: 'driver-1',
  trackingNumber: 'TRK-TRANSIT-123',
});

/**
 * Creates a mock shipment with DELIVERED status
 * @returns Mock Delivered Shipment
 */
export const createMockDeliveredShipment = (): Shipment => createMockShipment({
  id: 'shipment-delivered-1',
  status: ShipmentStatus.DELIVERED,
  driverId: 'driver-1',
  trackingNumber: 'TRK-DELIVERED-123',
  actualRate: 5200,
  deliveryDate: new Date('2026-02-04T14:00:00.000Z'),
});

/**
 * Creates a mock shipment with CANCELLED status
 * @returns Mock Cancelled Shipment
 */
export const createMockCancelledShipment = (): Shipment => createMockShipment({
  id: 'shipment-cancelled-1',
  status: ShipmentStatus.CANCELLED,
  trackingNumber: 'TRK-CANCELLED-123',
  notes: 'Cancelled by customer request',
});

/**
 * Creates an array of mock shipments with different statuses
 * @returns Array of Mock Shipments
 */
export const createMockShipments = (): Shipment[] => [
  createMockShipment(),
  createMockAssignedShipment(),
  createMockInTransitShipment(),
  createMockDeliveredShipment(),
  createMockCancelledShipment(),
];

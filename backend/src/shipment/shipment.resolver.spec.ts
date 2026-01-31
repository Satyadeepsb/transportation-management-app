import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentResolver } from './shipment.resolver';
import { ShipmentService } from './shipment.service';
import { CreateShipmentInput } from './dto/create-shipment.input';
import { UpdateShipmentInput } from './dto/update-shipment.input';
import { ShipmentStatus, VehicleType } from '@prisma/client';
import {
  createMockShipment,
  createMockShipments,
  createMockAssignedShipment,
} from '../../test/fixtures/shipment.fixtures';
import { createMockAdmin, createMockCustomer, createMockDispatcher } from '../../test/fixtures/user.fixtures';

describe('ShipmentResolver', () => {
  let resolver: ShipmentResolver;
  let shipmentService: any;

  beforeEach(async () => {
    const mockShipmentService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByTrackingNumber: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assignDriver: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentResolver,
        {
          provide: ShipmentService,
          useValue: mockShipmentService,
        },
      ],
    }).compile();

    resolver = module.get<ShipmentResolver>(ShipmentResolver);
    shipmentService = module.get(ShipmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShipment', () => {
    const createInput: CreateShipmentInput = {
      shipperName: 'Test Shipper',
      shipperPhone: '1234567890',
      shipperEmail: 'shipper@test.com',
      shipperAddress: '123 Main St',
      shipperCity: 'New York',
      shipperState: 'NY',
      shipperZip: '10001',
      consigneeName: 'Test Consignee',
      consigneePhone: '0987654321',
      consigneeEmail: 'consignee@test.com',
      consigneeAddress: '456 Oak Ave',
      consigneeCity: 'Los Angeles',
      consigneeState: 'CA',
      consigneeZip: '90001',
      cargoDescription: 'Test cargo',
      weight: 1000,
      dimensions: '2m x 1m x 1m',
      vehicleType: VehicleType.TRUCK,
      estimatedRate: 5000,
      pickupDate: '2026-02-01',
      estimatedDelivery: '2026-02-05',
      notes: null,
    };

    it('should create shipment with authenticated user', async () => {
      // Arrange
      const user = createMockCustomer();
      const mockShipment = createMockShipment();
      shipmentService.create.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.createShipment(createInput, user);

      // Assert
      expect(shipmentService.create).toHaveBeenCalledWith(createInput, user.id);
      expect(result).toEqual(mockShipment);
    });

    it('should pass user ID to service', async () => {
      // Arrange
      const user = createMockAdmin();
      const mockShipment = createMockShipment();
      shipmentService.create.mockResolvedValue(mockShipment);

      // Act
      await resolver.createShipment(createInput, user);

      // Assert
      expect(shipmentService.create).toHaveBeenCalledWith(createInput, user.id);
    });

    it('should create shipment as DISPATCHER', async () => {
      // Arrange
      const dispatcher = createMockDispatcher();
      const mockShipment = createMockShipment();
      shipmentService.create.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.createShipment(createInput, dispatcher);

      // Assert
      expect(shipmentService.create).toHaveBeenCalledWith(createInput, dispatcher.id);
      expect(result).toEqual(mockShipment);
    });

    it('should handle service errors', async () => {
      // Arrange
      const user = createMockCustomer();
      const error = new Error('Failed to create shipment');
      shipmentService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.createShipment(createInput, user)).rejects.toThrow('Failed to create shipment');
    });
  });

  describe('shipments', () => {
    it('should get paginated shipments without filters', async () => {
      // Arrange
      const mockShipments = createMockShipments();
      const mockResponse = {
        data: mockShipments,
        meta: {
          total: 5,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      shipmentService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.shipments();

      // Assert
      expect(shipmentService.findAll).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(5);
    });

    it('should get shipments with filters', async () => {
      // Arrange
      const filter = { status: ShipmentStatus.PENDING };
      const mockResponse = {
        data: [createMockShipment()],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      shipmentService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.shipments(filter);

      // Assert
      expect(shipmentService.findAll).toHaveBeenCalledWith(filter, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get shipments with pagination', async () => {
      // Arrange
      const pagination = { page: 2, limit: 10 };
      const mockResponse = {
        data: createMockShipments(),
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };
      shipmentService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.shipments(undefined, pagination);

      // Assert
      expect(shipmentService.findAll).toHaveBeenCalledWith(undefined, pagination);
      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });

    it('should get shipments with both filters and pagination', async () => {
      // Arrange
      const filter = { driverId: 'driver-1' };
      const pagination = { page: 1, limit: 5 };
      const mockResponse = {
        data: [createMockAssignedShipment()],
        meta: {
          total: 1,
          page: 1,
          limit: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      shipmentService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await resolver.shipments(filter, pagination);

      // Assert
      expect(shipmentService.findAll).toHaveBeenCalledWith(filter, pagination);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('shipment', () => {
    it('should get single shipment by ID', async () => {
      // Arrange
      const mockShipment = createMockShipment();
      shipmentService.findOne.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.shipment(mockShipment.id);

      // Assert
      expect(shipmentService.findOne).toHaveBeenCalledWith(mockShipment.id);
      expect(result).toEqual(mockShipment);
    });

    it('should handle not found error', async () => {
      // Arrange
      const error = new Error('Shipment not found');
      shipmentService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.shipment('invalid-id')).rejects.toThrow('Shipment not found');
    });
  });

  describe('trackShipment', () => {
    it('should track shipment by tracking number (public)', async () => {
      // Arrange
      const mockShipment = createMockShipment();
      shipmentService.findByTrackingNumber.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.trackShipment(mockShipment.trackingNumber);

      // Assert
      expect(shipmentService.findByTrackingNumber).toHaveBeenCalledWith(mockShipment.trackingNumber);
      expect(result).toEqual(mockShipment);
    });

    it('should handle invalid tracking number', async () => {
      // Arrange
      const error = new Error('Tracking number not found');
      shipmentService.findByTrackingNumber.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.trackShipment('INVALID-123')).rejects.toThrow('Tracking number not found');
    });
  });

  describe('updateShipment', () => {
    const updateInput: UpdateShipmentInput = {
      id: 'shipment-1',
      status: ShipmentStatus.IN_TRANSIT,
      actualRate: 5200,
    };

    it('should update shipment', async () => {
      // Arrange
      const mockShipment = createMockShipment({
        id: updateInput.id,
        status: updateInput.status,
        actualRate: updateInput.actualRate,
      });
      shipmentService.update.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.updateShipment(updateInput);

      // Assert
      expect(shipmentService.update).toHaveBeenCalledWith(updateInput);
      expect(result).toEqual(mockShipment);
    });

    it('should update shipment status', async () => {
      // Arrange
      const updateInput: UpdateShipmentInput = {
        id: 'shipment-1',
        status: ShipmentStatus.DELIVERED,
        deliveryDate: '2026-02-04',
      };

      const mockShipment = createMockShipment({
        id: updateInput.id,
        status: ShipmentStatus.DELIVERED,
      });
      shipmentService.update.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.updateShipment(updateInput);

      // Assert
      expect(shipmentService.update).toHaveBeenCalledWith(updateInput);
      expect(result.status).toBe(ShipmentStatus.DELIVERED);
    });

    it('should handle update errors', async () => {
      // Arrange
      const error = new Error('Update failed');
      shipmentService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.updateShipment(updateInput)).rejects.toThrow('Update failed');
    });
  });

  describe('removeShipment', () => {
    it('should delete shipment', async () => {
      // Arrange
      const mockShipment = createMockShipment();
      shipmentService.remove.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.removeShipment(mockShipment.id);

      // Assert
      expect(shipmentService.remove).toHaveBeenCalledWith(mockShipment.id);
      expect(result).toEqual(mockShipment);
    });

    it('should handle not found error', async () => {
      // Arrange
      const error = new Error('Shipment not found');
      shipmentService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.removeShipment('invalid-id')).rejects.toThrow('Shipment not found');
    });
  });

  describe('assignDriver', () => {
    it('should assign driver to shipment', async () => {
      // Arrange
      const shipmentId = 'shipment-1';
      const driverId = 'driver-1';
      const mockShipment = createMockAssignedShipment();
      shipmentService.assignDriver.mockResolvedValue(mockShipment);

      // Act
      const result = await resolver.assignDriver(shipmentId, driverId);

      // Assert
      expect(shipmentService.assignDriver).toHaveBeenCalledWith(shipmentId, driverId);
      expect(result).toEqual(mockShipment);
      expect(result.status).toBe(ShipmentStatus.ASSIGNED);
    });

    it('should pass correct parameters to service', async () => {
      // Arrange
      const shipmentId = 'shipment-123';
      const driverId = 'driver-456';
      const mockShipment = createMockAssignedShipment();
      shipmentService.assignDriver.mockResolvedValue(mockShipment);

      // Act
      await resolver.assignDriver(shipmentId, driverId);

      // Assert
      expect(shipmentService.assignDriver).toHaveBeenCalledTimes(1);
      expect(shipmentService.assignDriver).toHaveBeenCalledWith(shipmentId, driverId);
    });

    it('should handle assignment errors', async () => {
      // Arrange
      const error = new Error('Assignment failed');
      shipmentService.assignDriver.mockRejectedValue(error);

      // Act & Assert
      await expect(resolver.assignDriver('shipment-1', 'driver-1')).rejects.toThrow('Assignment failed');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createMockShipment,
  createMockShipments,
  createMockAssignedShipment,
} from '../../test/fixtures/shipment.fixtures';
import { CreateShipmentInput } from './dto/create-shipment.input';
import { UpdateShipmentInput } from './dto/update-shipment.input';
import { ShipmentStatus, VehicleType } from '@prisma/client';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      shipment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ShipmentService>(ShipmentService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
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

    it('should create shipment with valid data', async () => {
      // Arrange
      const userId = 'user-1';
      const createdShipment = createMockShipment({
        shipperName: createInput.shipperName,
        createdById: userId,
      });

      prismaService.shipment.create.mockResolvedValue(createdShipment);

      // Act
      const result = await service.create(createInput, userId);

      // Assert
      expect(prismaService.shipment.create).toHaveBeenCalledWith({
        data: {
          ...createInput,
          pickupDate: new Date(createInput.pickupDate),
          estimatedDelivery: new Date(createInput.estimatedDelivery),
          createdById: userId,
        },
        include: {
          createdBy: true,
          driver: true,
        },
      });
      expect(result).toEqual(createdShipment);
    });

    it('should convert date strings to Date objects', async () => {
      // Arrange
      const userId = 'user-1';
      const createdShipment = createMockShipment();
      prismaService.shipment.create.mockResolvedValue(createdShipment);

      // Act
      await service.create(createInput, userId);

      // Assert
      const createCall = prismaService.shipment.create.mock.calls[0][0];
      expect(createCall.data.pickupDate).toBeInstanceOf(Date);
      expect(createCall.data.estimatedDelivery).toBeInstanceOf(Date);
    });

    it('should attach createdById from authenticated user', async () => {
      // Arrange
      const userId = 'authenticated-user-123';
      const createdShipment = createMockShipment();
      prismaService.shipment.create.mockResolvedValue(createdShipment);

      // Act
      await service.create(createInput, userId);

      // Assert
      expect(prismaService.shipment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdById: userId,
          }),
        }),
      );
    });

    it('should include related entities in response', async () => {
      // Arrange
      const userId = 'user-1';
      const createdShipment = createMockShipment();
      prismaService.shipment.create.mockResolvedValue(createdShipment);

      // Act
      await service.create(createInput, userId);

      // Assert
      expect(prismaService.shipment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            createdBy: true,
            driver: true,
          },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should find all shipments with default pagination', async () => {
      // Arrange
      const mockShipments = createMockShipments();
      prismaService.shipment.count.mockResolvedValue(5);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prismaService.shipment.count).toHaveBeenCalledWith({ where: {} });
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: true,
          driver: true,
        },
      });
      expect(result.data).toEqual(mockShipments);
      expect(result.meta).toEqual({
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should filter by status', async () => {
      // Arrange
      const mockShipments = [createMockShipment({ status: ShipmentStatus.PENDING })];
      prismaService.shipment.count.mockResolvedValue(1);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      const filter = { status: ShipmentStatus.PENDING };

      // Act
      await service.findAll(filter);

      // Assert
      expect(prismaService.shipment.count).toHaveBeenCalledWith({
        where: { status: ShipmentStatus.PENDING },
      });
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ShipmentStatus.PENDING },
        }),
      );
    });

    it('should filter by driver ID', async () => {
      // Arrange
      const driverId = 'driver-1';
      const mockShipments = [createMockAssignedShipment()];
      prismaService.shipment.count.mockResolvedValue(1);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      const filter = { driverId };

      // Act
      await service.findAll(filter);

      // Assert
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driverId },
        }),
      );
    });

    it('should filter by tracking number', async () => {
      // Arrange
      const trackingNumber = 'TRK-123';
      const mockShipments = [createMockShipment({ trackingNumber: 'TRK-123456' })];
      prismaService.shipment.count.mockResolvedValue(1);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      const filter = { trackingNumber };

      // Act
      await service.findAll(filter);

      // Assert
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trackingNumber: { contains: trackingNumber, mode: 'insensitive' } },
        }),
      );
    });

    it('should search across multiple fields', async () => {
      // Arrange
      const search = 'electronics';
      const mockShipments = [createMockShipment()];
      prismaService.shipment.count.mockResolvedValue(1);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      const filter = { search };

      // Act
      await service.findAll(filter);

      // Assert
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { trackingNumber: { contains: search, mode: 'insensitive' } },
              { shipperName: { contains: search, mode: 'insensitive' } },
              { consigneeName: { contains: search, mode: 'insensitive' } },
              { cargoDescription: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should calculate pagination meta correctly', async () => {
      // Arrange
      const mockShipments = createMockShipments();
      prismaService.shipment.count.mockResolvedValue(25);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      const pagination = { page: 2, limit: 10 };

      // Act
      const result = await service.findAll({}, pagination);

      // Assert
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should apply custom sorting', async () => {
      // Arrange
      const mockShipments = createMockShipments();
      prismaService.shipment.count.mockResolvedValue(5);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      const pagination = { page: 1, limit: 10, sortBy: 'pickupDate', sortOrder: 'asc' as const };

      // Act
      await service.findAll({}, pagination);

      // Assert
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { pickupDate: 'asc' },
        }),
      );
    });

    it('should include related entities (driver, createdBy)', async () => {
      // Arrange
      const mockShipments = createMockShipments();
      prismaService.shipment.count.mockResolvedValue(5);
      prismaService.shipment.findMany.mockResolvedValue(mockShipments);

      // Act
      await service.findAll();

      // Assert
      expect(prismaService.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            createdBy: true,
            driver: true,
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should find shipment by ID', async () => {
      // Arrange
      const shipment = createMockShipment();
      prismaService.shipment.findUnique.mockResolvedValue(shipment);

      // Act
      const result = await service.findOne(shipment.id);

      // Assert
      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({
        where: { id: shipment.id },
        include: {
          createdBy: true,
          driver: true,
        },
      });
      expect(result).toEqual(shipment);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      // Arrange
      prismaService.shipment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Shipment with ID non-existent-id not found'),
      );
    });
  });

  describe('findByTrackingNumber', () => {
    it('should find shipment by tracking number', async () => {
      // Arrange
      const shipment = createMockShipment();
      prismaService.shipment.findUnique.mockResolvedValue(shipment);

      // Act
      const result = await service.findByTrackingNumber(shipment.trackingNumber);

      // Assert
      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({
        where: { trackingNumber: shipment.trackingNumber },
        include: {
          createdBy: true,
          driver: true,
        },
      });
      expect(result).toEqual(shipment);
    });

    it('should throw NotFoundException for invalid tracking number', async () => {
      // Arrange
      const trackingNumber = 'INVALID-123';
      prismaService.shipment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByTrackingNumber(trackingNumber)).rejects.toThrow(
        new NotFoundException(`Shipment with tracking number ${trackingNumber} not found`),
      );
    });
  });

  describe('update', () => {
    it('should update shipment fields', async () => {
      // Arrange
      const existingShipment = createMockShipment();
      const updateInput: UpdateShipmentInput = {
        id: existingShipment.id,
        status: ShipmentStatus.IN_TRANSIT,
        actualRate: 5200,
      };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);
      const updatedShipment = { ...existingShipment, ...updateInput };
      prismaService.shipment.update.mockResolvedValue(updatedShipment);

      // Act
      const result = await service.update(updateInput);

      // Assert
      expect(prismaService.shipment.update).toHaveBeenCalledWith({
        where: { id: updateInput.id },
        data: { status: updateInput.status, actualRate: updateInput.actualRate },
        include: {
          createdBy: true,
          driver: true,
        },
      });
      expect(result).toEqual(updatedShipment);
    });

    it('should validate shipment exists before update', async () => {
      // Arrange
      const updateInput: UpdateShipmentInput = {
        id: 'non-existent-id',
        status: ShipmentStatus.DELIVERED,
      };

      prismaService.shipment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(updateInput)).rejects.toThrow(NotFoundException);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
    });

    it('should handle date conversions in update', async () => {
      // Arrange
      const existingShipment = createMockShipment();
      const updateInput: UpdateShipmentInput = {
        id: existingShipment.id,
        deliveryDate: '2026-02-04',
        estimatedDelivery: '2026-02-06',
      };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);
      prismaService.shipment.update.mockResolvedValue(existingShipment);

      // Act
      await service.update(updateInput);

      // Assert
      const updateCall = prismaService.shipment.update.mock.calls[0][0];
      expect(updateCall.data.deliveryDate).toBeInstanceOf(Date);
      expect(updateCall.data.estimatedDelivery).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should delete shipment', async () => {
      // Arrange
      const shipment = createMockShipment();
      prismaService.shipment.findUnique.mockResolvedValue(shipment);
      prismaService.shipment.delete.mockResolvedValue(shipment);

      // Act
      const result = await service.remove(shipment.id);

      // Assert
      expect(prismaService.shipment.findUnique).toHaveBeenCalled();
      expect(prismaService.shipment.delete).toHaveBeenCalledWith({
        where: { id: shipment.id },
      });
      expect(result).toEqual(shipment);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      // Arrange
      prismaService.shipment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(prismaService.shipment.delete).not.toHaveBeenCalled();
    });
  });

  describe('assignDriver', () => {
    it('should assign driver and update status to ASSIGNED', async () => {
      // Arrange
      const shipmentId = 'shipment-1';
      const driverId = 'driver-1';
      const assignedShipment = createMockAssignedShipment();

      prismaService.shipment.update.mockResolvedValue(assignedShipment);

      // Act
      const result = await service.assignDriver(shipmentId, driverId);

      // Assert
      expect(prismaService.shipment.update).toHaveBeenCalledWith({
        where: { id: shipmentId },
        data: {
          driverId,
          status: 'ASSIGNED',
        },
        include: {
          createdBy: true,
          driver: true,
        },
      });
      expect(result).toEqual(assignedShipment);
      expect(result.status).toBe(ShipmentStatus.ASSIGNED);
      expect(result.driverId).toBe(driverId);
    });
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentInput } from './dto/create-shipment.input';
import { UpdateShipmentInput } from './dto/update-shipment.input';
import { ShipmentFilterInput, PaginationInput } from './dto/shipment-filter.input';
import { Shipment, Prisma } from '@prisma/client';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new shipment
   */
  async create(createShipmentInput: CreateShipmentInput, userId: string): Promise<Shipment> {
    return this.prisma.shipment.create({
      data: {
        ...createShipmentInput,
        pickupDate: new Date(createShipmentInput.pickupDate),
        estimatedDelivery: new Date(createShipmentInput.estimatedDelivery),
        createdById: userId,
      },
      include: {
        createdBy: true,
        driver: true,
      },
    });
  }

  /**
   * Find all shipments with optional filters and pagination
   */
  async findAll(filter?: ShipmentFilterInput, pagination?: PaginationInput) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'desc';

    // Build where clause
    const where: Prisma.ShipmentWhereInput = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.trackingNumber) {
      where.trackingNumber = { contains: filter.trackingNumber, mode: 'insensitive' };
    }

    if (filter?.createdById) {
      where.createdById = filter.createdById;
    }

    if (filter?.driverId) {
      where.driverId = filter.driverId;
    }

    if (filter?.shipperCity) {
      where.shipperCity = { contains: filter.shipperCity, mode: 'insensitive' };
    }

    if (filter?.consigneeCity) {
      where.consigneeCity = { contains: filter.consigneeCity, mode: 'insensitive' };
    }

    // Search across multiple fields
    if (filter?.search) {
      where.OR = [
        { trackingNumber: { contains: filter.search, mode: 'insensitive' } },
        { shipperName: { contains: filter.search, mode: 'insensitive' } },
        { consigneeName: { contains: filter.search, mode: 'insensitive' } },
        { cargoDescription: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await this.prisma.shipment.count({ where });

    // Get paginated data
    const data = await this.prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: true,
        driver: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find a single shipment by ID
   */
  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        driver: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  /**
   * Find shipment by tracking number
   */
  async findByTrackingNumber(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        createdBy: true,
        driver: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with tracking number ${trackingNumber} not found`);
    }

    return shipment;
  }

  /**
   * Update a shipment
   */
  async update(updateShipmentInput: UpdateShipmentInput): Promise<Shipment> {
    const { id, ...data } = updateShipmentInput;

    // Check if shipment exists
    await this.findOne(id);

    // Convert date strings to Date objects
    const updateData: any = { ...data };
    if (data.pickupDate) {
      updateData.pickupDate = new Date(data.pickupDate);
    }
    if (data.deliveryDate) {
      updateData.deliveryDate = new Date(data.deliveryDate);
    }
    if (data.estimatedDelivery) {
      updateData.estimatedDelivery = new Date(data.estimatedDelivery);
    }

    return this.prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true,
        driver: true,
      },
    });
  }

  /**
   * Delete a shipment
   */
  async remove(id: string): Promise<Shipment> {
    // Check if shipment exists
    await this.findOne(id);

    return this.prisma.shipment.delete({
      where: { id },
    });
  }

  /**
   * Assign driver to shipment
   */
  async assignDriver(shipmentId: string, driverId: string): Promise<Shipment> {
    return this.prisma.shipment.update({
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
  }

  /**
   * Flag a shipment for review
   */
  async flagShipment(id: string): Promise<Shipment> {
    // Check if shipment exists
    const shipment = await this.findOne(id);

    // Add flag marker to notes
    const flagNote = `[FLAGGED FOR REVIEW - ${new Date().toISOString()}]`;
    const updatedNotes = shipment.notes
      ? `${shipment.notes}\n${flagNote}`
      : flagNote;

    return this.prisma.shipment.update({
      where: { id },
      data: {
        notes: updatedNotes,
      },
      include: {
        createdBy: true,
        driver: true,
      },
    });
  }
}

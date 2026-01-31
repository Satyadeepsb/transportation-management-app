import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentEntity } from './entities/shipment.entity';
import { CreateShipmentInput } from './dto/create-shipment.input';
import { UpdateShipmentInput } from './dto/update-shipment.input';
import { ShipmentFilterInput, PaginationInput } from './dto/shipment-filter.input';
import { PaginatedShipmentsResponse } from './entities/paginated-shipments.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@Resolver(() => ShipmentEntity)
export class ShipmentResolver {
  constructor(private readonly shipmentService: ShipmentService) {}

  /**
   * Create a new shipment (Authenticated: ADMIN, DISPATCHER, CUSTOMER)
   */
  @Mutation(() => ShipmentEntity, { description: 'Create a new shipment' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.CUSTOMER)
  async createShipment(
    @Args('createShipmentInput') createShipmentInput: CreateShipmentInput,
    @CurrentUser() user: User,
  ): Promise<ShipmentEntity> {
    return this.shipmentService.create(createShipmentInput, user.id);
  }

  /**
   * Get all shipments with pagination and filters (Authenticated)
   */
  @Query(() => PaginatedShipmentsResponse, { description: 'Get paginated list of shipments with optional filters' })
  @UseGuards(GqlAuthGuard)
  async shipments(
    @Args('filter', { type: () => ShipmentFilterInput, nullable: true }) filter?: ShipmentFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedShipmentsResponse> {
    return this.shipmentService.findAll(filter, pagination);
  }

  /**
   * Get a single shipment by ID (Authenticated)
   */
  @Query(() => ShipmentEntity, { description: 'Get a single shipment by ID' })
  @UseGuards(GqlAuthGuard)
  async shipment(@Args('id', { type: () => String }) id: string): Promise<ShipmentEntity> {
    return this.shipmentService.findOne(id);
  }

  /**
   * Track shipment by tracking number (Public - no auth required)
   */
  @Query(() => ShipmentEntity, { description: 'Track shipment by tracking number (public)' })
  async trackShipment(@Args('trackingNumber', { type: () => String }) trackingNumber: string): Promise<ShipmentEntity> {
    return this.shipmentService.findByTrackingNumber(trackingNumber);
  }

  /**
   * Update a shipment (ADMIN, DISPATCHER only)
   */
  @Mutation(() => ShipmentEntity, { description: 'Update an existing shipment' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  async updateShipment(
    @Args('updateShipmentInput') updateShipmentInput: UpdateShipmentInput,
  ): Promise<ShipmentEntity> {
    return this.shipmentService.update(updateShipmentInput);
  }

  /**
   * Delete a shipment (ADMIN only)
   */
  @Mutation(() => ShipmentEntity, { description: 'Delete a shipment (admin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeShipment(@Args('id', { type: () => String }) id: string): Promise<ShipmentEntity> {
    return this.shipmentService.remove(id);
  }

  /**
   * Assign a driver to a shipment (ADMIN, DISPATCHER only)
   */
  @Mutation(() => ShipmentEntity, { description: 'Assign a driver to a shipment' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  async assignDriver(
    @Args('shipmentId', { type: () => String }) shipmentId: string,
    @Args('driverId', { type: () => String }) driverId: string,
  ): Promise<ShipmentEntity> {
    return this.shipmentService.assignDriver(shipmentId, driverId);
  }
}

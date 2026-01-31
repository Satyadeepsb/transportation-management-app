import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ShipmentService } from './shipment.service';
import { ShipmentEntity } from './entities/shipment.entity';
import { CreateShipmentInput } from './dto/create-shipment.input';
import { UpdateShipmentInput } from './dto/update-shipment.input';
import { ShipmentFilterInput, PaginationInput } from './dto/shipment-filter.input';
import { PaginatedShipmentsResponse } from './entities/paginated-shipments.entity';

@Resolver(() => ShipmentEntity)
export class ShipmentResolver {
  constructor(private readonly shipmentService: ShipmentService) {}

  /**
   * Create a new shipment
   */
  @Mutation(() => ShipmentEntity, { description: 'Create a new shipment' })
  async createShipment(
    @Args('createShipmentInput') createShipmentInput: CreateShipmentInput,
    // TODO: Get userId from authentication context in Step 4
    @Args('userId', { type: () => String, defaultValue: 'temp-user-id' }) userId: string,
  ): Promise<ShipmentEntity> {
    return this.shipmentService.create(createShipmentInput, userId);
  }

  /**
   * Get all shipments with pagination and filters
   */
  @Query(() => PaginatedShipmentsResponse, { description: 'Get paginated list of shipments with optional filters' })
  async shipments(
    @Args('filter', { type: () => ShipmentFilterInput, nullable: true }) filter?: ShipmentFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedShipmentsResponse> {
    return this.shipmentService.findAll(filter, pagination);
  }

  /**
   * Get a single shipment by ID
   */
  @Query(() => ShipmentEntity, { description: 'Get a single shipment by ID' })
  async shipment(@Args('id', { type: () => String }) id: string): Promise<ShipmentEntity> {
    return this.shipmentService.findOne(id);
  }

  /**
   * Track shipment by tracking number
   */
  @Query(() => ShipmentEntity, { description: 'Track shipment by tracking number' })
  async trackShipment(@Args('trackingNumber', { type: () => String }) trackingNumber: string): Promise<ShipmentEntity> {
    return this.shipmentService.findByTrackingNumber(trackingNumber);
  }

  /**
   * Update a shipment
   */
  @Mutation(() => ShipmentEntity, { description: 'Update an existing shipment' })
  async updateShipment(
    @Args('updateShipmentInput') updateShipmentInput: UpdateShipmentInput,
  ): Promise<ShipmentEntity> {
    return this.shipmentService.update(updateShipmentInput);
  }

  /**
   * Delete a shipment
   */
  @Mutation(() => ShipmentEntity, { description: 'Delete a shipment' })
  async removeShipment(@Args('id', { type: () => String }) id: string): Promise<ShipmentEntity> {
    return this.shipmentService.remove(id);
  }

  /**
   * Assign a driver to a shipment
   */
  @Mutation(() => ShipmentEntity, { description: 'Assign a driver to a shipment' })
  async assignDriver(
    @Args('shipmentId', { type: () => String }) shipmentId: string,
    @Args('driverId', { type: () => String }) driverId: string,
  ): Promise<ShipmentEntity> {
    return this.shipmentService.assignDriver(shipmentId, driverId);
  }
}

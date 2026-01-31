// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shipment Types
export enum ShipmentStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  TRAILER = 'TRAILER',
  FLATBED = 'FLATBED',
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;

  // Shipper
  shipperName: string;
  shipperPhone: string;
  shipperEmail?: string;
  shipperAddress: string;
  shipperCity: string;
  shipperState: string;
  shipperZip: string;

  // Consignee
  consigneeName: string;
  consigneePhone: string;
  consigneeEmail?: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeZip: string;

  // Cargo
  cargoDescription: string;
  weight: number;
  dimensions?: string;
  vehicleType: VehicleType;

  // Financial
  estimatedRate: number;
  actualRate?: number;
  currency: string;

  // Dates
  pickupDate: string;
  deliveryDate?: string;
  estimatedDelivery: string;

  // Relations
  createdById: string;
  createdBy?: User;
  driverId?: string;
  driver?: User;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedShipments {
  data: Shipment[];
  meta: PaginationMeta;
}

// Auth
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
}

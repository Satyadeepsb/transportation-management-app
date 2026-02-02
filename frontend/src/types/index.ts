// User Types
export const UserRole = {
  ADMIN: 'ADMIN',
  DISPATCHER: 'DISPATCHER',
  DRIVER: 'DRIVER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

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
export const ShipmentStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type ShipmentStatus = typeof ShipmentStatus[keyof typeof ShipmentStatus];

export const VehicleType = {
  TRUCK: 'TRUCK',
  VAN: 'VAN',
  TRAILER: 'TRAILER',
  FLATBED: 'FLATBED',
} as const;

export type VehicleType = typeof VehicleType[keyof typeof VehicleType];

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

// User Management
export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
}

export interface PaginatedUsers {
  data: User[];
  meta: PaginationMeta;
}

// Route Types
export interface RouteType {
  name: string;
  layout: string;
  path: string;
  icon: JSX.Element;
  component: JSX.Element;
  secondary?: boolean;
  allowedRoles?: UserRole[]; // Roles that can access this route
  showInMenu?: boolean; // Whether to show in sidebar menu (default: true)
}

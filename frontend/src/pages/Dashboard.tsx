import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENTS_QUERY, GET_DRIVERS_QUERY } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import { ShipmentStatus, VehicleType, UserRole } from '../types';
import type { PaginatedShipments, User } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | ''>('');
  const [driverFilter, setDriverFilter] = useState<string>('');
  const [pickupDateFrom, setPickupDateFrom] = useState('');
  const [pickupDateTo, setPickupDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const canViewDriverFilter = user && [UserRole.ADMIN, UserRole.DISPATCHER].includes(user.role);

  // Build filter object
  const filter: any = {};
  if (statusFilter) {
    filter.status = statusFilter;
  }
  if (vehicleTypeFilter) {
    filter.vehicleType = vehicleTypeFilter;
  }
  if (driverFilter) {
    filter.driverId = driverFilter;
  }

  const { data, loading, error } = useQuery<{ shipments: PaginatedShipments }>(
    GET_SHIPMENTS_QUERY,
    {
      variables: {
        filter,
        pagination: { page, limit: 10 },
      },
    }
  );

  const { data: driversData } = useQuery<{ getDrivers: User[] }>(
    GET_DRIVERS_QUERY,
    {
      skip: !canViewDriverFilter,
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error.message}</p>
      </div>
    );
  }

  const shipments = data?.shipments.data || [];

  // Client-side search filter
  const filteredShipments = searchTerm
    ? shipments.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.shipperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.shipperCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.consigneeCity.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : shipments;

  // Apply date filters
  const dateFilteredShipments = filteredShipments.filter((s) => {
    if (pickupDateFrom && new Date(s.pickupDate) < new Date(pickupDateFrom)) {
      return false;
    }
    if (pickupDateTo && new Date(s.pickupDate) > new Date(pickupDateTo)) {
      return false;
    }
    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setVehicleTypeFilter('');
    setDriverFilter('');
    setPickupDateFrom('');
    setPickupDateTo('');
    setPage(1);
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter,
    vehicleTypeFilter,
    driverFilter,
    pickupDateFrom,
    pickupDateTo,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">All Shipments</h2>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all shipments in the system
            </p>
          </div>
          <button
            onClick={() => navigate('/shipments/create')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Shipment
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by tracking #, shipper, consignee, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              showFilters || activeFiltersCount > 0
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-4 bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value={ShipmentStatus.PENDING}>Pending</option>
                <option value={ShipmentStatus.ASSIGNED}>Assigned</option>
                <option value={ShipmentStatus.PICKED_UP}>Picked Up</option>
                <option value={ShipmentStatus.IN_TRANSIT}>In Transit</option>
                <option value={ShipmentStatus.DELIVERED}>Delivered</option>
                <option value={ShipmentStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value as VehicleType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Vehicles</option>
                <option value={VehicleType.TRUCK}>Truck</option>
                <option value={VehicleType.VAN}>Van</option>
                <option value={VehicleType.TRAILER}>Trailer</option>
                <option value={VehicleType.FLATBED}>Flatbed</option>
              </select>
            </div>

            {/* Driver Filter (ADMIN/DISPATCHER only) */}
            {canViewDriverFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  value={driverFilter}
                  onChange={(e) => setDriverFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Drivers</option>
                  <option value="unassigned">Unassigned</option>
                  {driversData?.getDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pickup Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup From</label>
              <input
                type="date"
                value={pickupDateFrom}
                onChange={(e) => setPickupDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Pickup Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup To</label>
              <input
                type="date"
                value={pickupDateTo}
                onChange={(e) => setPickupDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      {dateFilteredShipments.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {searchTerm || activeFiltersCount > 0
              ? 'No shipments found matching your criteria'
              : 'No shipments available'}
          </p>
          {(searchTerm || activeFiltersCount > 0) && (
            <button
              onClick={handleResetFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dateFilteredShipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  onClick={() => navigate(`/shipments/${shipment.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {shipment.trackingNumber.substring(0, 12)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{shipment.shipperCity}, {shipment.shipperState}</div>
                    <div className="text-gray-500">↓</div>
                    <div>{shipment.consigneeCity}, {shipment.consigneeState}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{shipment.cargoDescription}</div>
                    <div className="text-xs text-gray-400">{shipment.weight} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.vehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${shipment.estimatedRate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.driver ? (
                      <div>
                        <div className="font-medium text-gray-900">{shipment.driver.fullName}</div>
                        <div className="text-xs">{shipment.driver.phone}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.shipments.meta && !searchTerm && dateFilteredShipments.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * 10, data.shipments.meta.total)}
            </span> of{' '}
            <span className="font-medium">{data.shipments.meta.total}</span> shipments
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!data.shipments.meta.hasPreviousPage}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {page} of {data.shipments.meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.shipments.meta.hasNextPage}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useQuery } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENTS_QUERY, GET_DRIVERS_QUERY } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import ShipmentTileView from '../components/ShipmentTileView';
import { ShipmentStatus, VehicleType, UserRole } from '../types';
import type { PaginatedShipments, User } from '../types';

type ViewMode = 'grid' | 'tile';

export default function Shipments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | ''>('');
  const [driverFilter, setDriverFilter] = useState<string>('');
  const [pickupDateFrom, setPickupDateFrom] = useState('');
  const [pickupDateTo, setPickupDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Initialize search term from URL parameter
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  const canViewDriverFilter = user && ([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role);

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

  const { data, loading, error, refetch } = useQuery<{ shipments: PaginatedShipments }>(
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading shipments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800 font-medium">Error: {error.message}</p>
      </div>
    );
  }

  const shipments = data?.shipments.data || [];
  const allDrivers = driversData?.getDrivers || [];

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
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
      </div>

      {/* Header */}
      <div className="mb-6 animate-fadeInUp relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900">
              All Shipments
            </h2>
            <p className="mt-2 text-slate-600 text-lg">
              Browse and manage all shipments in the system
            </p>
          </div>
          {user && ([UserRole.ADMIN, UserRole.DISPATCHER, UserRole.CUSTOMER] as string[]).includes(user.role) && (
            <button
              onClick={() => navigate('/admin/shipments/create')}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl
                       hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105
                       shadow-lg shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/50
                       flex items-center gap-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Shipment
              <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar and View Toggle */}
      <div className="mb-6 animate-fadeInUp delay-100 relative z-10">
        <div className="flex gap-3 items-center">
          <div className="flex-1 group">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by tracking #, shipper, consignee, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex glass border-slate-300 rounded-xl overflow-hidden shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3.5 text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('tile')}
              className={`px-4 py-3.5 text-sm font-medium transition-all duration-300 transform hover:scale-105 border-l border-slate-300 ${
                viewMode === 'tile'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-white/70'
              }`}
              title="Tile View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`group px-6 py-3.5 border text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl ${
              showFilters || activeFiltersCount > 0
                ? 'border-blue-600 text-blue-600 glass bg-blue-50/50'
                : 'border-slate-300 text-slate-700 glass hover:bg-white/70'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-6 glass shadow-xl rounded-2xl p-6 border-slate-200 animate-scaleIn relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value as VehicleType | '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Driver</label>
                <select
                  value={driverFilter}
                  onChange={(e) => setDriverFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                >
                  <option value="">All Drivers</option>
                  <option value="unassigned">Unassigned</option>
                  {allDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pickup Date From */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pickup From</label>
              <input
                type="date"
                value={pickupDateFrom}
                onChange={(e) => setPickupDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>

            {/* Pickup Date To */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pickup To</label>
              <input
                type="date"
                value={pickupDateTo}
                onChange={(e) => setPickupDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shipments Grid/Tile View */}
      {dateFilteredShipments.length === 0 ? (
        <div className="bg-white shadow-md rounded-xl p-8 text-center border border-slate-200">
          <p className="text-slate-600 font-medium">
            {searchTerm || activeFiltersCount > 0
              ? 'No shipments found matching your criteria'
              : 'No shipments available'}
          </p>
          {(searchTerm || activeFiltersCount > 0) && (
            <button
              onClick={handleResetFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'tile' ? (
        <ShipmentTileView
          shipments={dateFilteredShipments}
          user={user}
          onRefetch={() => refetch()}
        />
      ) : (
        <div className="glass shadow-xl overflow-hidden rounded-2xl border-slate-200 animate-fadeInUp delay-200 relative z-10">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="glass-dark">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tracking #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Driver
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateFilteredShipments.map((shipment, index) => (
                <tr
                  key={shipment.id}
                  onClick={() => navigate(`/admin/shipments/${shipment.id}`)}
                  className="hover:bg-white/50 cursor-pointer transition-all duration-200 group animate-fadeInUp"
                  style={{ animationDelay: `${300 + index * 30}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-600">
                    {shipment.trackingNumber.substring(0, 12)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="font-medium">{shipment.shipperCity}, {shipment.shipperState}</div>
                    <div className="text-slate-400">↓</div>
                    <div className="font-medium">{shipment.consigneeCity}, {shipment.consigneeState}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="max-w-xs truncate font-medium">{shipment.cargoDescription}</div>
                    <div className="text-xs text-slate-400 mt-1">{shipment.weight} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {shipment.vehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-slate-900">
                    ${shipment.estimatedRate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {shipment.driver ? (
                      <div>
                        <div className="font-medium text-slate-900">{shipment.driver.fullName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{shipment.driver.phone}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
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
        <div className="mt-6 flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-700 font-medium">
            Showing <span className="font-bold text-slate-900">{((page - 1) * 10) + 1}</span> to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(page * 10, data.shipments.meta.total)}
            </span> of{' '}
            <span className="font-bold text-slate-900">{data.shipments.meta.total}</span> shipments
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!data.shipments.meta.hasPreviousPage}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg">
              Page {page} of {data.shipments.meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.shipments.meta.hasNextPage}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

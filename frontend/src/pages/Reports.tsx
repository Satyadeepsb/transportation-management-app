import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENTS_QUERY } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import { ShipmentStatus, VehicleType, UserRole } from '../types';
import type { PaginatedShipments } from '../types';

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | ''>('');

  // Only ADMIN and DISPATCHER can access this page
  if (user && !([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role)) {
    navigate('/admin/default');
    return null;
  }

  // Build filter object
  const filter: any = {};
  if (statusFilter) {
    filter.status = statusFilter;
  }
  if (vehicleTypeFilter) {
    filter.vehicleType = vehicleTypeFilter;
  }

  const { data, loading, refetch } = useQuery<{ shipments: PaginatedShipments }>(
    GET_SHIPMENTS_QUERY,
    {
      variables: {
        filter,
        pagination: { page: 1, limit: 1000 }, // Get all for report
      },
    }
  );

  const shipments = data?.shipments.data || [];

  // Apply date filters (client-side)
  const filteredShipments = shipments.filter((s) => {
    if (dateFrom && new Date(s.pickupDate) < new Date(dateFrom)) {
      return false;
    }
    if (dateTo && new Date(s.pickupDate) > new Date(dateTo)) {
      return false;
    }
    return true;
  });

  // Calculate summary statistics
  const stats = {
    totalShipments: filteredShipments.length,
    totalRevenue: filteredShipments.reduce((sum, s) => sum + (s.actualRate || s.estimatedRate), 0),
    estimatedRevenue: filteredShipments.reduce((sum, s) => sum + s.estimatedRate, 0),
    actualRevenue: filteredShipments.reduce((sum, s) => sum + (s.actualRate || 0), 0),
    byStatus: {
      pending: filteredShipments.filter(s => s.status === ShipmentStatus.PENDING).length,
      assigned: filteredShipments.filter(s => s.status === ShipmentStatus.ASSIGNED).length,
      pickedUp: filteredShipments.filter(s => s.status === ShipmentStatus.PICKED_UP).length,
      inTransit: filteredShipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length,
      delivered: filteredShipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
      cancelled: filteredShipments.filter(s => s.status === ShipmentStatus.CANCELLED).length,
    },
  };

  const exportToCSV = () => {
    const headers = [
      'Tracking Number',
      'Status',
      'Shipper Name',
      'Shipper City',
      'Shipper State',
      'Consignee Name',
      'Consignee City',
      'Consignee State',
      'Cargo Description',
      'Weight (kg)',
      'Vehicle Type',
      'Pickup Date',
      'Estimated Delivery',
      'Delivery Date',
      'Estimated Rate',
      'Actual Rate',
      'Currency',
      'Driver',
      'Created By',
      'Created At',
    ];

    const rows = filteredShipments.map((s) => [
      s.trackingNumber,
      s.status,
      s.shipperName,
      s.shipperCity,
      s.shipperState,
      s.consigneeName,
      s.consigneeCity,
      s.consigneeState,
      s.cargoDescription,
      s.weight,
      s.vehicleType,
      new Date(s.pickupDate).toLocaleDateString(),
      new Date(s.estimatedDelivery).toLocaleDateString(),
      s.deliveryDate ? new Date(s.deliveryDate).toLocaleDateString() : '',
      s.estimatedRate,
      s.actualRate || '',
      s.currency,
      s.driver?.fullName || 'Unassigned',
      s.createdBy?.fullName || '',
      new Date(s.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipments_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute top-40 right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
      </div>

      {/* Header */}
      <div className="mb-6 animate-fadeInUp relative z-10">
        <h2 className="text-4xl font-display font-bold text-slate-900">
          Shipment Reports
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          Generate and export detailed shipment reports
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 glass p-6 rounded-2xl shadow-xl border-slate-200 animate-fadeInUp delay-100 relative z-10">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Report Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
              className="w-full px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium transition-all duration-200"
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Type</label>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value as VehicleType | '')}
              className="w-full px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium transition-all duration-200"
            >
              <option value="">All Vehicles</option>
              <option value={VehicleType.TRUCK}>Truck</option>
              <option value={VehicleType.VAN}>Van</option>
              <option value={VehicleType.TRAILER}>Trailer</option>
              <option value={VehicleType.FLATBED}>Flatbed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setStatusFilter('');
              setVehicleTypeFilter('');
              refetch();
            }}
            className="px-6 py-3 glass border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Reset Filters
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredShipments.length === 0}
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl
                     hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105
                     shadow-lg shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/50
                     disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none
                     flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export to CSV
            <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={printReport}
            disabled={filteredShipments.length === 0}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl
                     hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105
                     shadow-lg shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/50
                     disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none
                     flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
            <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96 relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-purple-600 border-b-purple-200 border-l-purple-200"></div>
            <div className="absolute inset-0 rounded-full animate-pulse-glow"></div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {!loading && (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-200 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Shipments</p>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800 mt-1">
                    {stats.totalShipments}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-300 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 mt-1">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-400 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Estimated</p>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 mt-1">
                    ${stats.estimatedRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-500 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Actual Revenue</p>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800 mt-1">
                    ${stats.actualRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="mb-6 glass border-slate-200 rounded-2xl p-6 shadow-xl animate-fadeInUp delay-600 relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Status Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass border-slate-200 rounded-xl p-4 card-3d text-center group">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.byStatus.pending}
                </div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending</div>
              </div>
              <div className="glass border-slate-200 rounded-xl p-4 card-3d text-center group">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.byStatus.assigned}
                </div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Assigned</div>
              </div>
              <div className="glass border-slate-200 rounded-xl p-4 card-3d text-center group">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.byStatus.pickedUp}
                </div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Picked Up</div>
              </div>
              <div className="glass border-slate-200 rounded-xl p-4 card-3d text-center group">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.byStatus.inTransit}
                </div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">In Transit</div>
              </div>
              <div className="glass border-slate-200 rounded-xl p-4 card-3d text-center group">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.byStatus.delivered}
                </div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Delivered</div>
              </div>
              <div className="glass border-slate-200 rounded-xl p-4 card-3d text-center group">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.byStatus.cancelled}
                </div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Cancelled</div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="glass border-slate-200 rounded-2xl overflow-hidden shadow-xl print:shadow-none animate-fadeInUp delay-700 relative z-10">
            <div className="px-6 py-4 glass-dark print:border-b-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Detailed Shipment Data
              </h3>
            </div>

            {filteredShipments.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 font-medium text-lg">No shipments found matching the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="glass-dark">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Tracking #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Pickup Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Est. Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Actual Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider print:hidden">
                        Driver
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShipments.map((shipment, index) => (
                      <tr
                        key={shipment.id}
                        className="hover:bg-white/50 transition-all duration-200 group animate-fadeInUp"
                        style={{ animationDelay: `${800 + index * 20}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {shipment.trackingNumber.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <div>{shipment.shipperCity}, {shipment.shipperState}</div>
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div>{shipment.consigneeCity}, {shipment.consigneeState}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {new Date(shipment.pickupDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm bg-gradient-to-r from-slate-500 to-slate-600 text-white">
                            {shipment.vehicleType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          ${shipment.estimatedRate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {shipment.actualRate ? `$${shipment.actualRate.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium print:hidden">
                          {shipment.driver?.fullName || 'Unassigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Print-only footer */}
          <div className="hidden print:block mt-6">
            <p className="text-sm text-gray-500 text-center">
              Generated on {new Date().toLocaleString()} by {user?.fullName}
            </p>
          </div>
        </>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-b-2 {
            border-bottom-width: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}

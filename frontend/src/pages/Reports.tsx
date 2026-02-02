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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Shipment Reports</h2>
        <p className="mt-1 text-sm text-gray-600">
          Generate and export detailed shipment reports
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

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
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setStatusFilter('');
              setVehicleTypeFilter('');
              refetch();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset Filters
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredShipments.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export to CSV
          </button>
          <button
            onClick={printReport}
            disabled={filteredShipments.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Print Report
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading report data...</p>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {!loading && (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm font-medium text-gray-500">Total Shipments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalShipments}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm font-medium text-gray-500">Estimated Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.estimatedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm font-medium text-gray-500">Actual Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.actualRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="mb-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.byStatus.assigned}</div>
                <div className="text-sm text-gray-500">Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.byStatus.pickedUp}</div>
                <div className="text-sm text-gray-500">Picked Up</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.byStatus.inTransit}</div>
                <div className="text-sm text-gray-500">In Transit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.byStatus.delivered}</div>
                <div className="text-sm text-gray-500">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.byStatus.cancelled}</div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden print:shadow-none">
            <div className="px-6 py-4 border-b border-gray-200 print:border-b-2">
              <h3 className="text-lg font-medium text-gray-900">Detailed Shipment Data</h3>
            </div>

            {filteredShipments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No shipments found matching the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pickup Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Est. Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                        Driver
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shipment.trackingNumber.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{shipment.shipperCity}, {shipment.shipperState}</div>
                          <div className="text-gray-500">→</div>
                          <div>{shipment.consigneeCity}, {shipment.consigneeState}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(shipment.pickupDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shipment.vehicleType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${shipment.estimatedRate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.actualRate ? `$${shipment.actualRate.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
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

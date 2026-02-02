import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENTS_QUERY, UPDATE_SHIPMENT_MUTATION } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import { UserRole, ShipmentStatus } from '../types';
import type { PaginatedShipments } from '../types';

export default function MyShipments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>(ShipmentStatus.PICKED_UP);

  const isDriver = user?.role === UserRole.DRIVER;
  const isCustomer = user?.role === UserRole.CUSTOMER;

  // Build filter based on role
  const filter: any = {};
  if (isDriver && user?.id) {
    filter.driverId = user.id;
  } else if (isCustomer && user?.id) {
    filter.createdById = user.id;
  }
  if (statusFilter) {
    filter.status = statusFilter;
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

  const [updateShipment, { loading: updateLoading }] = useMutation(UPDATE_SHIPMENT_MUTATION);

  const handleStatusUpdate = async (shipmentId: string) => {
    try {
      await updateShipment({
        variables: {
          input: {
            id: shipmentId,
            status: newStatus,
          },
        },
      });
      setUpdatingShipmentId(null);
      refetch();
    } catch (err: any) {
      console.error('Update status error:', err);
      alert(err.message || 'Failed to update status');
    }
  };

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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isDriver ? 'My Assigned Shipments' : 'My Shipments'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {isDriver
            ? 'View and update status of shipments assigned to you'
            : 'View and track your shipments'}
        </p>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

      {/* Shipments List */}
      {shipments.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No shipments found</p>
          {isCustomer && (
            <button
              onClick={() => navigate('/admin/shipments/create')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Your First Shipment
            </button>
          )}
        </div>
      ) : (
        <>
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
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Date
                  </th>
                  {isDriver && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/shipments/${shipment.id}`)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        {shipment.trackingNumber.substring(0, 12)}...
                      </button>
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
                      {new Date(shipment.pickupDate).toLocaleDateString()}
                    </td>
                    {isDriver && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {updatingShipmentId === shipment.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                              disabled={updateLoading}
                            >
                              <option value={ShipmentStatus.PICKED_UP}>Picked Up</option>
                              <option value={ShipmentStatus.IN_TRANSIT}>In Transit</option>
                              <option value={ShipmentStatus.DELIVERED}>Delivered</option>
                            </select>
                            <button
                              onClick={() => handleStatusUpdate(shipment.id)}
                              disabled={updateLoading}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
                            >
                              {updateLoading ? '...' : '✓'}
                            </button>
                            <button
                              onClick={() => setUpdatingShipmentId(null)}
                              disabled={updateLoading}
                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setUpdatingShipmentId(shipment.id);
                              setNewStatus(
                                shipment.status === ShipmentStatus.ASSIGNED
                                  ? ShipmentStatus.PICKED_UP
                                  : shipment.status === ShipmentStatus.PICKED_UP
                                  ? ShipmentStatus.IN_TRANSIT
                                  : ShipmentStatus.DELIVERED
                              );
                            }}
                            disabled={shipment.status === ShipmentStatus.DELIVERED || shipment.status === ShipmentStatus.CANCELLED}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.shipments.meta && (
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
                  onClick={() => setPage(p => p - 1)}
                  disabled={!data.shipments.meta.hasPreviousPage}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {page} of {data.shipments.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.shipments.meta.hasNextPage}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

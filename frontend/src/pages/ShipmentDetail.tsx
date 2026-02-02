import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENT_QUERY, DELETE_SHIPMENT_MUTATION } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import AssignDriverModal from '../components/AssignDriverModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { UserRole } from '../types';
import type { Shipment } from '../types';

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, loading, error } = useQuery<{ shipment: Shipment }>(GET_SHIPMENT_QUERY, {
    variables: { id },
    skip: !id,
  });

  const [deleteShipment, { loading: deleteLoading }] = useMutation(DELETE_SHIPMENT_MUTATION);

  const shipment = data?.shipment;

  // Role-based permissions
  const canEdit = user && ([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role);
  const canDelete = user?.role === UserRole.ADMIN;
  const canAssignDriver = user && ([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">
          {error?.message || 'Shipment not found'}
        </p>
      </div>
    );
  }

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    alert('Tracking number copied to clipboard!');
  };

  const handleDelete = async () => {
    try {
      await deleteShipment({ variables: { id } });
      navigate('/admin/shipments');
    } catch (err: any) {
      console.error('Delete shipment error:', err);
      alert(err.message || 'Failed to delete shipment');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Shipment Details</h2>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={copyTrackingNumber}
                className="text-lg font-mono text-indigo-600 hover:text-indigo-800 cursor-pointer"
                title="Click to copy"
              >
                {shipment.trackingNumber}
              </button>
              <StatusBadge status={shipment.status} />
            </div>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <button
                onClick={() => navigate(`/admin/shipments/${id}/edit`)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </button>
            )}

            {canAssignDriver && !shipment.driverId && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Assign Driver
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipper Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            📤 Shipper Information
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{shipment.shipperName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{shipment.shipperPhone}</dd>
            </div>
            {shipment.shipperEmail && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{shipment.shipperEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="text-sm text-gray-900">
                {shipment.shipperAddress}<br />
                {shipment.shipperCity}, {shipment.shipperState} {shipment.shipperZip}
              </dd>
            </div>
          </dl>
        </div>

        {/* Consignee Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            📥 Consignee Information
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{shipment.consigneeName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{shipment.consigneePhone}</dd>
            </div>
            {shipment.consigneeEmail && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{shipment.consigneeEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="text-sm text-gray-900">
                {shipment.consigneeAddress}<br />
                {shipment.consigneeCity}, {shipment.consigneeState} {shipment.consigneeZip}
              </dd>
            </div>
          </dl>
        </div>

        {/* Cargo Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            📦 Cargo Details
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="text-sm text-gray-900">{shipment.cargoDescription}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Weight</dt>
              <dd className="text-sm text-gray-900">{shipment.weight} kg</dd>
            </div>
            {shipment.dimensions && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                <dd className="text-sm text-gray-900">{shipment.dimensions}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Vehicle Type</dt>
              <dd className="text-sm text-gray-900">{shipment.vehicleType}</dd>
            </div>
          </dl>
        </div>

        {/* Dates & Financial */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            💰 Dates & Financial
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Pickup Date</dt>
              <dd className="text-sm text-gray-900">
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Estimated Delivery</dt>
              <dd className="text-sm text-gray-900">
                {new Date(shipment.estimatedDelivery).toLocaleDateString()}
              </dd>
            </div>
            {shipment.deliveryDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Estimated Rate</dt>
              <dd className="text-sm text-gray-900">
                {shipment.currency} {shipment.estimatedRate.toLocaleString()}
              </dd>
            </div>
            {shipment.actualRate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Actual Rate</dt>
                <dd className="text-sm text-gray-900">
                  {shipment.currency} {shipment.actualRate.toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Driver Information */}
      {shipment.driver && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            🚚 Assigned Driver
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{shipment.driver.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{shipment.driver.phone}</dd>
            </div>
            {shipment.driver.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{shipment.driver.email}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Notes */}
      {shipment.notes && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            📝 Notes
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{shipment.notes}</p>
        </div>
      )}

      {/* Created By */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        Created by {shipment.createdBy?.fullName || 'Unknown'} on{' '}
        {new Date(shipment.createdAt).toLocaleString()}
      </div>

      {/* Assign Driver Modal */}
      {id && (
        <AssignDriverModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          shipmentId={id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Shipment"
        message="Are you sure you want to delete this shipment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleteLoading}
        danger
      />
    </div>
  );
}

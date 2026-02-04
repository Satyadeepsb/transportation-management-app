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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800 font-medium">
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
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
      </div>

      {/* Header */}
      <div className="mb-6 animate-fadeInUp relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-emerald-900 to-blue-900">
              Shipment Details
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={copyTrackingNumber}
                className="group relative px-4 py-2 glass rounded-xl font-mono font-bold text-blue-600 hover:text-blue-800 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl border-blue-200"
                title="Click to copy"
              >
                {shipment.trackingNumber}
                <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <StatusBadge status={shipment.status} />
            </div>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <button
                onClick={() => navigate(`/admin/shipments/${id}/edit`)}
                className="group px-6 py-3 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 glass hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}

            {canAssignDriver && !shipment.driverId && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="group relative px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Assign Driver
                <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="group relative px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
                <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-container relative z-10">
        {/* Shipper Details */}
        <div className="glass rounded-2xl p-6 border-slate-200 card-3d shadow-xl animate-fadeInUp delay-100 group">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📤</span>
            <span>Shipper Information</span>
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Name</dt>
              <dd className="text-sm font-medium text-slate-900">{shipment.shipperName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Phone</dt>
              <dd className="text-sm font-medium text-slate-900 font-mono">{shipment.shipperPhone}</dd>
            </div>
            {shipment.shipperEmail && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Email</dt>
                <dd className="text-sm font-medium text-slate-900">{shipment.shipperEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Address</dt>
              <dd className="text-sm font-medium text-slate-900">
                {shipment.shipperAddress}<br />
                {shipment.shipperCity}, {shipment.shipperState} {shipment.shipperZip}
              </dd>
            </div>
          </dl>
        </div>

        {/* Consignee Details */}
        <div className="glass rounded-2xl p-6 border-slate-200 card-3d shadow-xl animate-fadeInUp delay-200 group">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📥</span>
            <span>Consignee Information</span>
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Name</dt>
              <dd className="text-sm font-medium text-slate-900">{shipment.consigneeName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Phone</dt>
              <dd className="text-sm font-medium text-slate-900 font-mono">{shipment.consigneePhone}</dd>
            </div>
            {shipment.consigneeEmail && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Email</dt>
                <dd className="text-sm font-medium text-slate-900">{shipment.consigneeEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Address</dt>
              <dd className="text-sm font-medium text-slate-900">
                {shipment.consigneeAddress}<br />
                {shipment.consigneeCity}, {shipment.consigneeState} {shipment.consigneeZip}
              </dd>
            </div>
          </dl>
        </div>

        {/* Cargo Details */}
        <div className="glass rounded-2xl p-6 border-slate-200 card-3d shadow-xl animate-fadeInUp delay-300 group">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📦</span>
            <span>Cargo Details</span>
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Description</dt>
              <dd className="text-sm font-medium text-slate-900">{shipment.cargoDescription}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Weight</dt>
              <dd className="text-sm font-medium text-slate-900 font-mono">{shipment.weight} kg</dd>
            </div>
            {shipment.dimensions && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Dimensions</dt>
                <dd className="text-sm font-medium text-slate-900 font-mono">{shipment.dimensions}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Vehicle Type</dt>
              <dd className="text-sm font-medium text-slate-900">{shipment.vehicleType}</dd>
            </div>
          </dl>
        </div>

        {/* Dates & Financial */}
        <div className="glass rounded-2xl p-6 border-slate-200 card-3d shadow-xl animate-fadeInUp delay-400 group">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💰</span>
            <span>Dates & Financial</span>
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Pickup Date</dt>
              <dd className="text-sm font-medium text-slate-900">
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Estimated Delivery</dt>
              <dd className="text-sm font-medium text-slate-900">
                {new Date(shipment.estimatedDelivery).toLocaleDateString()}
              </dd>
            </div>
            {shipment.deliveryDate && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Actual Delivery</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Estimated Rate</dt>
              <dd className="text-sm font-semibold text-slate-900 font-mono">
                {shipment.currency} {shipment.estimatedRate.toLocaleString()}
              </dd>
            </div>
            {shipment.actualRate && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Actual Rate</dt>
                <dd className="text-sm font-semibold text-slate-900 font-mono">
                  {shipment.currency} {shipment.actualRate.toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Driver Information */}
      {shipment.driver && (
        <div className="mt-6 glass rounded-2xl p-6 border-slate-200 card-3d shadow-xl animate-fadeInUp delay-500 group relative z-10">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚚</span>
            <span>Assigned Driver</span>
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Name</dt>
              <dd className="text-sm font-medium text-slate-900">{shipment.driver.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Phone</dt>
              <dd className="text-sm font-medium text-slate-900 font-mono">{shipment.driver.phone}</dd>
            </div>
            {shipment.driver.email && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Email</dt>
                <dd className="text-sm font-medium text-slate-900">{shipment.driver.email}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Notes */}
      {shipment.notes && (
        <div className="mt-6 glass rounded-2xl p-6 border-slate-200 card-3d shadow-xl animate-fadeInUp delay-600 group relative z-10">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📝</span>
            <span>Notes</span>
          </h3>
          <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{shipment.notes}</p>
        </div>
      )}

      {/* Created By */}
      <div className="mt-6 glass rounded-2xl p-5 text-sm text-slate-600 font-medium border-slate-200 shadow-md animate-fadeInUp delay-700 relative z-10">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Created by <span className="font-bold text-slate-900">{shipment.createdBy?.fullName || 'Unknown'}</span> on{' '}
          <span className="font-bold text-slate-900">{new Date(shipment.createdAt).toLocaleString()}</span></span>
        </div>
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

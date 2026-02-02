import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import StatusBadge from './StatusBadge';
import { DELETE_SHIPMENT_MUTATION, FLAG_SHIPMENT_MUTATION } from '../graphql/shipments';
import { UserRole } from '../types';
import type { Shipment, User } from '../types';

interface ShipmentTileViewProps {
  shipments: Shipment[];
  user: User | null;
  onRefetch: () => void;
}

export default function ShipmentTileView({ shipments, user, onRefetch }: ShipmentTileViewProps) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandedTile, setExpandedTile] = useState<string | null>(null);

  const [deleteShipment] = useMutation(DELETE_SHIPMENT_MUTATION);
  const [flagShipment] = useMutation(FLAG_SHIPMENT_MUTATION);

  const canEdit = user && ([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role);
  const canDelete = user && user.role === UserRole.ADMIN;

  const handleDelete = async (shipmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;

    try {
      await deleteShipment({ variables: { id: shipmentId } });
      onRefetch();
      setActiveMenu(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete shipment');
    }
  };

  const handleFlag = async (shipmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await flagShipment({ variables: { id: shipmentId } });
      onRefetch();
      setActiveMenu(null);
      alert('Shipment flagged for review');
    } catch (error) {
      console.error('Flag error:', error);
      alert('Failed to flag shipment');
    }
  };

  const handleEdit = (shipmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/shipments/${shipmentId}/edit`);
  };

  const toggleExpanded = (shipmentId: string) => {
    setExpandedTile(expandedTile === shipmentId ? null : shipmentId);
  };

  if (expandedTile) {
    const shipment = shipments.find((s) => s.id === expandedTile);
    if (!shipment) return null;

    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Back Button */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setExpandedTile(null)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tiles
          </button>
        </div>

        {/* Expanded Detail View */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shipment Details</h2>
              <p className="text-sm text-gray-500 mt-1">Tracking: {shipment.trackingNumber}</p>
            </div>
            <StatusBadge status={shipment.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipper Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipper Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{shipment.shipperName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{shipment.shipperEmail}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{shipment.shipperPhone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="ml-2 text-gray-900">
                    {shipment.shipperAddress}<br />
                    {shipment.shipperCity}, {shipment.shipperState} {shipment.shipperZip}
                  </p>
                </div>
              </div>
            </div>

            {/* Consignee Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Consignee Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{shipment.consigneeName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{shipment.consigneeEmail}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{shipment.consigneePhone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="ml-2 text-gray-900">
                    {shipment.consigneeAddress}<br />
                    {shipment.consigneeCity}, {shipment.consigneeState} {shipment.consigneeZip}
                  </p>
                </div>
              </div>
            </div>

            {/* Cargo Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cargo Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="ml-2 text-gray-900">{shipment.cargoDescription}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Weight:</span>
                  <span className="ml-2 text-gray-900">{shipment.weight} kg</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vehicle Type:</span>
                  <span className="ml-2 text-gray-900">{shipment.vehicleType}</span>
                </div>
              </div>
            </div>

            {/* Dates & Rates */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule & Rates</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Pickup Date:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(shipment.pickupDate).toLocaleDateString()}
                  </span>
                </div>
                {shipment.deliveryDate && (
                  <div>
                    <span className="font-medium text-gray-700">Delivery Date:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(shipment.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Estimated Rate:</span>
                  <span className="ml-2 text-gray-900 font-semibold text-lg">
                    ${shipment.estimatedRate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          {shipment.driver && (
            <div className="mt-6 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned Driver</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {shipment.driver.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{shipment.driver.fullName}</p>
                  <p className="text-sm text-gray-500">{shipment.driver.email}</p>
                  <p className="text-sm text-gray-500">{shipment.driver.phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shipments.map((shipment) => (
        <div
          key={shipment.id}
          onClick={() => toggleExpanded(shipment.id)}
          className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
        >
          {/* Tile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate opacity-90">Tracking Number</p>
                <p className="text-sm font-bold truncate">{shipment.trackingNumber.substring(0, 16)}...</p>
              </div>
              <div className="ml-2">
                <StatusBadge status={shipment.status} />
              </div>
            </div>
          </div>

          {/* Tile Body */}
          <div className="px-4 py-4">
            <div className="space-y-3">
              {/* Route */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Route</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{shipment.shipperCity}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-medium text-gray-900">{shipment.consigneeCity}</span>
                </div>
              </div>

              {/* Cargo */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Cargo</p>
                <p className="text-sm text-gray-700 truncate">{shipment.cargoDescription}</p>
                <p className="text-xs text-gray-500 mt-1">{shipment.weight} kg • {shipment.vehicleType}</p>
              </div>

              {/* Rate */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Rate</p>
                <p className="text-lg font-bold text-gray-900">${shipment.estimatedRate.toLocaleString()}</p>
              </div>

              {/* Driver */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Driver</p>
                {shipment.driver ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {shipment.driver.fullName.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{shipment.driver.fullName}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu Button (Bun Button) */}
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === shipment.id ? null : shipment.id);
              }}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {activeMenu === shipment.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => toggleExpanded(shipment.id)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>

                  {canEdit && (
                    <button
                      onClick={(e) => handleEdit(shipment.id, e)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}

                  <button
                    onClick={(e) => handleFlag(shipment.id, e)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Flag for Review
                  </button>

                  {canDelete && (
                    <button
                      onClick={(e) => handleDelete(shipment.id, e)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

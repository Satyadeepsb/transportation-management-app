import { useState, FormEvent } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { TRACK_SHIPMENT_QUERY } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import type { Shipment } from '../types';

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackShipment, { data, loading, error }] = useLazyQuery<{ trackShipment: Shipment }>(
    TRACK_SHIPMENT_QUERY
  );

  const shipment = data?.trackShipment;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      trackShipment({ variables: { trackingNumber: trackingNumber.trim() } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Shipment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your tracking number to view shipment status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Tracking shipment...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              {error.message.includes('not found')
                ? 'Shipment not found. Please check your tracking number and try again.'
                : error.message}
            </p>
          </div>
        )}

        {/* Shipment Details */}
        {shipment && !loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-200">Tracking Number</p>
                  <p className="text-lg font-mono font-semibold text-white">
                    {shipment.trackingNumber}
                  </p>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
            </div>

            {/* Route Information */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Origin */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📤 Origin</h3>
                  <div className="text-gray-900">
                    <p className="font-medium">{shipment.shipperCity}, {shipment.shipperState}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Pickup: {new Date(shipment.pickupDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📥 Destination</h3>
                  <div className="text-gray-900">
                    <p className="font-medium">{shipment.consigneeCity}, {shipment.consigneeState}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Est. Delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                    {shipment.deliveryDate && (
                      <p className="text-sm text-green-600 mt-1">
                        Delivered: {new Date(shipment.deliveryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              {shipment.driver && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">🚚 Driver Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-gray-900">{shipment.driver.fullName}</p>
                    </div>
                    {shipment.driver.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900">{shipment.driver.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Status Timeline</h3>
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 ${shipment.status !== 'PENDING' ? 'opacity-50' : ''}`}>
                    <div className={`w-2 h-2 mt-2 rounded-full ${shipment.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending</p>
                      <p className="text-xs text-gray-500">Awaiting assignment</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3 ${!['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status) ? 'opacity-50' : ''}`}>
                    <div className={`w-2 h-2 mt-2 rounded-full ${shipment.status === 'ASSIGNED' ? 'bg-blue-500' : ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assigned</p>
                      <p className="text-xs text-gray-500">Driver assigned to shipment</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3 ${!['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status) ? 'opacity-50' : ''}`}>
                    <div className={`w-2 h-2 mt-2 rounded-full ${shipment.status === 'PICKED_UP' ? 'bg-indigo-500' : ['IN_TRANSIT', 'DELIVERED'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Picked Up</p>
                      <p className="text-xs text-gray-500">Shipment collected from origin</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3 ${!['IN_TRANSIT', 'DELIVERED'].includes(shipment.status) ? 'opacity-50' : ''}`}>
                    <div className={`w-2 h-2 mt-2 rounded-full ${shipment.status === 'IN_TRANSIT' ? 'bg-purple-500' : shipment.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">In Transit</p>
                      <p className="text-xs text-gray-500">On the way to destination</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3 ${shipment.status !== 'DELIVERED' ? 'opacity-50' : ''}`}>
                    <div className={`w-2 h-2 mt-2 rounded-full ${shipment.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivered</p>
                      <p className="text-xs text-gray-500">Shipment successfully delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support or{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              sign in to your account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

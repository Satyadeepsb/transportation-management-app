import { useState, Fragment } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_DRIVERS_QUERY, ASSIGN_DRIVER_MUTATION, GET_SHIPMENT_QUERY } from '../graphql/shipments';
import type { User } from '../types';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
}

export default function AssignDriverModal({
  isOpen,
  onClose,
  shipmentId,
}: AssignDriverModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const { data: driversData, loading: driversLoading } = useQuery<{ drivers: User[] }>(
    GET_DRIVERS_QUERY,
    { skip: !isOpen }
  );

  const [assignDriver, { loading: assignLoading }] = useMutation(ASSIGN_DRIVER_MUTATION, {
    refetchQueries: [
      { query: GET_SHIPMENT_QUERY, variables: { id: shipmentId } },
    ],
  });

  const drivers = driversData?.drivers || [];
  const filteredDrivers = drivers.filter((driver) =>
    driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedDriverId) {
      setError('Please select a driver');
      return;
    }

    try {
      await assignDriver({
        variables: {
          shipmentId,
          driverId: selectedDriverId,
        },
      });
      onClose();
      setSelectedDriverId('');
      setSearchTerm('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to assign driver');
      console.error('Assign driver error:', err);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedDriverId('');
    setSearchTerm('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Assign Driver
                </h3>
                <div className="mt-4">
                  {/* Search input */}
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-4"
                  />

                  {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Driver list */}
                  {driversLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading drivers...</p>
                    </div>
                  ) : filteredDrivers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No drivers found
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredDrivers.map((driver) => (
                        <div
                          key={driver.id}
                          onClick={() => setSelectedDriverId(driver.id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 ${
                            selectedDriverId === driver.id
                              ? 'bg-indigo-50 border-indigo-500 border-l-4'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {driver.fullName}
                              </p>
                              {driver.phone && (
                                <p className="text-sm text-gray-500">{driver.phone}</p>
                              )}
                              {driver.email && (
                                <p className="text-xs text-gray-400">{driver.email}</p>
                              )}
                            </div>
                            {selectedDriverId === driver.id && (
                              <span className="text-indigo-600">✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleAssign}
              disabled={assignLoading || !selectedDriverId}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {assignLoading ? 'Assigning...' : 'Assign Driver'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={assignLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

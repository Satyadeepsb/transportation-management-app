import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENT_QUERY, UPDATE_SHIPMENT_MUTATION } from '../graphql/shipments';
import ShipmentForm from '../components/ShipmentForm';
import { UserRole, ShipmentStatus } from '../types';
import type { Shipment } from '../types';
import type { ShipmentFormData } from '../components/ShipmentForm';

export default function EditShipment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');

  // Check permissions
  useEffect(() => {
    if (user && !([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role)) {
      navigate('/admin/shipments');
    }
  }, [user, navigate]);

  const { data, loading: queryLoading } = useQuery<{ shipment: Shipment }>(GET_SHIPMENT_QUERY, {
    variables: { id },
    skip: !id,
  });

  const [updateShipment, { loading: mutationLoading }] = useMutation(UPDATE_SHIPMENT_MUTATION);

  const [formData, setFormData] = useState<ShipmentFormData>({
    shipperName: '',
    shipperPhone: '',
    shipperEmail: '',
    shipperAddress: '',
    shipperCity: '',
    shipperState: '',
    shipperZip: '',
    consigneeName: '',
    consigneePhone: '',
    consigneeEmail: '',
    consigneeAddress: '',
    consigneeCity: '',
    consigneeState: '',
    consigneeZip: '',
    cargoDescription: '',
    weight: '',
    dimensions: '',
    vehicleType: '' as any,
    estimatedRate: '',
    currency: 'USD',
    pickupDate: '',
    estimatedDelivery: '',
    notes: '',
  });

  const [status, setStatus] = useState<ShipmentStatus>(ShipmentStatus.PENDING);
  const [actualRate, setActualRate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Populate form when data loads
  useEffect(() => {
    if (data?.shipment) {
      const s = data.shipment;
      setFormData({
        shipperName: s.shipperName,
        shipperPhone: s.shipperPhone,
        shipperEmail: s.shipperEmail || '',
        shipperAddress: s.shipperAddress,
        shipperCity: s.shipperCity,
        shipperState: s.shipperState,
        shipperZip: s.shipperZip,
        consigneeName: s.consigneeName,
        consigneePhone: s.consigneePhone,
        consigneeEmail: s.consigneeEmail || '',
        consigneeAddress: s.consigneeAddress,
        consigneeCity: s.consigneeCity,
        consigneeState: s.consigneeState,
        consigneeZip: s.consigneeZip,
        cargoDescription: s.cargoDescription,
        weight: s.weight.toString(),
        dimensions: s.dimensions || '',
        vehicleType: s.vehicleType,
        estimatedRate: s.estimatedRate.toString(),
        currency: s.currency,
        pickupDate: s.pickupDate.split('T')[0],
        estimatedDelivery: s.estimatedDelivery.split('T')[0],
        notes: s.notes || '',
      });
      setStatus(s.status);
      setActualRate(s.actualRate?.toString() || '');
      setDeliveryDate(s.deliveryDate ? s.deliveryDate.split('T')[0] : '');
    }
  }, [data]);

  const handleChange = (field: keyof ShipmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const weight = parseFloat(formData.weight);
      const estimatedRate = parseFloat(formData.estimatedRate);
      const actualRateValue = actualRate ? parseFloat(actualRate) : undefined;

      if (weight <= 0) {
        setError('Weight must be greater than 0');
        return;
      }

      if (estimatedRate <= 0) {
        setError('Estimated rate must be greater than 0');
        return;
      }

      if (actualRateValue !== undefined && actualRateValue <= 0) {
        setError('Actual rate must be greater than 0');
        return;
      }

      const input = {
        id,
        status,
        shipperName: formData.shipperName,
        shipperPhone: formData.shipperPhone,
        shipperEmail: formData.shipperEmail || undefined,
        shipperAddress: formData.shipperAddress,
        shipperCity: formData.shipperCity,
        shipperState: formData.shipperState,
        shipperZip: formData.shipperZip,
        consigneeName: formData.consigneeName,
        consigneePhone: formData.consigneePhone,
        consigneeEmail: formData.consigneeEmail || undefined,
        consigneeAddress: formData.consigneeAddress,
        consigneeCity: formData.consigneeCity,
        consigneeState: formData.consigneeState,
        consigneeZip: formData.consigneeZip,
        cargoDescription: formData.cargoDescription,
        weight,
        dimensions: formData.dimensions || undefined,
        vehicleType: formData.vehicleType,
        estimatedRate,
        actualRate: actualRateValue,
        currency: formData.currency,
        pickupDate: formData.pickupDate,
        estimatedDelivery: formData.estimatedDelivery,
        deliveryDate: deliveryDate || undefined,
        notes: formData.notes || undefined,
      };

      await updateShipment({
        variables: { input },
      });

      navigate(`/admin/shipments/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update shipment. Please try again.');
      console.error('Update shipment error:', err);
    }
  };

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipment...</p>
        </div>
      </div>
    );
  }

  if (!data?.shipment) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">Shipment not found</p>
      </div>
    );
  }

  const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Edit Shipment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update shipment details and status
        </p>
      </div>

      {/* Additional Edit Fields */}
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Additional Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              className={inputClass}
            >
              <option value={ShipmentStatus.PENDING}>Pending</option>
              <option value={ShipmentStatus.ASSIGNED}>Assigned</option>
              <option value={ShipmentStatus.PICKED_UP}>Picked Up</option>
              <option value={ShipmentStatus.IN_TRANSIT}>In Transit</option>
              <option value={ShipmentStatus.DELIVERED}>Delivered</option>
              <option value={ShipmentStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="actualRate" className={labelClass}>
              Actual Rate
            </label>
            <input
              type="number"
              id="actualRate"
              min="0"
              step="0.01"
              value={actualRate}
              onChange={(e) => setActualRate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="deliveryDate" className={labelClass}>
              Delivery Date
            </label>
            <input
              type="date"
              id="deliveryDate"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <ShipmentForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={mutationLoading}
        error={error}
        submitLabel="Update Shipment"
      />
    </div>
  );
}

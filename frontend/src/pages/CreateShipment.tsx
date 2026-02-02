import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { CREATE_SHIPMENT_MUTATION } from '../graphql/shipments';
import ShipmentForm from '../components/ShipmentForm';
import { VehicleType } from '../types';
import type { ShipmentFormData } from '../components/ShipmentForm';

export default function CreateShipment() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ShipmentFormData>({
    // Shipper
    shipperName: '',
    shipperPhone: '',
    shipperEmail: '',
    shipperAddress: '',
    shipperCity: '',
    shipperState: '',
    shipperZip: '',
    // Consignee
    consigneeName: '',
    consigneePhone: '',
    consigneeEmail: '',
    consigneeAddress: '',
    consigneeCity: '',
    consigneeState: '',
    consigneeZip: '',
    // Cargo
    cargoDescription: '',
    weight: '',
    dimensions: '',
    vehicleType: '' as VehicleType,
    // Financial & Dates
    estimatedRate: '',
    currency: 'USD',
    pickupDate: '',
    estimatedDelivery: '',
    notes: '',
  });

  const [createShipment, { loading }] = useMutation<{ createShipment: { id: string } }>(CREATE_SHIPMENT_MUTATION);

  const handleChange = (field: keyof ShipmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate dates
      const pickupDate = new Date(formData.pickupDate);
      const estimatedDelivery = new Date(formData.estimatedDelivery);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickupDate < today) {
        setError('Pickup date cannot be in the past');
        return;
      }

      if (estimatedDelivery <= pickupDate) {
        setError('Estimated delivery must be after pickup date');
        return;
      }

      // Validate weight and rate
      const weight = parseFloat(formData.weight);
      const estimatedRate = parseFloat(formData.estimatedRate);

      if (weight <= 0) {
        setError('Weight must be greater than 0');
        return;
      }

      if (estimatedRate <= 0) {
        setError('Estimated rate must be greater than 0');
        return;
      }

      // Prepare input data
      const input = {
        // Shipper
        shipperName: formData.shipperName,
        shipperPhone: formData.shipperPhone,
        shipperEmail: formData.shipperEmail || undefined,
        shipperAddress: formData.shipperAddress,
        shipperCity: formData.shipperCity,
        shipperState: formData.shipperState,
        shipperZip: formData.shipperZip,
        // Consignee
        consigneeName: formData.consigneeName,
        consigneePhone: formData.consigneePhone,
        consigneeEmail: formData.consigneeEmail || undefined,
        consigneeAddress: formData.consigneeAddress,
        consigneeCity: formData.consigneeCity,
        consigneeState: formData.consigneeState,
        consigneeZip: formData.consigneeZip,
        // Cargo
        cargoDescription: formData.cargoDescription,
        weight,
        dimensions: formData.dimensions || undefined,
        vehicleType: formData.vehicleType,
        // Financial & Dates
        estimatedRate,
        currency: formData.currency,
        pickupDate: formData.pickupDate,
        estimatedDelivery: formData.estimatedDelivery,
        notes: formData.notes || undefined,
      };

      const { data } = await createShipment({
        variables: { input },
      });

      if (data?.createShipment) {
        // Navigate to shipment detail page
        navigate(`/admin/shipments/${data.createShipment.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment. Please try again.');
      console.error('Create shipment error:', err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Create New Shipment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the details below to create a new shipment
        </p>
      </div>

      <ShipmentForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Create Shipment"
      />
    </div>
  );
}

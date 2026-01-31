import { FormEvent, ChangeEvent } from 'react';
import { VehicleType } from '../types';

export interface ShipmentFormData {
  // Shipper
  shipperName: string;
  shipperPhone: string;
  shipperEmail: string;
  shipperAddress: string;
  shipperCity: string;
  shipperState: string;
  shipperZip: string;
  // Consignee
  consigneeName: string;
  consigneePhone: string;
  consigneeEmail: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeZip: string;
  // Cargo
  cargoDescription: string;
  weight: string;
  dimensions: string;
  vehicleType: VehicleType;
  // Financial & Dates
  estimatedRate: string;
  currency: string;
  pickupDate: string;
  estimatedDelivery: string;
  notes: string;
}

interface ShipmentFormProps {
  formData: ShipmentFormData;
  onChange: (field: keyof ShipmentFormData, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
}

export default function ShipmentForm({
  formData,
  onChange,
  onSubmit,
  loading = false,
  error,
  submitLabel = 'Create Shipment',
}: ShipmentFormProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.name as keyof ShipmentFormData, e.target.value);
  };

  const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Shipper Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipper Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipperName" className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shipperName"
              id="shipperName"
              required
              value={formData.shipperName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipperPhone" className={labelClass}>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="shipperPhone"
              id="shipperPhone"
              required
              value={formData.shipperPhone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipperEmail" className={labelClass}>
              Email
            </label>
            <input
              type="email"
              name="shipperEmail"
              id="shipperEmail"
              value={formData.shipperEmail}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipperAddress" className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shipperAddress"
              id="shipperAddress"
              required
              value={formData.shipperAddress}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipperCity" className={labelClass}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shipperCity"
              id="shipperCity"
              required
              value={formData.shipperCity}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipperState" className={labelClass}>
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shipperState"
              id="shipperState"
              required
              value={formData.shipperState}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipperZip" className={labelClass}>
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shipperZip"
              id="shipperZip"
              required
              value={formData.shipperZip}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Consignee Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Consignee Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="consigneeName" className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="consigneeName"
              id="consigneeName"
              required
              value={formData.consigneeName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="consigneePhone" className={labelClass}>
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="consigneePhone"
              id="consigneePhone"
              required
              value={formData.consigneePhone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="consigneeEmail" className={labelClass}>
              Email
            </label>
            <input
              type="email"
              name="consigneeEmail"
              id="consigneeEmail"
              value={formData.consigneeEmail}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="consigneeAddress" className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="consigneeAddress"
              id="consigneeAddress"
              required
              value={formData.consigneeAddress}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="consigneeCity" className={labelClass}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="consigneeCity"
              id="consigneeCity"
              required
              value={formData.consigneeCity}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="consigneeState" className={labelClass}>
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="consigneeState"
              id="consigneeState"
              required
              value={formData.consigneeState}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="consigneeZip" className={labelClass}>
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="consigneeZip"
              id="consigneeZip"
              required
              value={formData.consigneeZip}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Cargo Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cargo Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="cargoDescription" className={labelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="cargoDescription"
              id="cargoDescription"
              required
              rows={3}
              value={formData.cargoDescription}
              onChange={handleChange}
              className={inputClass}
              placeholder="Describe the cargo..."
            />
          </div>

          <div>
            <label htmlFor="weight" className={labelClass}>
              Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight"
              id="weight"
              required
              min="0"
              step="0.01"
              value={formData.weight}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="dimensions" className={labelClass}>
              Dimensions
            </label>
            <input
              type="text"
              name="dimensions"
              id="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., 2m x 1m x 1m"
            />
          </div>

          <div>
            <label htmlFor="vehicleType" className={labelClass}>
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleType"
              id="vehicleType"
              required
              value={formData.vehicleType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select vehicle type...</option>
              <option value={VehicleType.TRUCK}>Truck</option>
              <option value={VehicleType.VAN}>Van</option>
              <option value={VehicleType.TRAILER}>Trailer</option>
              <option value={VehicleType.FLATBED}>Flatbed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dates & Financial */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Dates & Financial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickupDate" className={labelClass}>
              Pickup Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="pickupDate"
              id="pickupDate"
              required
              value={formData.pickupDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="estimatedDelivery" className={labelClass}>
              Estimated Delivery <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="estimatedDelivery"
              id="estimatedDelivery"
              required
              value={formData.estimatedDelivery}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="estimatedRate" className={labelClass}>
              Estimated Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="estimatedRate"
              id="estimatedRate"
              required
              min="0"
              step="0.01"
              value={formData.estimatedRate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="currency" className={labelClass}>
              Currency <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="currency"
              id="currency"
              required
              value={formData.currency}
              onChange={handleChange}
              className={inputClass}
              placeholder="USD"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className={inputClass}
              placeholder="Additional notes or instructions..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

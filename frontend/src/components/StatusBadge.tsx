import { ShipmentStatus } from '../types';

interface StatusBadgeProps {
  status: ShipmentStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ShipmentStatus.ASSIGNED:
        return 'bg-blue-100 text-blue-800';
      case ShipmentStatus.PICKED_UP:
        return 'bg-indigo-100 text-indigo-800';
      case ShipmentStatus.IN_TRANSIT:
        return 'bg-purple-100 text-purple-800';
      case ShipmentStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case ShipmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

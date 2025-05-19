// src/components/dashboard/VehicleList.tsx
import { Link } from 'react-router-dom';
import { Vehicle, VehicleStatus } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Pagination from '../common/Pagination';
import React from 'react';

// Helper function to map size to status
const getStatusForSize = (size: Vehicle['size']): VehicleStatus => {
  switch (size) {
    case 'small': return 'available';
    case 'medium': return 'pending';
    case 'large': return 'rejected';
    default: return 'available';
  }
};

interface VehicleListProps {
  vehicles: Vehicle[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plate Number
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {vehicle.plate_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vehicle.vehicle_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <StatusBadge status={getStatusForSize(vehicle.size)}>
                  {vehicle.size}
                </StatusBadge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vehicle.attributes?.color || vehicle.color || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                <Link
                  to={`/vehicles/edit/${vehicle.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => onDelete(vehicle.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default VehicleList;
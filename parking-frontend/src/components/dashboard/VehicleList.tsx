// src/components/dashboard/VehicleList.tsx
import React from 'react';
import { Vehicle } from '../../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
  searchQuery,
  onSearchChange,
}) => {
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicles</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search vehicles..."
        className="mb-4 p-2 border rounded w-full"
      />
      {vehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Details</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="border p-2">{vehicle.id}</td>
                <td className="border p-2">
                  {/* Add vehicle details, e.g., vehicle.licensePlate */}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeleteClick(vehicle.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VehicleList;

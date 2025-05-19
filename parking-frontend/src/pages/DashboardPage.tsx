import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getVehicles, deleteVehicle } from '../services/vehicleService';
import { Vehicle } from '../types';
import VehicleList from '../components/dashboard/VehicleList';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export default function DashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles({ 
          page: currentPage, 
          limit: 10, 
          search: searchQuery 
        });
        setVehicles(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };

    fetchVehicles();
  }, [currentPage, searchQuery]);

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id);
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  return (
    <DashboardLayout title={`Welcome, ${user?.name}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <VehicleList
            vehicles={vehicles}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/vehicles/add"
                className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Add New Vehicle
              </Link>
              <Link
                to="/requests/new"
                className="block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Request Parking Slot
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Requests</h2>
            <p className="text-gray-500 text-sm">No recent requests</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
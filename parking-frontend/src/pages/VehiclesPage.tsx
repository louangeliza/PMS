// src/pages/VehiclesPage.tsx
import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import VehicleList from '../components/dashboard/VehicleList';
import { useVehicles } from '../hooks/useVehicles';
import React from 'react';
export default function VehiclesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { vehicles, totalPages, loading, error, deleteVehicle } = useVehicles({
    page: currentPage,
    search: searchQuery
  });

  const handleDelete = async (id: number) => {
    await deleteVehicle(id);
  };

  return (
    <DashboardLayout title="Vehicle Management" >
      {loading && <div>Loading vehicles...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <VehicleList
        vehicles={vehicles}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </DashboardLayout>
  );
}
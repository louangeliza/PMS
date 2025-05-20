// src/pages/VehiclesPage.tsx
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import VehicleList from '../components/dashboard/VehicleList';
import { useVehicles } from '../hooks/useVehicles';

export default function VehiclesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { vehicles, totalPages, loading, error, deleteVehicle } = useVehicles({
    page: currentPage,
    search: searchQuery,
  });

  return (
    <DashboardLayout title="Vehicle Management">
      {loading && <div>Loading vehicles...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <VehicleList
        vehicles={vehicles}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onDelete={deleteVehicle} // deleteVehicle will be updated to use id: string
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </DashboardLayout>
  );
}
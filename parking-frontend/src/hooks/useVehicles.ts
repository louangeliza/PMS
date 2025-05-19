// src/hooks/useVehicles.ts
import { useState, useEffect } from 'react';
import { getVehicles } from '../services/vehicleService';
import { Vehicle } from '../types';

interface UseVehiclesProps {
  page?: number;
  limit?: number;
  search?: string;
}

export function useVehicles({ page = 1, limit = 10, search = '' }: UseVehiclesProps = {}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await getVehicles({ page, limit, search });
        setVehicles(response.data);
        setTotalPages(response.pagination.totalPages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch vehicles');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [page, limit, search]);

  const deleteVehicle = async (id: number) => {
    try {
      await deleteVehicle(id);
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
    }
  };

  return { vehicles, totalPages, loading, error, deleteVehicle };
}
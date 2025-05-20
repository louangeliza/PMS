// src/hooks/useVehicles.ts
import { useState, useEffect } from 'react';
import { getVehicles, deleteVehicle as apiDeleteVehicle } from '../services/vehicleService';
import { Vehicle } from '../types';

interface UseVehiclesParams {
  page?: number;
  search?: string;
}

export function useVehicles(params: UseVehiclesParams) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await getVehicles({
          page: params.page,
          limit: 10,
          search: params.search,
        });
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
  }, [params.page, params.search]);

  const deleteVehicle = async (id: string) => {
    try {
      await apiDeleteVehicle(id); // id is string, matches vehicleService.ts
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
      throw err;
    }
  };

  return { vehicles, totalPages, loading, error, deleteVehicle };
}
// src/hooks/useVehicle.ts
import { useState, useEffect } from 'react';
import {
  getVehicle,
  updateVehicle as apiUpdateVehicle,
  deleteVehicle as apiDeleteVehicle,
} from '../services/vehicleService';
import { Vehicle } from '../types';

export function useVehicle(id?: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const vehicleData = await getVehicle(id); // id is string, matches service
        setVehicle(vehicleData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch vehicle');
        console.error('Error fetching vehicle:', err); // Removed stray hyphen
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      setLoading(true);
      const updatedVehicle = await apiUpdateVehicle(id, data); // id is string
      setVehicle(updatedVehicle);
      setError(null);
      return updatedVehicle;
    } catch (err) {
      setError('Failed to update vehicle');
      console.error('Error updating vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await apiDeleteVehicle(id); // id is string
      setVehicle(null); // Clear vehicle state after deletion
      setError(null);
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    vehicle,
    loading,
    error,
    updateVehicle,
    deleteVehicle,
  };
}
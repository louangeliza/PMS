// src/hooks/useVehicle.ts
import { useState, useEffect } from 'react';
import { getVehicle, updateVehicle as apiUpdateVehicle } from '../services/vehicleService';
import { Vehicle } from '../types';

export function useVehicle(id?: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const vehicle = await getVehicle(id); // Directly get the Vehicle object
        setVehicle(vehicle);
        setError(null);
      } catch (err) {
        setError('Failed to fetch vehicle');
        console.error('Error fetching vehicle:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      setLoading(true);
      const updatedVehicle = await apiUpdateVehicle(id, data); // Directly get the Vehicle object
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

  return { vehicle, loading, error, updateVehicle };
}
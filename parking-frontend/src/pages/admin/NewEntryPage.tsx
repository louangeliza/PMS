import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createParkingEntry, getParkings } from '../services/parkingService';
import { CreateParkingEntryDTO, Parking } from '../types';
import { toast } from 'react-hot-toast';

const NewEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateParkingEntryDTO>();

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const data = await getParkings();
        setParkings(data);
      } catch (error) {
        toast.error('Failed to fetch parking facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchParkings();
  }, []);

  const onSubmit = async (data: CreateParkingEntryDTO) => {
    try {
      await createParkingEntry(data);
      toast.success('Parking entry recorded successfully');
      navigate('/admin/active-entries');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record parking entry';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Record New Parking Entry</h1>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="parking_id" className="block text-sm font-medium text-gray-700">
              Parking Facility
            </label>
            <select
              id="parking_id"
              {...register('parking_id', {
                required: 'Please select a parking facility',
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.parking_id ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select a parking facility</option>
              {parkings.map((parking) => (
                <option key={parking.id} value={parking.id}>
                  {parking.name} - {parking.location} (Available: {parking.available_spaces}/{parking.total_spaces})
                </option>
              ))}
            </select>
            {errors.parking_id && (
              <p className="mt-1 text-sm text-red-600">{errors.parking_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="vehicle_number" className="block text-sm font-medium text-gray-700">
              Vehicle Number
            </label>
            <input
              type="text"
              id="vehicle_number"
              {...register('vehicle_number', {
                required: 'Vehicle number is required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Vehicle number must contain only uppercase letters and numbers',
                },
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.vehicle_number ? 'border-red-500' : ''
              }`}
            />
            {errors.vehicle_number && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicle_number.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700">
              Vehicle Type
            </label>
            <select
              id="vehicle_type"
              {...register('vehicle_type', {
                required: 'Please select a vehicle type',
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.vehicle_type ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select a vehicle type</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
            </select>
            {errors.vehicle_type && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicle_type.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Recording...' : 'Record Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryPage; 
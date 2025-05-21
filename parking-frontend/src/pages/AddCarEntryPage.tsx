import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createCarEntry, getParkingLots } from '../services/api';
import { Parking } from '../types';
import { toast } from 'react-hot-toast';

const AddCarEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await getParkingLots();
        console.log('Parking lots response:', response);
        const lots = Array.isArray(response) ? response : (response.data || []);
        // Filter out parking lots with no available spaces
        const availableLots = lots.filter((lot: Parking) => lot.available_spaces > 0);
        setParkingLots(availableLots);
      } catch (error) {
        console.error('Error fetching parking lots:', error);
        toast.error('Failed to load parking facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      // Format the data according to the backend's expectations
      const formattedData = {
        plateNo: data.plateNo.toUpperCase(),
        parkingCode: data.parkingCode,
        entryTime: new Date().toISOString() // Use current time for entry
      };

      console.log('Submitting car entry with data:', formattedData);
      const response = await createCarEntry(formattedData);
      console.log('Car entry created successfully:', response);
      toast.success('Car entry recorded successfully');
      navigate('/admin/entries/active');
    } catch (error: any) {
      console.error('Error creating car entry:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to record car entry';
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

  if (parkingLots.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Record New Car Entry</h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <p>No parking facilities are currently available.</p>
            <p>Please try again later or contact the administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Record New Car Entry</h1>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="parkingCode" className="block text-sm font-medium text-gray-700">
              Parking Facility
            </label>
            <select
              id="parkingCode"
              {...register('parkingCode', {
                required: 'Please select a parking facility',
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.parkingCode ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select a parking facility</option>
              {parkingLots.map((lot) => (
                <option key={lot.id} value={lot.code}>
                  {lot.name} - {lot.location} (Available: {lot.available_spaces}/{lot.total_spaces})
                </option>
              ))}
            </select>
            {errors.parkingCode && (
              <p className="mt-1 text-sm text-red-600">{errors.parkingCode.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="plateNo" className="block text-sm font-medium text-gray-700">
              Vehicle Number
            </label>
            <input
              type="text"
              id="plateNo"
              {...register('plateNo', {
                required: 'Vehicle number is required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Vehicle number must contain only uppercase letters and numbers',
                },
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.plateNo ? 'border-red-500' : ''
              }`}
            />
            {errors.plateNo && (
              <p className="mt-1 text-sm text-red-600">{errors.plateNo.message as string}</p>
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

export default AddCarEntryPage; 
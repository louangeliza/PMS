import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createParkingLot } from '../../services/api';
import { CreateParkingDTO } from '../../types';
import { toast } from 'react-hot-toast';

const AddParkingLotPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateParkingDTO>();

  const onSubmit = async (data: CreateParkingDTO) => {
    try {
      await createParkingLot(data);
      toast.success('Parking lot created successfully');
      navigate('/admin/parking-lots');
    } catch (error: any) {
      console.error('Error creating parking lot:', error);
      toast.error(error.response?.data?.error || 'Failed to create parking lot');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Parking Lot</h1>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Parking Lot Code
            </label>
            <input
              type="text"
              id="code"
              {...register('code', {
                required: 'Parking lot code is required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Code must contain only uppercase letters and numbers',
                },
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : ''
              }`}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Parking Lot Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Parking lot name is required' })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="total_spaces" className="block text-sm font-medium text-gray-700">
              Total Parking Spaces
            </label>
            <input
              type="number"
              id="total_spaces"
              min="1"
              {...register('total_spaces', {
                required: 'Total spaces is required',
                min: {
                  value: 1,
                  message: 'Total spaces must be at least 1',
                },
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.total_spaces ? 'border-red-500' : ''
              }`}
            />
            {errors.total_spaces && (
              <p className="mt-1 text-sm text-red-600">{errors.total_spaces.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              {...register('location', { required: 'Location is required' })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : ''
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="feePerHour" className="block text-sm font-medium text-gray-700">
              Fee per Hour
            </label>
            <input
              type="number"
              id="feePerHour"
              step="0.01"
              min="0"
              {...register('feePerHour', {
                required: 'Fee per hour is required',
                min: {
                  value: 0,
                  message: 'Fee per hour must be non-negative',
                },
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.feePerHour ? 'border-red-500' : ''
              }`}
            />
            {errors.feePerHour && (
              <p className="mt-1 text-sm text-red-600">{errors.feePerHour.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/parking-lots')}
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
              {isSubmitting ? 'Creating...' : 'Create Parking Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParkingLotPage; 
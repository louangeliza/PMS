import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicle } from '../hooks/useVehicle';
import React from 'react';

type FormData = {
  plate_number: string;
  vehicle_type: string;
  size: 'small' | 'medium' | 'large';
  color?: string;
};

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const { vehicle, loading, error, updateVehicle } = useVehicle(id); // Added updateVehicle
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      plate_number: vehicle?.plate_number || '',
      vehicle_type: vehicle?.vehicle_type || '',
      size: vehicle?.size || 'small',
      color: vehicle?.color || '',
    },
  });
  const navigate = useNavigate();

  if (loading) return <DashboardLayout title="Edit Vehicle"><div>Loading...</div></DashboardLayout>;
  if (error) return <DashboardLayout title="Edit Vehicle"><div className="text-red-500">{error}</div></DashboardLayout>;
  if (!vehicle) return <DashboardLayout title="Edit Vehicle"><div>Vehicle not found</div></DashboardLayout>;

  const onSubmit = async (data: FormData) => {
    try {
      await updateVehicle(id!, data); // Use updateVehicle from useVehicle hook
      navigate('/vehicles');
    } catch (err) {
      console.error('Failed to update vehicle:', err);
    }
  };

  return (
    <DashboardLayout title="Edit Vehicle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
        <div>
          <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700">
            Plate Number
          </label>
          <input
            {...register('plate_number', { required: 'Plate number is required' })}
            id="plate_number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.plate_number && <p className="mt-2 text-sm text-red-600">{errors.plate_number.message}</p>}
        </div>
        <div>
          <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700">
            Vehicle Type
          </label>
          <select
            {...register('vehicle_type', { required: 'Vehicle type is required' })}
            id="vehicle_type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
          {errors.vehicle_type && <p className="mt-2 text-sm text-red-600">{errors.vehicle_type.message}</p>}
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Size
          </label>
          <select
            {...register('size', { required: 'Size is required' })}
            id="size"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          {errors.size && <p className="mt-2 text-sm text-red-600">{errors.size.message}</p>}
        </div>
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color (Optional)
          </label>
          <input
            {...register('color')}
            id="color"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Update
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
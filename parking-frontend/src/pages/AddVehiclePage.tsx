// src/pages/AddVehiclePage.tsx
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { createVehicle } from '../services/vehicleService';
import { CreateVehicleDTO } from '../types';

export default function AddVehiclePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateVehicleDTO>();
  const navigate = useNavigate();

  const onSubmit = async (data: CreateVehicleDTO) => {
    try {
      await createVehicle(data);
      navigate('/vehicles');
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  return (
    <DashboardLayout title="Add Vehicle">
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
            Save
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

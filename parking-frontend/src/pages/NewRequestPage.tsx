// src/pages/NewRequestPage.tsx
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { createRequest } from '../services/requestService';
import { toast } from 'react-hot-toast';

type FormData = {
  vehicle_id: string;
  start_time: string;
  end_time: string;
  special_requests?: string;
  status: 'pending' | 'approved' | 'rejected'; // Added status
};

export default function NewRequestPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      status: 'pending', // Set default status
    },
  });
  const { vehicles, loading, error } = useVehicles({});
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      await createRequest({
        vehicle_id: data.vehicle_id,
        start_time: data.start_time,
        end_time: data.end_time,
        special_requests: data.special_requests,
        status: data.status, // Include status
      });
      toast.success('Request submitted successfully');
      navigate('/requests');
    } catch (err) {
      toast.error('Failed to submit request');
      console.error('Request submission error:', err);
    }
  };

  if (loading) return <DashboardLayout title="New Request"><div>Loading vehicles...</div></DashboardLayout>;
  if (error) return <DashboardLayout title="New Request"><div className="text-red-500">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout title="New Parking Request">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
        <div>
          <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700">
            Select Vehicle
          </label>
          <select
            {...register('vehicle_id', { required: 'Please select a vehicle' })}
            id="vehicle_id"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate_number} ({vehicle.vehicle_type})
              </option>
            ))}
          </select>
          {errors.vehicle_id && <p className="mt-2 text-sm text-red-600">{errors.vehicle_id.message}</p>}
        </div>
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            {...register('start_time', { required: 'Start time is required' })}
            id="start_time"
            type="datetime-local"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.start_time && <p className="mt-2 text-sm text-red-600">{errors.start_time.message}</p>}
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            {...register('end_time', { required: 'End time is required' })}
            id="end_time"
            type="datetime-local"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.end_time && <p className="mt-2 text-sm text-red-600">{errors.end_time.message}</p>}
        </div>
        <div>
          <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700">
            Special Requests (Optional)
          </label>
          <textarea
            {...register('special_requests')}
            id="special_requests"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        {/* Hidden input for status to satisfy form type, though it's not user-editable */}
        <input
          type="hidden"
          {...register('status')}
        />
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Submit Request
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

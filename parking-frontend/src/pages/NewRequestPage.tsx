import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

type FormData = {
  vehicle_id: string;
  start_time: string;
  end_time: string;
  special_requests?: string;
};

export default function NewRequestPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { vehicles, loading, error } = useVehicles({});
  const navigate = useNavigate();

  const onSubmit = (data: FormData) => {
    console.log(data);
    navigate('/requests');
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

        {/* Other form fields... */}

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
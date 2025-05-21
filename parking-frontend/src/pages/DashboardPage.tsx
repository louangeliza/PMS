import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParkings } from '../services/parkingService';
import { Parking } from '../types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await getParkings({ search: searchTerm });
        setParkings(response.data);
      } catch (error) {
        toast.error('Failed to load parking facilities');
        console.error('Parking data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkings();
  }, [searchTerm]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parking Facilities</h1>
        <div className="flex space-x-4">
          <Link
            to="/vehicles/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Vehicle
          </Link>
          <Link
            to="/requests/new"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            New Request
          </Link>
        </div>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search parking facilities..."
        className="mb-4 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Spaces
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parkings.map((parking) => (
              <tr key={parking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parking.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parking.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parking.available_spaces}/{parking.total_spaces}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => navigate(`/requests/new?parkingId=${parking.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Request
                  </button>
                  <Link
                    to={`/vehicles/add?parkingId=${parking.id}`}
                    className="text-green-600 hover:text-green-900"
                  >
                    Add Vehicle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Total Parkings</h3>
          <p className="text-2xl font-bold">{parkings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Available Spaces</h3>
          <p className="text-2xl font-bold">
            {parkings.reduce((sum, parking) => sum + parking.available_spaces, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Total Capacity</h3>
          <p className="text-2xl font-bold">
            {parkings.reduce((sum, parking) => sum + parking.total_spaces, 0)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
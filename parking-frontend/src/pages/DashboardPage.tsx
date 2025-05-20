// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getParkings } from '../services/parkingService';
import { Parking } from '../types';
import { toast } from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Parking</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by location or parking name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Parking List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkings.map((parking) => (
          <div key={parking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{parking.name}</h2>
              <p className="text-gray-600 mb-4">{parking.location}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Available Spaces</p>
                  <p className="text-lg font-semibold">{parking.available_spaces}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rate per Hour</p>
                  <p className="text-lg font-semibold">${parking.charge_per_hour}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Parking Code: {parking.code}</span>
                <button
                  onClick={() => {
                    // Handle parking selection
                    toast.success(`Selected ${parking.name}`);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {parkings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No parking facilities found</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

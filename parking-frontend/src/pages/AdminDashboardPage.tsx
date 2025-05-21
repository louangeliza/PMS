import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getParkingLots, getActiveEntries, getRecentBills } from '../services/api';
import { Parking, ParkingEntry, ParkingBill } from '../types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import axios from 'axios';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [activeEntries, setActiveEntries] = useState<ParkingEntry[]>([]);
  const [recentBills, setRecentBills] = useState<ParkingBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        console.log('Fetching admin dashboard data...');
        
        // Fetch parking lots
        try {
          console.log('Fetching parking lots...');
          const parkingsData = await getParkingLots();
          console.log('Parking data:', parkingsData);
          // Handle both array and object with data property
          const lots = Array.isArray(parkingsData) ? parkingsData : (parkingsData.data || []);
          setParkings(lots);
        } catch (error) {
          console.error('Error fetching parking lots:', error);
          toast.error('Failed to load parking facilities');
        }

        // Fetch active entries
        try {
          console.log('Fetching active entries...');
          const entriesData = await getActiveEntries();
          console.log('Raw active entries data from API:', entriesData);
          const entries = Array.isArray(entriesData) ? entriesData : (entriesData.data || []);
          console.log('Processed active entries data:', entries);
          setActiveEntries(entries);
        } catch (error) {
          console.error('Error fetching active entries:', error);
          toast.error('Failed to load active entries');
        }

        // Fetch recent bills
        try {
          console.log('Fetching recent bills...');
          const billsData = await getRecentBills();
          console.log('Bills data:', billsData);
          // Handle both array and object with data property
          const bills = Array.isArray(billsData) ? billsData : (billsData.data || []);
          setRecentBills(bills);
        } catch (error) {
          console.error('Error fetching recent bills:', error);
          toast.error('Failed to load recent bills');
        }

      } catch (error) {
        console.error('Error in fetchDashboardData:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error('Please log in to view dashboard data');
          } else {
            toast.error(error.response?.data?.message || 'Failed to load dashboard data');
          }
        } else {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Add effect to log state changes
  useEffect(() => {
    console.log('Active Entries state updated:', activeEntries);
    console.log('Recent Bills state updated:', recentBills);
  }, [parkings]);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.lastname}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/parking/new"
            className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-semibold text-blue-700">Add New Parking</h3>
            <p className="text-sm text-gray-600 mt-2">Register a new parking facility</p>
          </Link>

          <Link
            to="/admin/entries/new"
            className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors"
          >
            <h3 className="font-semibold text-green-700">New Entry</h3>
            <p className="text-sm text-gray-600 mt-2">Record a new vehicle entry</p>
          </Link>

          <Link
            to="/admin/entries/active"
            className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-semibold text-purple-700">Active Entries</h3>
            <p className="text-sm text-gray-600 mt-2">View and manage active entries</p>
          </Link>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Parking Facilities</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Spaces</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate/Hour</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parkings && parkings.length > 0 ? (
                  parkings.map((parking) => (
                    <tr key={parking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{parking.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{parking.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parking.available_spaces ?? 0} / {parking.total_spaces ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${typeof parking.feePerHour === 'number' ? parking.feePerHour.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No parking facilities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Active Entries</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeEntries && activeEntries.length > 0 ? (
                  activeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.plate_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(entry.entry_date_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{entry.parking_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/entries/${entry.id}/complete`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Complete Entry
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No active entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Bills</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBills && recentBills.length > 0 ? (
                  recentBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{bill.ticket_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{bill.plate_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeof bill.duration_hours === 'number' ? `${bill.duration_hours} hours` : '0 hours'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${typeof bill.total_amount === 'number' ? bill.total_amount.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No recent bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
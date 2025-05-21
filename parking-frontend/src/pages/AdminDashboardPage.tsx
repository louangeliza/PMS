import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getParkings, getParkingEntries, getParkingBills } from '../services/parkingService';
import { Parking, ParkingEntry, ParkingBill } from '../types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [activeEntries, setActiveEntries] = useState<ParkingEntry[]>([]);
  const [recentBills, setRecentBills] = useState<ParkingBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [parkingsData, entriesData, billsData] = await Promise.all([
          getParkings({ limit: 5 }),
          getParkingEntries({ status: 'active', limit: 5 }),
          getParkingBills({ limit: 5 }),
        ]);

        setParkings(parkingsData.data);
        setActiveEntries(entriesData);
        setRecentBills(billsData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
                {parkings.map((parking) => (
                  <tr key={parking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{parking.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{parking.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {parking.available_spaces} / {parking.total_spaces}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${parking.charge_per_hour.toFixed(2)}</td>
                  </tr>
                ))}
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
                {activeEntries.map((entry) => (
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
                ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{bill.ticket_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bill.plate_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bill.duration_hours.toFixed(1)} hours</td>
                    <td className="px-6 py-4 whitespace-nowrap">${bill.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
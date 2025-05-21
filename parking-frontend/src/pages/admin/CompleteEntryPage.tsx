import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getParkingEntry, completeParkingEntry, getParkings } from '../../services/parkingService';
import { ParkingEntry, ParkingBill, Parking } from '../../types';
import { toast } from 'react-hot-toast';

const CompleteEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const [entry, setEntry] = useState<ParkingEntry | null>(null);
  const [bill, setBill] = useState<ParkingBill | null>(null);
  const [parking, setParking] = useState<Parking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) return;

      try {
        const entryIdNum = parseInt(entryId, 10);
        if (isNaN(entryIdNum)) {
          throw new Error('Invalid entry ID');
        }
        const [entryData, parkingsData] = await Promise.all([
          getParkingEntry(entryIdNum),
          getParkings(),
        ]);
        setEntry(entryData);
        const parkingData = parkingsData.data.find((p: Parking) => p.code === entryData.parking_code);
        setParking(parkingData || null);
      } catch (error) {
        toast.error('Failed to fetch parking entry or parking details');
        navigate('/admin/active-entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, navigate]);

  const handleCompleteEntry = async () => {
    if (!entryId) return;

    setSubmitting(true);
    try {
      const entryIdNum = parseInt(entryId, 10);
      if (isNaN(entryIdNum)) {
        throw new Error('Invalid entry ID');
      }
      const billData = await completeParkingEntry(entryIdNum);
      setBill(billData);
      toast.success('Parking entry completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete parking entry';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!entry || !parking) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Entry or parking details not found.</p>
      </div>
    );
  }

  const calculateDuration = () => {
    const entryTime = new Date(entry.entry_date_time);
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    return durationHours;
  };

  const calculateCharge = () => {
    const duration = calculateDuration();
    return duration * parking.charge_per_hour;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Complete Parking Entry</h1>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Entry Details</h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Entry ID</p>
                <p className="text-sm font-medium">{entry.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Parking Facility</p>
                <p className="text-sm font-medium">{parking.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle Number</p>
                <p className="text-sm font-medium">{entry.plate_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Entry Time</p>
                <p className="text-sm font-medium">{new Date(entry.entry_date_time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-sm font-medium">{calculateDuration()} hours</p>
              </div>
            </div>
          </div>

          {bill ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700">Bill Details</h2>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bill ID</p>
                  <p className="text-sm font-medium">{bill.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium">${bill.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exit Time</p>
                  <p className="text-sm font-medium">{new Date(bill.exit_date_time).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700">Estimated Charge</h2>
              <p className="text-2xl font-bold text-blue-600">${calculateCharge().toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Based on {calculateDuration()} hours at ${parking.charge_per_hour}/hour
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => navigate('/admin/active-entries')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            {!bill && (
              <button
                onClick={handleCompleteEntry}
                disabled={submitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Completing...' : 'Complete Entry'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteEntryPage;
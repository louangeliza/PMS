// src/hooks/useRequests.ts
import { useState, useEffect } from 'react';
import { getRequests } from '../services/requestService';
import { Request, PaginatedResponse } from '../types';

interface UseRequestsProps {
  page?: number;
  limit?: number;
}

export function useRequests({ page = 1, limit = 10 }: UseRequestsProps = {}) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await getRequests({ page, limit });
        setRequests(response.data);
        setTotalPages(response.pagination.totalPages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch requests');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page, limit]);

  return { requests, totalPages, loading, error };
}
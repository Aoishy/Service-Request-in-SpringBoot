
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  IServiceRequest,
  IProgressLog,
  CreateRequestInput,
  ListRequestsQuery,
  PaginatedResult,
  ApiResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const requestsApi = {
  // =========================================================
  // CREATE REQUEST
  // =========================================================

  createRequest: async (
    input: CreateRequestInput
  ): Promise<IServiceRequest> => {
    const res =
      await api.post<
        ApiResponse<{ request: IServiceRequest }>
      >('/requests', input);

    return res.data.data.request;
  },

  // =========================================================
  // GET ALL REQUESTS
  // =========================================================

  getRequests: async (
    query: ListRequestsQuery = {}
  ): Promise<PaginatedResult<IServiceRequest>> => {
    const params = new URLSearchParams();

    if (query.page) {
      params.append('page', String(query.page));
    }

    if (query.limit) {
      params.append('limit', String(query.limit));
    }

    if (query.status) {
      params.append('status', query.status);
    }

    if (query.priority) {
      params.append('priority', query.priority);
    }

    if (query.submittedBy) {
      params.append('submittedBy', query.submittedBy);
    }

    if (query.search) {
      params.append('search', query.search);
    }

    if (query.sortBy) {
      params.append('sortBy', query.sortBy);
    }

    if (query.sortOrder) {
      params.append('sortOrder', query.sortOrder);
    }

    const res =
      await api.get<
        ApiResponse<{
          requests: IServiceRequest[];
          pagination: PaginatedResult<IServiceRequest>['pagination'];
        }>
      >(`/requests?${params.toString()}`);

    return {
      items: res.data.data.requests,
      pagination: res.data.data.pagination,
    };
  },

  // =========================================================
  // GET REQUEST BY ID
  // =========================================================

  getRequestById: async (
    id: number
  ): Promise<IServiceRequest> => {
    const res =
      await api.get<
        ApiResponse<{ request: IServiceRequest }>
      >(`/requests/${id}`);

    return res.data.data.request;
  },

  // =========================================================
  // CANCEL REQUEST
  // =========================================================

  cancelRequest: async (
    id: number
  ): Promise<IServiceRequest> => {
    const res =
      await api.patch<
        ApiResponse<{ request: IServiceRequest }>
      >(`/requests/${id}/cancel`);

    return res.data.data.request;
  },

  // =========================================================
  // DELETE REQUEST
  // =========================================================

  deleteRequest: async (
    id: number
  ): Promise<void> => {
    await api.delete(`/requests/${id}`);
  },

  // =========================================================
  // GET PROGRESS LOGS
  // =========================================================

  getProgressLogs: async (
    id: number
  ): Promise<IProgressLog[]> => {
    const res =
      await api.get<
        ApiResponse<{ logs: IProgressLog[] }>
      >(`/requests/${id}/progress`);

    return res.data.data.logs;
  },
};

// =========================================================
// QUERY KEYS
// =========================================================

export const REQUESTS_QUERY_KEY = ['requests'];

// =========================================================
// GET REQUESTS HOOK
// =========================================================

export function useRequestsQuery(
  query: ListRequestsQuery = {}
) {
  return useQuery({
    queryKey: [...REQUESTS_QUERY_KEY, query],
    queryFn: () => requestsApi.getRequests(query),
    staleTime: 10_000,
  });
}

// =========================================================
// GET REQUEST DETAIL HOOK
// =========================================================

export function useRequestDetailQuery(
  id?: number
) {
  return useQuery({
    queryKey: ['request', id],

    queryFn: () =>
      id !== undefined
        ? requestsApi.getRequestById(id)
        : null,

    enabled: id !== undefined,
  });
}

// =========================================================
// GET PROGRESS LOGS HOOK
// =========================================================

export function useProgressLogsQuery(
  id?: number
) {
  return useQuery({
    queryKey: ['progress-logs', id],

    queryFn: () =>
      id !== undefined
        ? requestsApi.getProgressLogs(id)
        : [],

    enabled: id !== undefined,
  });
}

// =========================================================
// CREATE REQUEST MUTATION
// =========================================================

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsApi.createRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_QUERY_KEY,
      });
    },
  });
}

// =========================================================
// CANCEL REQUEST MUTATION
// =========================================================

export function useCancelRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsApi.cancelRequest,

    onSuccess: (updatedReq) => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_QUERY_KEY,
      });

      /*
       * Spring Boot uses "id"
       * instead of MongoDB's "_id".
       */
      queryClient.setQueryData(
        ['request', updatedReq.id],
        updatedReq
      );
    },
  });
}

// =========================================================
// DELETE REQUEST MUTATION
// =========================================================

export function useDeleteRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsApi.deleteRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REQUESTS_QUERY_KEY,
      });
    },
  });
}

export type RequestStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type RequestPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type UserRole =
  | 'operator'
  | 'supervisor';

export interface IServiceRequest {
  id: number;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  progress: number;
  currentStage?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface IProgressLog {
  id: number;
  requestId: number;
  stage: string;
  message: string;
  progress: number;
  timestamp: string;
  createdAt: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  priority: RequestPriority;
  submittedBy: string;
}

export interface ListRequestsQuery {
  page?: number;
  limit?: number;
  status?: RequestStatus | '';
  priority?: RequestPriority | '';
  submittedBy?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

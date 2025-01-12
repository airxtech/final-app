export interface ErrorResponse {
    error: string;
    details?: string;
  }
  
  export interface SuccessResponse<T> {
    success: true;
    data: T;
  }
  
  export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export interface ApiResponse<T = any> {
    data: T | null;
    status: 'success' | 'error';
    message: string;
  }
  
  export const successResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => {
    return {
      data,
      status: 'success',
      message,
    };
  };
  
  export const errorResponse = (message = 'Something went wrong', data: any = null): ApiResponse => {
    return {
      data,
      status: 'error',
      message,
    };
  };
  
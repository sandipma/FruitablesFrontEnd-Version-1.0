export class ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data || null;
  }
}
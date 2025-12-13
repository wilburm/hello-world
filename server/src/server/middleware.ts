import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void req;
  void next;
  const statusCode = getStatusCode(error);
  const message = error.message || 'Internal Server Error';

  const response: ApiErrorResponse = {
    error: getErrorName(statusCode),
    message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void next;
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
};

function getStatusCode(error: Error): number {
  const message = error.message.toLowerCase();

  if (message.includes('invalid api key')) {
    return 401;
  }
  if (message.includes('currency not found') || message.includes('invalid currency')) {
    return 400;
  }
  if (message.includes('date range') || message.includes('query parameter')) {
    return 400;
  }
  if (message.includes('timeout') || message.includes('network error')) {
    return 503;
  }

  return 500;
}

function getErrorName(statusCode: number): string {
  const statusMap: { [key: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    404: 'Not Found',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };

  return statusMap[statusCode] || 'Error';
}

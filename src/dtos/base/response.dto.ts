import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from 'src/types/base/error-code.type';

export interface ResponseData<T> {
  statusCode: HttpStatus;
  message?: string;
  data?: any;
  errorCode?: ErrorCode;
}

export interface ErrorResponseData {
  errorCode: ErrorCode;
  message?: string;
}

export interface SuccessResponseData<T> {
  message?: string;
  data?: T;
}

export class Response<T> implements ResponseData<T> {
  statusCode: HttpStatus;
  data?: any;
  errorCode?: ErrorCode;
  message?: string;

  constructor(response: ResponseData<T>) {
    this.statusCode = response.statusCode;
    this.data = response.data;
    this.errorCode = response.errorCode;
    this.message = response.message;
  }

  static success<T>(response: SuccessResponseData<T>): Response<T> {
    return new Response({ statusCode: HttpStatus.OK, data: response.data, message: response.message });
  }

  static error<T>(error: ErrorResponseData): Response<T> {
    if (!Object.values(ErrorCode).includes(error.errorCode)) {
      error.errorCode = ErrorCode.SYSTEM_ERROR;
    }
    return new Response({
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: error.errorCode,
      message: error.message,
    });
  }
}

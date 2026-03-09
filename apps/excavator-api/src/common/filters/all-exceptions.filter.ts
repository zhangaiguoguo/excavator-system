import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        message = resp.message || resp.error || message;
      }
      
      code = status;
    } else {
      console.error(exception);
      code = 500;
      message = 'Internal server error';
    }

    // Ruoyi style: return HTTP 200 for known errors (business logic), 
    // but keep HTTP 500 for unhandled exceptions if you want to signal "Service Error".
    // User said: "除了服务报错" (Except service error). 
    // So if it's 500, we might want to return 500 status code?
    // Or maybe "Except service error" means "Service error still returns 500 status"?
    // Let's assume:
    // 4xx errors -> HTTP 200, Body { code: 4xx, msg: ... }
    // 5xx errors -> HTTP 500, Body { code: 500, msg: ... }

    const httpStatus = code >= 500 ? 500 : 200;

    console.log(`[${request.method}] ${request.url} ${httpStatus} ${message}`);

    response.status(httpStatus).json({
      code: code,
      msg: message,
      data: null,
    });
  }
}

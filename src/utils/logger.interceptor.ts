import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const requestObject = ctx.getRequest<Request>();
    console.log(`Request method : ${requestObject.method}
Request URL : ${requestObject.url}  
${requestObject.body ? `Request Body : ${JSON.stringify(requestObject.body)}\n` : ''}${!requestObject.params ? "" : `Request Params : ${JSON.stringify(requestObject.params)}\n` }Request Handler Function : ${context.getHandler().name}`);
    return next.handle();
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiSuccessResponseDto } from '@project/globals';

/*
  Handles all responses,
  makes sure that response body follows common format.
*/

@Injectable()
export class AllResponsesInterceptor<T>
  implements NestInterceptor<T, IApiSuccessResponseDto>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiSuccessResponseDto> {
    const response = context.switchToHttp().getResponse();

    const transformResponseBody = (data: any): IApiSuccessResponseDto => {
      return {
        success: true,
        statusCode: Number(response.statusCode),
        data: data,
      };
    };

    return next.handle().pipe(map(transformResponseBody));
  }
}

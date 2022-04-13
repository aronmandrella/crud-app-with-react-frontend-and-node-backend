import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IApiErrorResponseDto, DtoAssertionError } from '@project/globals';
import { BadRequestError } from './helpers';

/*
  Handles all errors,
  makes sure that response body follows common format.
*/

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private prepareErrorResponseBody(
    exception: unknown,
  ): Omit<IApiErrorResponseDto, 'success'> {
    // Errors like 'not found' and so on.
    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        error: {
          name: exception.name,
          message: exception.message,
        },
      };
    }

    // Errors thrown if dto shape is invalid or something about data is wrong
    else if (
      exception instanceof DtoAssertionError ||
      exception instanceof BadRequestError
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          /*
            NOTE:
            This string is not used for anything, but if frontend
            would like to handle various errors differently
            there could be some enum with all possibilities to
            avoid inline "magic string".
          */
          name: 'BadRequest',
          message: exception.message,
        },
      };
    }

    // Unexpected errors
    else {
      // This shouldn't happen so it's worth some logging
      this.logger.error(String(exception));
      console.error(exception);

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          name: 'InternalServerException',
          message: 'Internal server error',
        },
      };
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const { statusCode, error } = this.prepareErrorResponseBody(exception);
    const responseBody: IApiErrorResponseDto = {
      success: false,
      statusCode,
      error,
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
}

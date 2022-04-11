import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  IApiErrorResponseDto,
  IApiSuccessResponseDto,
  assertApiErrorResponseDto,
  assertApiSuccessResponseDto,
} from "@project/globals";

/*
  Little helper for managing requests responses / errors.
  It makes sure that everything is type safe, and that no error will be thrown.
*/

/* -------------------------------------------------------------------------- */
/*                                 INTERFACES                                 */
/* -------------------------------------------------------------------------- */

interface ISendApiRequestConfig<T> {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  data?: any;
  // Should return validated response data or throw error.
  responseDataValidator: (data: any) => T | never;
}

interface ISendApiRequestConfigWithoutMethod<T> extends Omit<ISendApiRequestConfig<T>, "method"> {}

export interface IGenericApiSuccessResponseDto<T> extends Omit<IApiSuccessResponseDto, "data"> {
  data: T;
}

export type { IApiErrorResponseDto } from "@project/globals";
export type IGenericApiResponseDto<T> = IGenericApiSuccessResponseDto<T> | IApiErrorResponseDto;

/* -------------------------------------------------------------------------- */
/*                                    CLASS                                   */
/* -------------------------------------------------------------------------- */

class ApiClient {
  axiosInstance!: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.axiosInstance = axios.create(config);
  }

  private parseApiRequestException(exception: any): IApiErrorResponseDto {
    if (axios.isAxiosError(exception) && exception.response) {
      const { data: responseBody } = exception.response;

      try {
        assertApiErrorResponseDto(responseBody);
        return responseBody;
      } catch (e) {
        exception = e;
      }
    }

    exception = exception || {};

    return {
      success: false,
      statusCode: NaN,
      error: {
        name: exception?.name || "UnexpectedError",
        message: exception?.message || "Unexpected error",
      },
    };
  }

  private async sendApiRequest<T>(
    config: ISendApiRequestConfig<T>
  ): Promise<IGenericApiResponseDto<T>> {
    try {
      const { url, method, data, responseDataValidator } = config;

      const assertGenericApiSuccessResponseDto: (
        responseBody: unknown
      ) => asserts responseBody is IGenericApiSuccessResponseDto<T> = (responseBody) => {
        /*
          NOTE:
          Instead of 'if (true)' there could be 'if (process.env.NODE_ENV !== "development")'.
          Currently it validates every success response (to ensure types), but since it has some impact
          on performance (especially if it validates big arrays), trusting that data always will
          be fine, would probably be a good-enough approach too since backend is in the same repo.
        */
        if (true) {
          assertApiSuccessResponseDto(responseBody);
          responseDataValidator(responseBody.data);
        }
      };

      const { data: responseBody } = await this.axiosInstance(url, { method, data });
      assertGenericApiSuccessResponseDto(responseBody);

      return responseBody;
    } catch (exception: any) {
      return await this.parseApiRequestException(exception);
    }
  }

  /* ----------------------------- PUBLIC METHODS ----------------------------- */

  async get<T>(config: ISendApiRequestConfigWithoutMethod<T>) {
    return this.sendApiRequest({ method: "GET", ...config });
  }

  async post<T>(config: ISendApiRequestConfigWithoutMethod<T>) {
    return this.sendApiRequest({ method: "POST", ...config });
  }

  async patch<T>(config: ISendApiRequestConfigWithoutMethod<T>) {
    return this.sendApiRequest({ method: "PATCH", ...config });
  }

  async delete<T>(config: ISendApiRequestConfigWithoutMethod<T>) {
    return this.sendApiRequest({ method: "DELETE", ...config });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  INSTANCE                                  */
/* -------------------------------------------------------------------------- */

export const apiClientInstance = new ApiClient({
  timeout: 5000,
  /*
    TODO:
    Read backend url from .env file.
  */
  baseURL: "http://localhost:3001",
});

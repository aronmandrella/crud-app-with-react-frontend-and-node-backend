import {
  assertApiErrorResponseDto,
  assertApiSuccessResponseDto,
  IApiErrorResponseDto,
  IApiSuccessResponseDto,
} from "./api-response.dto";
import { DtoAssertionError } from "../helpers";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

export const runDtoAssertFnTests = (config: {
  assertFn: (v: unknown) => void;
  // eslint-disable-next-line
  validExamples: any[];
  // eslint-disable-next-line
  invalidExamples: any[];
  requireAllProperties: boolean;
}) => {
  const { assertFn, validExamples, invalidExamples, requireAllProperties } = config;

  for (const validExample of validExamples) {
    it(`should accept valid object (${JSON.stringify(validExample)})`, async () => {
      const fn = jest.fn(() => assertFn(validExample));
      fn();
      expect(fn).toHaveReturned();
    });

    it(`should reject additional properties  (${JSON.stringify(validExample)})`, async () => {
      const extendedGoodEventDto = { ...validExample, someRandomPropName: "some string" };
      const fn = () => assertFn(extendedGoodEventDto);
      expect(fn).toThrow(DtoAssertionError);
    });

    if (requireAllProperties) {
      it(`should reject if any property is missing (${JSON.stringify(validExample)})`, async () => {
        for (const key in validExample) {
          const partialGoodEventDto = { ...validExample };
          delete partialGoodEventDto[key];

          const fn = () => assertFn(partialGoodEventDto);
          expect(fn).toThrow(DtoAssertionError);

          const partialGoodEventDto2 = { ...validExample, [key]: undefined };

          const fn2 = () => assertFn(partialGoodEventDto2);
          expect(fn2).toThrow(DtoAssertionError);
        }
      });
    }
  }

  for (const invalidExample of invalidExamples) {
    it(`should reject if properties are bad (${JSON.stringify(invalidExample)})`, async () => {
      const fn = () => assertFn(invalidExample);
      expect(fn).toThrow(DtoAssertionError);
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const VALID_API_ERROR_RESPONSE_DTO: IApiErrorResponseDto = {
  success: false,
  statusCode: 400,
  error: {
    name: "some string",
    message: "some string",
  },
};

const VALID_API_SUCCESS_RESPONSE_DTO: IApiSuccessResponseDto = {
  success: true,
  statusCode: 400,
  data: {
    id: "some string",
  },
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe("assertApiErrorResponseDto should work", () => {
  runDtoAssertFnTests({
    assertFn: assertApiErrorResponseDto,
    validExamples: [VALID_API_ERROR_RESPONSE_DTO],
    invalidExamples: [
      { ...VALID_API_ERROR_RESPONSE_DTO, success: true },
      { ...VALID_API_ERROR_RESPONSE_DTO, data: {} },
    ],
    requireAllProperties: true,
  });
});

describe("assertApiSuccessResponseDto should work", () => {
  runDtoAssertFnTests({
    assertFn: assertApiSuccessResponseDto,
    validExamples: [VALID_API_SUCCESS_RESPONSE_DTO],
    invalidExamples: [
      { ...VALID_API_ERROR_RESPONSE_DTO, success: false },
      { ...VALID_API_ERROR_RESPONSE_DTO, error: { message: 123 } },
    ],
    requireAllProperties: true,
  });
});

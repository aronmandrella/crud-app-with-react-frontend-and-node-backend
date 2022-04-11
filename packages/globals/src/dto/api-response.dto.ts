import { object, literal, string, record, unknown, Infer, number } from "superstruct";
import { createDtoAssertionFn } from "../helpers";

/* --------------------------------- SCHEMAS -------------------------------- */

const apiErrorResponseDtoSchema = object({
  success: literal(false),
  statusCode: number(),
  error: object({
    name: string(),
    message: string(),
  }),
});

const apiSuccessResponseDtoSchema = object({
  success: literal(true),
  statusCode: number(),
  data: record(string(), unknown()),
});

/* ------------------------------- ASSERTIONS ------------------------------- */

export const assertApiErrorResponseDto = createDtoAssertionFn({
  name: "ApiErrorResponseDto",
  schema: apiErrorResponseDtoSchema,
});

export const assertApiSuccessResponseDto = createDtoAssertionFn({
  name: "ApiSuccessResponseDto",
  schema: apiSuccessResponseDtoSchema,
});

/* ------------------------------- INTERFACES ------------------------------- */

export type IApiErrorResponseDto = Infer<typeof apiErrorResponseDtoSchema>;
export type IApiSuccessResponseDto = Infer<typeof apiSuccessResponseDtoSchema>;

import {
  assertEventDto,
  assertCreateEventDto,
  assertUpdateEventDto,
  IEventDto,
} from "./events.dto";

import { runDtoAssertFnTests } from "./api-response.dto.spec";
import { INVALID_EMAILS } from "../validators/isEmail.spec";
import { INVALID_DATE_STRINGS } from "../validators/isValidDateString.spec";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line
const removeIdFromExamples = (examples: any[]) => {
  return examples.map((example) => {
    const exampleWithoutId = { ...example };
    delete exampleWithoutId.id;
    return exampleWithoutId;
  });
};

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const VALID_EVENT_DTO: IEventDto = {
  id: 1,
  firstName: "some string",
  lastName: "some string",
  email: "email@mail.com",
  date: "Sat Apr 09 2022 21:42:30 GMT+0200",
};

const validEventDtoExamples = [VALID_EVENT_DTO];

const invalidEventDtoExamplesBadIdOnly = [
  ...["ee", "123", {}, []].map((badValue) => {
    return { ...VALID_EVENT_DTO, id: badValue };
  }),
];

const invalidEventDtoExamples = [
  ...["", 123, {}, []].map((badValue) => {
    return { ...VALID_EVENT_DTO, firstName: badValue };
  }),
  ...["", 123, {}, []].map((badValue) => {
    return { ...VALID_EVENT_DTO, lastName: badValue };
  }),
  ...["", 123, {}, [], ...INVALID_EMAILS].map((badValue) => {
    return { ...VALID_EVENT_DTO, email: badValue };
  }),
  ...["", 123, {}, [], ...INVALID_DATE_STRINGS].map((badValue) => {
    return { ...VALID_EVENT_DTO, date: badValue };
  }),
];

const validEventDtoExamplesWithoutIds = removeIdFromExamples(validEventDtoExamples);
const invalidEventDtoExamplesWithoutIds = removeIdFromExamples(invalidEventDtoExamples);

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe("assertEventDto should work", () => {
  runDtoAssertFnTests({
    assertFn: assertEventDto,
    validExamples: validEventDtoExamples,
    invalidExamples: [...invalidEventDtoExamplesBadIdOnly, ...invalidEventDtoExamples],
    requireAllProperties: true,
  });
});

describe("assertCreateEventDto should work", () => {
  runDtoAssertFnTests({
    assertFn: assertCreateEventDto,
    validExamples: validEventDtoExamplesWithoutIds,
    invalidExamples: invalidEventDtoExamplesWithoutIds,
    requireAllProperties: true,
  });
});

describe("assertUpdateEventDto should work", () => {
  runDtoAssertFnTests({
    assertFn: assertUpdateEventDto,
    validExamples: validEventDtoExamplesWithoutIds,
    invalidExamples: invalidEventDtoExamplesWithoutIds,
    requireAllProperties: false,
  });
});

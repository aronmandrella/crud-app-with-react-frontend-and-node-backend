import { object, array, number, string, refine, nonempty, omit, partial, Infer } from "superstruct";
import { createDtoAssertionFn } from "../helpers";
import { isEmail, isValidDateString } from "../validators";

/* --------------------------------- SCHEMAS -------------------------------- */

const eventIdSchema = number();

const eventDtoSchema = object({
  id: eventIdSchema,
  firstName: nonempty(string()),
  lastName: nonempty(string()),
  email: refine(string(), "email", isEmail),
  date: refine(string(), "date", isValidDateString),
});

const eventsArrayDtoSchema = array(eventDtoSchema);

const createEventDtoSchema = omit(eventDtoSchema, ["id"]);
const updateEventDtoSchema = partial(createEventDtoSchema);

/* --------------------------------- PARSERS -------------------------------- */

export const assertEventId = createDtoAssertionFn({
  name: "EventId",
  schema: eventIdSchema,
});

export const assertEventDto = createDtoAssertionFn({
  name: "EventDto",
  schema: eventDtoSchema,
});

export const assertEventsArrayDto = createDtoAssertionFn({
  name: "EventsArrayDto",
  schema: eventsArrayDtoSchema,
});

export const assertCreateEventDto = createDtoAssertionFn({
  name: "CreateEventDto",
  schema: createEventDtoSchema,
});

export const assertUpdateEventDto = createDtoAssertionFn({
  name: "UpdateEventDto",
  schema: updateEventDtoSchema,
});

/* ------------------------------- INTERFACES ------------------------------- */

export type IEventId = Infer<typeof eventIdSchema>;
export type IEventDto = Infer<typeof eventDtoSchema>;
export type IEventsArrayDto = Infer<typeof eventsArrayDtoSchema>;
export type ICreateEventDto = Infer<typeof createEventDtoSchema>;
export type IUpdateEventDto = Infer<typeof updateEventDtoSchema>;

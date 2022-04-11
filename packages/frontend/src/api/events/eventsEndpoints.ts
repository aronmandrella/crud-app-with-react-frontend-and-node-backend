import { apiClientInstance } from "../ApiClient";
import {
  IEventId,
  IEventDto,
  IEventsArrayDto,
  ICreateEventDto,
  IUpdateEventDto,
  assertEventDto,
  assertEventsArrayDto,
} from "@project/globals";

/* ------------------------------- VALIDATORS ------------------------------- */

const validateEventDto = (value: unknown): IEventDto | never => {
  assertEventDto(value);
  return value;
};

const validateEventsArrayDto = (value: unknown): IEventsArrayDto | never => {
  assertEventsArrayDto(value);
  return value;
};

/* ---------------------------------- APIS ---------------------------------- */

export const getAllEvents = () => {
  return apiClientInstance.get({
    url: `/events`,
    responseDataValidator: validateEventsArrayDto,
  });
};

export const getEvent = (id: IEventId) => {
  return apiClientInstance.get({
    url: `/events/${id}`,
    responseDataValidator: validateEventDto,
  });
};

export const createEvent = (dto: ICreateEventDto) => {
  return apiClientInstance.post({
    url: `/events`,
    data: dto,
    responseDataValidator: validateEventDto,
  });
};

export const updateEvent = (id: IEventId, dto: IUpdateEventDto) => {
  return apiClientInstance.patch({
    url: `/events/${id}`,
    data: dto,
    responseDataValidator: validateEventDto,
  });
};

export const deleteEvent = (id: IEventId) => {
  return apiClientInstance.delete({
    url: `/events/${id}`,
    responseDataValidator: validateEventDto,
  });
};

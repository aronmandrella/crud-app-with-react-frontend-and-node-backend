import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IApiSuccessResponseDto, IEventDto } from "@project/globals";

import { App } from "./App";
import { ERROR_TITLE } from "../EventsTable";

import {
  VALID_EVENT_FORM_INPUTS_EXAMPLE,
  getEventFormFieldsHTMLElements,
  typeValuesIntoEventFromInputs,
} from "../EventsMaker/EventsMaker.spec";

import {
  createValidEventDtoExample,
  getEventsTableRowDeleteButtonHTMLElement,
} from "../EventsTable/EventsTable.spec";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

/*
  NOTE:
  This is needed because useEvent hook updates states within asynchronous functions.
  During update/delete it starts with optimistic state update, and then once mutation completes,
  it takes true data from the backend and updates the ui state again (or reverts changes on fail).
  It means that the state update is triggered at least twice, once by user interaction (click), 
  and once by asynchronous but by some code. Jest gives a warning for the latter 'cause it thinks
  that some assertion is missing since something unexpected happened.
  
  I'll use this call to give UI state some time to 'stabilize'. Big application that uses react-query
  maybe would have a global variable or a UI loader that would indicate that something is going on in the background.
  In that case I'd use that variable/ui element instead, since waiting for some arbitrary time is not a good solution
  (but I think it's good enough for a demo app)
*/
const waitForAllOngoingMutations = (ms: number = 1000): Promise<void> => {
  const getTime = () => new Date().getTime();
  const expectedEndTime = getTime() + ms;

  return waitFor(
    () => {
      if (getTime() >= expectedEndTime) {
        return;
      } else {
        throw new Error("Still faking waiting for mutations.");
      }
    },
    { timeout: ms * 1.2 }
  );
};

const fillEventFormAndClickAddEventButton = async () => {
  const { confirmButton } = getEventFormFieldsHTMLElements();
  await typeValuesIntoEventFromInputs(VALID_EVENT_FORM_INPUTS_EXAMPLE);
  await userEvent.click(confirmButton);
};

/* -------------------------------------------------------------------------- */
/*                                    MOCKS                                   */
/* -------------------------------------------------------------------------- */

const BASE_SERVER_URL = "http://localhost:3001";

const createSuccessApiResponse = (
  data: Record<string, unknown> | unknown[]
): IApiSuccessResponseDto => {
  return { success: true, statusCode: 200, data };
};

const setupMockServerAndMockDb = () => {
  const db: {
    events: IEventDto[];
  } = {
    events: [
      createValidEventDtoExample(1),
      createValidEventDtoExample(2),
      createValidEventDtoExample(3),
      createValidEventDtoExample(4),
      createValidEventDtoExample(5),
    ],
  };

  let nextToBeCreatedEventId: number = db.events.length + 1;

  const server = setupServer(
    rest.get(BASE_SERVER_URL + "/events", (req, res, ctx) => {
      const response = createSuccessApiResponse(db.events);
      return res(ctx.json(response));
    }),

    rest.post(BASE_SERVER_URL + "/events", (req, res, ctx) => {
      const newEvent = { ...(req.body as any), id: nextToBeCreatedEventId++ };
      db.events.push(newEvent);
      const response = createSuccessApiResponse(newEvent);

      return res(ctx.json(response));
    }),

    rest.delete(BASE_SERVER_URL + "/events/:id", (req, res, ctx) => {
      const id = Number(req.params.id);
      const deletedEvent = db.events.find((event) => event.id === id);
      if (!deletedEvent) {
        throw new Error("Tried to delete event that don't exist.");
      }

      db.events = db.events.filter((event) => event.id !== id);
      const response = createSuccessApiResponse(deletedEvent);

      return res(ctx.json(response));
    })
  );

  return {
    db,
    server,
    getNextToBeCreatedEventId: () => nextToBeCreatedEventId,
  };
};

const { db, server, getNextToBeCreatedEventId } = setupMockServerAndMockDb();

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("<App/>", () => {
  const queryTableRowHTMLElement = (rowId: number | string) => {
    return document.querySelector(`tr[data-eventid="${rowId}"]`) as HTMLElement | null;
  };

  const getTableRowHTMLElement = (rowId: number | string) => {
    const element = queryTableRowHTMLElement(rowId);
    if (!element) {
      throw new Error(`Event row with id '${rowId}' not found.`);
    }
    return element as HTMLElement;
  };

  it("should show error message when loading events fails", async () => {
    server.use(
      rest.get(BASE_SERVER_URL + "/events", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);

    const error = await screen.findByText(ERROR_TITLE);
    expect(error).toBeInTheDocument();
  });

  it("should render all events once data is loaded", async () => {
    const expectedEventsIds = db.events.map((event) => event.id);

    render(<App />);

    for (const id of expectedEventsIds) {
      const row = await waitFor(() => getTableRowHTMLElement(id));
      expect(row).toBeInTheDocument();
    }
  });

  it("created elements should appear in the table", async () => {
    const expectedEventsIds = db.events.map((event) => event.id);
    const nextToBeCreatedEventId = getNextToBeCreatedEventId();

    render(<App />);

    for (const id of expectedEventsIds) {
      const eventRow = await waitFor(() => getTableRowHTMLElement(id));
      expect(eventRow).toBeInTheDocument();
    }

    expect(queryTableRowHTMLElement(nextToBeCreatedEventId)).not.toBeInTheDocument();

    await fillEventFormAndClickAddEventButton();
    await waitForAllOngoingMutations();

    const newEventRow = getTableRowHTMLElement(nextToBeCreatedEventId);
    expect(newEventRow).toBeInTheDocument();
  });

  it("created elements should not appear in the table if mutation fails", async () => {
    server.use(
      rest.post(BASE_SERVER_URL + "/events", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const expectedEventsIds = db.events.map((event) => event.id);
    const nextToBeCreatedEventId = getNextToBeCreatedEventId();

    render(<App />);

    for (const id of expectedEventsIds) {
      const eventRow = await waitFor(() => getTableRowHTMLElement(id));
      expect(eventRow).toBeInTheDocument();
    }

    expect(queryTableRowHTMLElement(nextToBeCreatedEventId)).not.toBeInTheDocument();

    await fillEventFormAndClickAddEventButton();
    await waitForAllOngoingMutations();

    expect(queryTableRowHTMLElement(nextToBeCreatedEventId)).not.toBeInTheDocument();
  });

  it("deleted elements should disappear from the table", async () => {
    const lastEventId = db.events[db.events.length - 1].id;

    render(<App />);

    const row = await waitFor(() => getTableRowHTMLElement(lastEventId));
    expect(row).toBeInTheDocument();

    const deleteButton = getEventsTableRowDeleteButtonHTMLElement(lastEventId);
    expect(deleteButton).toBeInTheDocument();

    await userEvent.click(deleteButton);
    await waitForAllOngoingMutations();

    expect(queryTableRowHTMLElement(lastEventId)).toBeNull();
  });

  it("deleted elements should not disappear from the table if mutation fails", async () => {
    server.use(
      rest.delete(BASE_SERVER_URL + "/events/:id", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const lastEventId = db.events[db.events.length - 1].id;

    render(<App />);

    const row = await waitFor(() => getTableRowHTMLElement(lastEventId));
    expect(row).toBeInTheDocument();

    const deleteButton = getEventsTableRowDeleteButtonHTMLElement(lastEventId);
    expect(deleteButton).toBeInTheDocument();

    await userEvent.click(deleteButton);
    await waitForAllOngoingMutations();

    expect(queryTableRowHTMLElement(lastEventId)).toBeInTheDocument();
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsTable, ERROR_TITLE, createRandomCreateEventDto } from "./EventsTable";
import { IEventDto } from "@project/globals";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

export const createValidEventDtoExample = (id: number): IEventDto => {
  return {
    id: id,
    ...createRandomCreateEventDto(),
  };
};

export const queryEventsTableLoaderHTMLElement = () => {
  return document.querySelector(".overlay svg") as HTMLElement | null;
};

export const queryEventsTableRowHTMLElement = (rowId: number | string) => {
  return document.querySelector(`tr[data-eventid="${rowId}"]`) as HTMLElement | null;
};

export const getEventsTableRowHTMLElement = (rowId: number | string) => {
  const element = queryEventsTableRowHTMLElement(rowId);
  if (!element) {
    throw new Error(`Event row with id '${rowId}' not found.`);
  }
  return element as HTMLElement;
};

export const getEventsTableRowDeleteButtonHTMLElement = (rowId: number | string) => {
  const row = getEventsTableRowHTMLElement(rowId);
  return within(row).getByLabelText("delete");
};

export const getEventsTableRowUpdateButtonHTMLElement = (rowId: number | string) => {
  const row = getEventsTableRowHTMLElement(rowId);
  return within(row).getByLabelText("update");
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe("<EventsTable/>", () => {
  const EXAMPLE_EVENTS: IEventDto[] = [
    createValidEventDtoExample(1),
    createValidEventDtoExample(2),
  ];

  describe("loading and error states", () => {
    it(`should show loader if 'isFetching' is 'true' and if there are no events`, () => {
      const { rerender } = render(<EventsTable events={[]} />);
      expect(queryEventsTableLoaderHTMLElement()).toBeNull();

      rerender(<EventsTable isFetching events={[]} />);
      expect(queryEventsTableLoaderHTMLElement()).toBeInTheDocument();

      rerender(<EventsTable isFetching events={EXAMPLE_EVENTS} />);
      expect(queryEventsTableLoaderHTMLElement()).toBeNull();

      rerender(<EventsTable events={[]} />);
      expect(queryEventsTableLoaderHTMLElement()).toBeNull();
    });

    it("should show error if 'error' is provided and if 'isFetching' is not 'true' even if there are no events", () => {
      const expectedErrorTitle = ERROR_TITLE;
      const errorMessage = "Something went wrong";

      const { rerender } = render(<EventsTable events={[]} />);
      expect(screen.queryByText(expectedErrorTitle)).toBeNull();
      expect(screen.queryByText(errorMessage)).toBeNull();

      rerender(<EventsTable error={errorMessage} events={[]} />);
      expect(screen.queryByText(expectedErrorTitle)).toBeInTheDocument();
      expect(screen.queryByText(errorMessage)).toBeInTheDocument();

      rerender(<EventsTable error={errorMessage} events={EXAMPLE_EVENTS} />);
      expect(screen.queryByText(expectedErrorTitle)).toBeInTheDocument();
      expect(screen.queryByText(errorMessage)).toBeInTheDocument();

      rerender(<EventsTable isFetching error={errorMessage} events={[]} />);
      expect(screen.queryByText(expectedErrorTitle)).toBeNull();
      expect(screen.queryByText(errorMessage)).toBeNull();
    });
  });

  describe("table rows", () => {
    it("should render events as rows in a table", () => {
      render(<EventsTable events={EXAMPLE_EVENTS} />);

      for (const event of EXAMPLE_EVENTS) {
        const row = queryEventsTableRowHTMLElement(event.id);
        expect(row).toBeInTheDocument();
        if (!row) throw new Error("Row should exist in table.");

        for (const value of Object.values(event)) {
          expect(within(row).queryByText(value)).toBeInTheDocument();
        }
      }
    });

    it("should trigger callbacks with appropriate arguments when event action buttons within rows are clicked", async () => {
      const handleDeleteEventMockFn = jest.fn((id: number) => {});
      const handleUpdateEventMockFn = jest.fn((id: number) => {});

      render(
        <EventsTable
          events={EXAMPLE_EVENTS}
          onDeleteEvent={handleDeleteEventMockFn}
          onUpdateEvent={handleUpdateEventMockFn}
        />
      );

      for (const event of EXAMPLE_EVENTS) {
        const deleteButton = getEventsTableRowDeleteButtonHTMLElement(event.id);
        const updateButton = getEventsTableRowUpdateButtonHTMLElement(event.id);

        await userEvent.click(deleteButton);
        expect(handleDeleteEventMockFn).toBeCalledWith(event.id);

        await userEvent.click(updateButton);
        expect(handleUpdateEventMockFn).toBeCalledWith(event.id, {
          firstName: expect.any(String),
          lastName: expect.any(String),
          email: expect.any(String),
          date: expect.any(String),
        });
      }
    });
  });
});

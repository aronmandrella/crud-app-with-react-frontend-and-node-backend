import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsTable, IEventsTableProps, ERROR_TITLE } from "./EventsTable";

/* -------------------------------------------------------------------------- */
/*                                  EXAMPLES                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLE_EVENTS: IEventsTableProps["events"] = [
  {
    id: 1,
    firstName: "Joe",
    lastName: "Doe",
    email: "joe.doel@mail.com",
    date: "2022-04-14T20:00:00.616Z",
  },
  {
    id: 2,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@mail.com",
    date: "2022-04-14T21:00:00.616Z",
  },
];

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe("<EventsTable/>", () => {
  const queryLoaderHTMLElement = () => {
    return document.querySelector(".overlay svg") as HTMLElement | null;
  };
  const queryTableRowHTMLElement = (rowId: number | string) => {
    return document.querySelector(`tr[data-eventid="${rowId}"]`) as HTMLElement | null;
  };

  describe("loading and error states", () => {
    it(`should show loader if 'isFetching' is 'true' and if there are no events`, () => {
      const { rerender } = render(<EventsTable events={[]} />);
      expect(queryLoaderHTMLElement()).toBeNull();

      rerender(<EventsTable isFetching events={[]} />);
      expect(queryLoaderHTMLElement()).toBeInTheDocument();

      rerender(<EventsTable isFetching events={EXAMPLE_EVENTS} />);
      expect(queryLoaderHTMLElement()).toBeNull();

      rerender(<EventsTable events={[]} />);
      expect(queryLoaderHTMLElement()).toBeNull();
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
        const row = queryTableRowHTMLElement(event.id);
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
        const row = queryTableRowHTMLElement(event.id);
        expect(row).toBeInTheDocument();
        if (!row) throw new Error("Row should exist in table.");

        const deleteButton = within(row).getByLabelText("delete");
        const updateButton = within(row).getByLabelText("update");

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

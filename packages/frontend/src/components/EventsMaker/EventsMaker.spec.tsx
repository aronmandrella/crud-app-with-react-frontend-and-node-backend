import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EventsMaker,
  IEventsMakerProps,
  INPUTS_PLACEHOLDERS,
  INPUTS_ERROR_MESSAGES,
  ADD_EVENT_TEXT,
} from "./EventsMaker";

/* -------------------------------------------------------------------------- */
/*                                  EXAMPLES                                  */
/* -------------------------------------------------------------------------- */

export const VALID_EVENT_FORM_INPUTS_EXAMPLE = {
  firstName: "some name",
  lastName: "some name",
  email: "mail@mail.com",
  date: "2022-04-19",
};

export const INVALID_EVENT_FORM_INPUTS_EXAMPLES = {
  firstName: [""],
  lastName: [""],
  email: ["", "John", "@mail.com", "mail@"],
  date: ["", "2000", "01.", ".2000", "10.03.2022"],
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

export const eventsInputsKeys = ["firstName", "lastName", "date", "email"] as const;

export const createOnCreateEventMockFn = () => {
  const callback: IEventsMakerProps["onCreateEvent"] = () => {};
  return jest.fn(callback);
};

export const queryEventFormErrorMessageHTMLElement = (
  inputKey: keyof typeof INPUTS_ERROR_MESSAGES
) => {
  return screen.queryByText(INPUTS_ERROR_MESSAGES[inputKey]);
};

export const getEventFormFieldsHTMLElements = () => {
  return {
    inputs: {
      firstName: screen.getByPlaceholderText(INPUTS_PLACEHOLDERS.firstName),
      lastName: screen.getByPlaceholderText(INPUTS_PLACEHOLDERS.lastName),
      email: screen.getByPlaceholderText(INPUTS_PLACEHOLDERS.email),
      date: screen.getByPlaceholderText(INPUTS_PLACEHOLDERS.date),
    },
    confirmButton: screen.getByText(ADD_EVENT_TEXT),
  };
};

export const typeValuesIntoEventFromInputs = async (values: {
  firstName: string;
  lastName: string;
  email: string;
  date: string;
}) => {
  const { inputs } = getEventFormFieldsHTMLElements();

  for (const inputKey of eventsInputsKeys) {
    const value = values[inputKey];
    if (value) {
      await userEvent.type(inputs[inputKey], value);
    } else {
      await userEvent.clear(inputs[inputKey]);
    }
  }
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe("<EventsMaker/>", () => {
  describe("confirm button", () => {
    it(`should be rendered`, () => {
      render(<EventsMaker onCreateEvent={() => {}} />);

      const { confirmButton } = getEventFormFieldsHTMLElements();
      expect(confirmButton).toBeInTheDocument();
    });

    it("should show inputs errors once clicked", async () => {
      render(<EventsMaker onCreateEvent={() => {}} />);

      const { confirmButton } = getEventFormFieldsHTMLElements();

      for (const inputKey of eventsInputsKeys) {
        expect(queryEventFormErrorMessageHTMLElement(inputKey)).toBeNull();
      }

      await userEvent.click(confirmButton);

      for (const inputKey of eventsInputsKeys) {
        expect(queryEventFormErrorMessageHTMLElement(inputKey)).toBeInTheDocument();
      }
    });

    it("should be disabled if inputs errors are visible", async () => {
      render(<EventsMaker onCreateEvent={() => {}} />);

      const { confirmButton } = getEventFormFieldsHTMLElements();

      expect(confirmButton).not.toBeDisabled();

      await userEvent.click(confirmButton);
      expect(confirmButton).toBeDisabled();

      await typeValuesIntoEventFromInputs(VALID_EVENT_FORM_INPUTS_EXAMPLE);
      expect(confirmButton).not.toBeDisabled();
    });

    it("should trigger callback but only if inputs are valid", async () => {
      const mockHandleCreateEventFn = createOnCreateEventMockFn();
      render(<EventsMaker onCreateEvent={mockHandleCreateEventFn} />);

      const { confirmButton } = getEventFormFieldsHTMLElements();

      await userEvent.click(confirmButton);
      expect(mockHandleCreateEventFn).not.toHaveBeenCalled();

      await userEvent.click(confirmButton);
      expect(mockHandleCreateEventFn).not.toHaveBeenCalled();

      await typeValuesIntoEventFromInputs(VALID_EVENT_FORM_INPUTS_EXAMPLE);
      await userEvent.click(confirmButton);
      expect(mockHandleCreateEventFn).toHaveBeenCalledWith(VALID_EVENT_FORM_INPUTS_EXAMPLE);
    });
  });

  for (const inputKey of ["firstName", "lastName", "date", "email"] as const) {
    describe(`'${inputKey}' field`, () => {
      it(`should be rendered`, () => {
        render(<EventsMaker onCreateEvent={() => {}} />);

        const { inputs } = getEventFormFieldsHTMLElements();
        expect(inputs[inputKey]).toBeInTheDocument();
      });

      for (const invalidValue of INVALID_EVENT_FORM_INPUTS_EXAMPLES[inputKey]) {
        it(`should show error and prevent event creation if filled with '${invalidValue}'`, async () => {
          const mockHandleCreateEventFn = createOnCreateEventMockFn();
          render(<EventsMaker onCreateEvent={mockHandleCreateEventFn} />);

          const { confirmButton } = getEventFormFieldsHTMLElements();

          await typeValuesIntoEventFromInputs({
            ...VALID_EVENT_FORM_INPUTS_EXAMPLE,
            [inputKey]: invalidValue,
          });
          await userEvent.click(confirmButton);

          expect(mockHandleCreateEventFn).not.toHaveBeenCalled();
          expect(queryEventFormErrorMessageHTMLElement(inputKey)).toBeInTheDocument();
        });
      }
    });
  }
});

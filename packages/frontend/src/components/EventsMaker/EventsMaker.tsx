import styles from "./EventsMaker.module.scss";

import React, { useState } from "react";
import clsx from "clsx";

import { ICreateEventDto, isEmail, isValidDateString } from "@project/globals";
import { Button, Input } from "@ui";
import { useInputsManager } from "@helpers";

/* -------------------------------------------------------------------------- */
/*                                  MESSAGES                                  */
/* -------------------------------------------------------------------------- */

/* 
  NOTE:
  Messages exported for tests.
  If application was localized, test would probably use data
  from a json or some external provider in both places.
*/
export const INPUTS_PLACEHOLDERS = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  date: "Date",
};

/*
  NOTE:
  For simplicity and easy testing this assumes that each field
  has only one error message that says what data is expected.
  Supporting various error messages in tests, would require providing
  unique 'id's to error message span/div, and labeling inputs with
  'aria-describedby' (or data-testid). Big application probably 
  would have some helpers for that.
*/
export const INPUTS_ERROR_MESSAGES = {
  firstName: "First name is required",
  lastName: "Last name is required",
  email: "Invalid email address",
  date: "Invalid date",
};

export const ADD_EVENT_TEXT = "Add event";

/* -------------------------------------------------------------------------- */
/*                                INPUTS CONFIG                               */
/* -------------------------------------------------------------------------- */

const initialInputs = {
  firstName: "",
  lastName: "",
  email: "",
  date: "",
};

/*
  NOTE:
  There are many ways to handle validation with readable
  error messages and/or various locales. Data could be validated
  against 'superstruct' / 'yup' schema for example. For simplicity 
  I've picked this basic hand-written approach.
*/
const inputsErrorDetectors = {
  firstName: (value: string) => {
    if (!value.length) {
      return INPUTS_ERROR_MESSAGES.firstName;
    }
  },
  lastName: (value: string) => {
    if (!value.length) {
      return INPUTS_ERROR_MESSAGES.lastName;
    }
  },
  email: (value: string) => {
    if (!isEmail(value)) {
      return INPUTS_ERROR_MESSAGES.email;
    }
  },
  date: (value: string) => {
    if (!isValidDateString(value)) {
      return INPUTS_ERROR_MESSAGES.date;
    }
  },
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export interface IEventsMakerProps {
  className?: string;
  onCreateEvent: (data: ICreateEventDto) => void;
}

export const EventsMaker: React.VFC<IEventsMakerProps> = React.memo((props) => {
  /* ---------------------------------- STATE --------------------------------- */

  const { className, onCreateEvent } = props;

  const [isMutingErrors, setIsMutingErrors] = useState(true);

  const { values, errors, hasErrors, getInputProps } = useInputsManager({
    initialValues: initialInputs,
    errorDetectors: inputsErrorDetectors,
  });

  const getError = (inputKey: keyof typeof errors): string | undefined => {
    return isMutingErrors ? undefined : errors[inputKey];
  };

  /* ----------------------------- EVENT HANDLERS ----------------------------- */

  /*
    NOTE:
    Adding useCallback to this doesn't make sense since 'vales'
    changes very almost on every render. useRef would have to be used to
    store these values if useCallback would be beneficial for some reason. 
  */
  const handleAddEvent = () => {
    if (!hasErrors) {
      onCreateEvent(values);
      setIsMutingErrors(true);
    } else {
      setIsMutingErrors(false);
    }
  };

  /* ----------------------------------- JSX ---------------------------------- */

  return (
    <div className={clsx(className, styles.root)}>
      <Input placeholder={INPUTS_PLACEHOLDERS.firstName} {...getInputProps("firstName")} />
      <div className={styles.error}>{getError("firstName")}</div>

      <Input placeholder={INPUTS_PLACEHOLDERS.lastName} {...getInputProps("lastName")} />
      <div className={styles.error}>{getError("lastName")}</div>

      <Input placeholder={INPUTS_PLACEHOLDERS.email} {...getInputProps("email")} />
      <div className={styles.error}>{getError("email")}</div>

      <Input
        /*
          NOTE:
          It doesn't support time but should be enough for this demo.
          In big app  I would use 'react-datepicker' package or something
          similar. Writing it from scratch is also an option but would take some time.
        */
        type="date"
        placeholder={INPUTS_PLACEHOLDERS.date}
        {...getInputProps("date")}
      />
      <div className={styles.error}>{getError("date")}</div>

      <Button onClick={handleAddEvent} disabled={hasErrors && !isMutingErrors}>
        {ADD_EVENT_TEXT}
      </Button>
    </div>
  );
});

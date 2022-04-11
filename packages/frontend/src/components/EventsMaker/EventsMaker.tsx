import styles from "./EventsMaker.module.scss";

import React, { useState } from "react";
import clsx from "clsx";

import { ICreateEventDto, isEmail, isValidDateString } from "@project/globals";
import { Button, Input } from "@ui";
import { useInputsManager } from "@helpers";

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
      return "This field is required";
    }
  },
  lastName: (value: string) => {
    if (!value.length) {
      return "This field is required";
    }
  },
  email: (value: string) => {
    if (!isEmail(value)) {
      return "Invalid email address";
    }
  },
  date: (value: string) => {
    if (!isValidDateString(value)) {
      return "Invalid date";
    }
  },
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface IEventsMakerProps {
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
      <Input placeholder="First name" {...getInputProps("firstName")} />
      <div className={styles.error}>{getError("firstName")}</div>

      <Input placeholder="Last name" {...getInputProps("lastName")} />
      <div className={styles.error}>{getError("lastName")}</div>

      <Input placeholder="Email" {...getInputProps("email")} />
      <div className={styles.error}>{getError("email")}</div>

      <Input
        /*
          NOTE:
          It doesn't support time but should be enough for this demo.
          In big app  I would use 'react-datepicker' package or something
          similar. Writing it from scratch is also an option but would take some time.
        */
        type="date"
        placeholder="Date"
        {...getInputProps("date")}
      />
      <div className={styles.error}>{getError("date")}</div>

      <Button onClick={handleAddEvent} disabled={hasErrors && !isMutingErrors}>
        Add event
      </Button>
    </div>
  );
});

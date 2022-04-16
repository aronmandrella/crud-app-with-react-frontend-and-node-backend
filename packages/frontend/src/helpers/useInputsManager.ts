import React, { useCallback, useEffect, useMemo, useState } from "react";

/*
    NOTE:
    I could use something like 'react-form-hooks' instead of this.
    This is just a quick DIY solution for input value handling automation.
*/

export const useInputsManager = <IInputs extends Record<string, string>>(props: {
  initialValues: IInputs;
  errorDetectors: {
    [K in keyof IInputs]: (value: string) => string | undefined;
  };
}) => {
  type IErrors = {
    [K in keyof IInputs]: string | undefined;
  };

  type IEventHandlers = {
    [K in keyof IInputs]: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };

  /* ---------------------------------- STATE --------------------------------- */

  const { initialValues, errorDetectors } = props;

  const calculateErrors = useCallback(
    (values: IInputs): IErrors => {
      const inputsKeys = Object.keys(values) as (keyof typeof values)[];

      return inputsKeys.reduce((errors, inputKey) => {
        errors[inputKey] = errorDetectors[inputKey](values[inputKey]);
        return errors;
      }, {} as IErrors);
    },
    [errorDetectors]
  );

  const initialErrors = useMemo(() => {
    return calculateErrors(initialValues);
  }, [calculateErrors, initialValues]);

  const [values, setValues] = useState<IInputs>(initialValues);
  const [errors, setErrors] = useState<IErrors>(initialErrors);

  const hasErrors = Object.values(errors).findIndex((v) => typeof v === "string") !== -1;

  /*
    Refresh current errors when error calculate callbacks change.
  */
  useEffect(
    () => {
      setErrors(calculateErrors(values));
    },
    // eslint-disable-next-line
    [calculateErrors]
  );

  /* ----------------------------- EVENT HANDLERS ----------------------------- */

  const changeHandlers = useMemo(() => {
    const inputsKeys = Object.keys(errorDetectors) as (keyof typeof errorDetectors)[];

    return inputsKeys.reduce((handlers, inputKey) => {
      handlers[inputKey] = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = e.target.value;

        setValues((inputs) => ({
          ...inputs,
          [inputKey]: nextValue,
        }));

        setErrors((errors) => ({
          ...errors,
          [inputKey]: errorDetectors[inputKey](nextValue),
        }));
      };

      return handlers;
    }, {} as IEventHandlers);
  }, [errorDetectors]);

  /* --------------------------------- HELPERS -------------------------------- */

  const resetValues = useCallback(() => {
    setValues(initialValues);
    setErrors(initialErrors);
  }, [initialValues, initialErrors]);

  const getInputProps = (inputKey: keyof IInputs) => {
    return {
      value: values[inputKey],
      onChange: changeHandlers[inputKey],
    };
  };

  return {
    values,
    errors,
    changeHandlers,
    hasErrors,
    resetValues,
    getInputProps,
  };
};

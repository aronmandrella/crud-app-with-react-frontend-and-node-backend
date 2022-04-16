import { renderHook, act } from "@testing-library/react-hooks";
import { useInputsManager } from "./useInputsManager";

/* -------------------------------------------------------------------------- */
/*                                  EXAMPLES                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLE_EMPTY_INITIAL_VALUES = {
  firstName: "",
  lastName: "",
};

const ALLAYS_DETECT_ERROR_FN = (v: string): string | undefined => "Error";
const NEVER_DETECT_ERROR_FN = (v: string): string | undefined => undefined;

const EXAMPLE_FALSY_ERROR_DETECTORS = {
  firstName: NEVER_DETECT_ERROR_FN,
  lastName: NEVER_DETECT_ERROR_FN,
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const getHardTypedObjectKeys = <T extends Record<string, unknown>>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe("useInputsManager()", () => {
  it("unchanged values should be equal to initial values", () => {
    const { result } = renderHook(() =>
      useInputsManager({
        initialValues: EXAMPLE_EMPTY_INITIAL_VALUES,
        errorDetectors: EXAMPLE_FALSY_ERROR_DETECTORS,
      })
    );

    const inputsKeys = getHardTypedObjectKeys(EXAMPLE_EMPTY_INITIAL_VALUES);

    expect(result.current.values).toEqual(EXAMPLE_EMPTY_INITIAL_VALUES);
    for (const inputKey of inputsKeys) {
      expect(result.current.getInputProps(inputKey).value).toEqual(
        EXAMPLE_EMPTY_INITIAL_VALUES[inputKey]
      );
    }
  });

  it("change handlers should be defined for each input and they should update values", () => {
    const { result } = renderHook(() =>
      useInputsManager({
        initialValues: EXAMPLE_EMPTY_INITIAL_VALUES,
        errorDetectors: EXAMPLE_FALSY_ERROR_DETECTORS,
      })
    );

    const inputsKeys = getHardTypedObjectKeys(EXAMPLE_EMPTY_INITIAL_VALUES);

    const expectedValues = {
      ...EXAMPLE_EMPTY_INITIAL_VALUES,
    };

    for (const inputKey of inputsKeys) {
      const changeHandler = result.current.changeHandlers[inputKey];
      expect(changeHandler).toBeDefined();
      expect(result.current.getInputProps(inputKey).onChange).toBe(changeHandler);

      const newValue = String(Math.random());

      act(() => {
        expectedValues[inputKey] = newValue;
        changeHandler({ target: { value: newValue } } as any);
      });

      expect(result.current.values).toEqual(expectedValues);
      for (const inputKey of inputsKeys) {
        expect(result.current.getInputProps(inputKey).value).toEqual(expectedValues[inputKey]);
      }
    }
  });

  it("errors should be initially calculated and updated if error detectors change", () => {
    const initialProps = {
      initialValues: EXAMPLE_EMPTY_INITIAL_VALUES,
      errorDetectors: {
        firstName: NEVER_DETECT_ERROR_FN,
        lastName: NEVER_DETECT_ERROR_FN,
      },
    };

    const { rerender, result } = renderHook((props) => useInputsManager(props), {
      initialProps: initialProps,
    });

    expect(result.current.errors).toEqual({
      firstName: undefined,
      lastName: undefined,
    });
    expect(result.current.hasErrors).toEqual(false);

    rerender({
      ...initialProps,
      errorDetectors: {
        firstName: ALLAYS_DETECT_ERROR_FN,
        lastName: ALLAYS_DETECT_ERROR_FN,
      },
    });

    expect(result.current.errors).toEqual({
      firstName: expect.any(String),
      lastName: expect.any(String),
    });
    expect(result.current.hasErrors).toEqual(true);
  });

  it("change handler should trigger error detector", () => {
    for (const inputKey of getHardTypedObjectKeys(EXAMPLE_EMPTY_INITIAL_VALUES)) {
      const initialProps = {
        initialValues: EXAMPLE_EMPTY_INITIAL_VALUES,
        errorDetectors: {
          firstName: NEVER_DETECT_ERROR_FN,
          lastName: NEVER_DETECT_ERROR_FN,
          [inputKey]: (v: string): string | undefined =>
            v.length > 0 ? "Should be empty" : undefined,
        },
      };

      const { result } = renderHook((props) => useInputsManager(props), {
        initialProps: initialProps,
      });

      const changeHandler = result.current.changeHandlers[inputKey];
      const actUpdateValue = (newValue: string) =>
        act(() => changeHandler({ target: { value: newValue } } as any));

      expect(result.current.errors[inputKey]).toEqual(undefined);
      expect(result.current.hasErrors).toEqual(false);

      actUpdateValue("not empty");
      expect(result.current.errors[inputKey]).toEqual("Should be empty");
      expect(result.current.hasErrors).toEqual(true);

      actUpdateValue("");
      expect(result.current.errors[inputKey]).toEqual(undefined);
      expect(result.current.hasErrors).toEqual(false);
    }
  });
});

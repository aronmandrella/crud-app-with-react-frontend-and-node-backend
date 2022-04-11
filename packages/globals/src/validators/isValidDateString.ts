import { isValidDate } from "./isValidDate";

export const isValidDateString = (value: string) => {
  const isValidNumberString = !isNaN(Number(value));
  if (isValidNumberString) {
    return false;
  }

  return isValidDate(new Date(value));
};

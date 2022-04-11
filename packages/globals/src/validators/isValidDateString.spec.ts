import { isValidDateString } from "./isValidDateString";

export const INVALID_DATE_STRINGS = ["aaaa", "123", "-1", "123", "abc", ""];
export const VALID_DATE_STRINGS = ["2022-04-10T18:00:00.000Z", "Sat Apr 20 2022 21:42:30 GMT+0200"];

describe("isValidDateString should work", () => {
  for (const date of INVALID_DATE_STRINGS) {
    it(`should return false for ${date}`, () => {
      const result = isValidDateString(date);
      expect(result).toBe(false);
    });
  }

  for (const date of VALID_DATE_STRINGS) {
    it(`should return true for ${date}`, () => {
      const result = isValidDateString(date);
      expect(result).toBe(true);
    });
  }
});

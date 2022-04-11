import { isValidDate } from "./isValidDate";

const INVALID_DATES = [new Date("aaa")];
const VALID_DATES = [new Date(), new Date(0), new Date(100000)];

describe("isValidDate should work", () => {
  for (const date of INVALID_DATES) {
    it(`should return false for ${date}`, () => {
      const result = isValidDate(date);
      expect(result).toBe(false);
    });
  }

  for (const date of VALID_DATES) {
    it(`should return true for ${date}`, () => {
      const result = isValidDate(date);
      expect(result).toBe(true);
    });
  }
});

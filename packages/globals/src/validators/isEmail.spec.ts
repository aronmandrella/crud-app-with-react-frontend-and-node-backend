import { isEmail } from "./isEmail";

export const INVALID_EMAILS = ["abc", "@abc", "abc@abc.123", "abc@abc"];
export const VALID_EMAILS = ["abc@abc.com", "abc@abc.pl"];

describe("isEmail should work", () => {
  for (const email of INVALID_EMAILS) {
    it(`should return false for ${email}`, () => {
      const result = isEmail(email);
      expect(result).toBe(false);
    });
  }

  for (const email of VALID_EMAILS) {
    it(`should return true for ${email}`, () => {
      const result = isEmail(email);
      expect(result).toBe(true);
    });
  }
});

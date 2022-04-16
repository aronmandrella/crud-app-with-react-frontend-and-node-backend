export const makeRandomString = (length: number): string =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(0, length);

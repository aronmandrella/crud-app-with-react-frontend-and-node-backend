import IsEmail from "isemail";

export const isEmail = (email: string): boolean => {
  if (!IsEmail.validate(email)) return false;
  // Additional check to return false for this: abc@abc
  return /.+\.[a-zA-Z]+$/.test(email);
};

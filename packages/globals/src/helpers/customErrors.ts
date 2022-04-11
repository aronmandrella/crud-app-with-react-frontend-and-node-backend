export class DtoAssertionError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

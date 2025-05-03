export default class appError extends Error {
  statusCode: number;
  constraint: string | undefined;
  constructor(message: string, statusCode: number, constraint?: string) {
    super(message);
    this.statusCode = statusCode;
    this.constraint = constraint;
  }
}
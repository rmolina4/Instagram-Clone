export default class appError extends Error {
  statusCode: number;
  constraint: string | undefined;
  code: string | undefined;
  constructor(message: string, statusCode: number, constraint?: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.constraint = constraint;
    this.code = code;
  }
}
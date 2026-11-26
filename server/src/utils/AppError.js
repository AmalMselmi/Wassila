export class AppError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} code       Stable machine-readable code, e.g. "NOT_FOUND"
   * @param {string} message    Safe, human-readable message
   * @param {unknown} [details] Optional safe details (e.g. validation issues)
   */
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
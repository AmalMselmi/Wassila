/**
 * Success responses always look like: { success: true, data: ... }
 * Error responses (see errorHandler.js) look like:
 * { success: false, error: { code, message, details? } }
 */
export function sendSuccess(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}
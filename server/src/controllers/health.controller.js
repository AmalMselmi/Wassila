import { getLiveness, getReadiness } from '../services/health.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export function liveness(req, res) {
  return sendSuccess(res, getLiveness());
}

export async function readiness(req, res) {
  const result = await getReadiness();
  return sendSuccess(res, result);
}
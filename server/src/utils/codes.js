import crypto from 'node:crypto';

// No I, O, 0 or 1, to avoid confusion when a code is read aloud or typed.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const BATCH_CODE_REGEX = /^[A-HJ-NP-Z2-9]{10}$/;
export const ORDER_CODE_REGEX = /^ORD-\d{4}-[A-HJ-NP-Z2-9]{6}$/;

export function randomCode(length) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

export function generateBatchCode() {
  return randomCode(10);
}

export function generateOrderCode() {
  return `ORD-${new Date().getFullYear()}-${randomCode(6)}`;
}
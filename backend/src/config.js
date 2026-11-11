// AI-assisted: see docs/AI_LOG.md #56, #60
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(backendRoot, '.env') });

/**
 * @param {string} name
 * @returns {string}
 */
function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * @returns {{
 *   port: number,
 *   mpAccessToken: string,
 *   mpPayerEmail: string,
 *   firebaseServiceAccountPath: string,
 *   backendRoot: string,
 * }}
 */
export function loadConfig() {
  const port = Number(process.env.PORT || 8787);

  return {
    port,
    mpAccessToken: required('MP_ACCESS_TOKEN'),
    mpPayerEmail:
      process.env.MP_PAYER_EMAIL?.trim() || 'test_user_buyer@testuser.com',
    firebaseServiceAccountPath: path.resolve(
      backendRoot,
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() || './serviceAccount.json'
    ),
    backendRoot,
  };
}

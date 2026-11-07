// AI-assisted: see docs/AI_LOG.md #40
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

/**
 * Normalizes login email before sending it to Firebase.
 * @param {string} email
 * @returns {string}
 */
export function normalizeLoginEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

/**
 * Signs in a driver with Firebase Authentication.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginDriver(email, password) {
  const normalizedEmail = normalizeLoginEmail(email);
  return signInWithEmailAndPassword(auth, normalizedEmail, password);
}

/**
 * Maps Firebase Auth error codes to a Spanish message.
 * @param {unknown} error
 * @returns {string}
 */
export function mapAuthError(error) {
  const code = error?.code ?? '';

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Correo o contraseña incorrectos. Revisa e intenta de nuevo';
  }
  if (code === 'auth/invalid-email') {
    return 'El correo no tiene un formato válido';
  }
  if (code === 'auth/user-disabled') {
    return 'Esta cuenta está deshabilitada. Contacta soporte';
  }
  if (code === 'auth/too-many-requests') {
    return 'Demasiados intentos fallidos. Espera unos minutos e intenta otra vez';
  }
  if (code === 'auth/network-request-failed') {
    return 'Sin conexión. Revisa tu internet e intenta de nuevo';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'El inicio de sesión con correo no está habilitado en Firebase';
  }

  return 'No se pudo iniciar sesión. Intenta de nuevo en unos segundos';
}

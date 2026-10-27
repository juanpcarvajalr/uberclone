// AI-assisted: see docs/AI_LOG.md #6
import { differenceInYears, isAfter, isBefore, startOfDay } from 'date-fns';
import { isTechnicalInspectionRequired } from './isTechnicalInspectionRequired';
import { PRICING } from '../config/pricing';

const FULL_NAME_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{1,50}$/;
const DOCUMENT_RE = /^\d{6,10}$/;
const PHONE_RE = /^\d{10}$/;
const PLATE_RE = /^[A-Z]{3}\d{3}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateFullName(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'El nombre es obligatorio';
  return FULL_NAME_RE.test(trimmed) ? null : 'Solo letras y espacios (máx. 50)';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateDocumentNumber(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'El documento es obligatorio';
  return DOCUMENT_RE.test(trimmed) ? null : 'Debe tener entre 6 y 10 dígitos';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validatePhone(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'El celular es obligatorio';
  return PHONE_RE.test(trimmed) ? null : 'Debe tener 10 dígitos';
}

/**
 * @param {Date|string|null} value
 * @returns {string|null}
 */
export function validateBirthDate(value) {
  if (!value) return 'La fecha de nacimiento es obligatoria';
  const birth = new Date(value);
  return differenceInYears(new Date(), birth) >= 18
    ? null
    : 'Debes ser mayor de 18 años';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateEmail(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'El correo es obligatorio';
  return EMAIL_RE.test(trimmed) ? null : 'Correo inválido';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validatePlate(value) {
  const plate = (value ?? '').trim().toUpperCase();
  if (!plate) return 'La placa es obligatoria';
  return PLATE_RE.test(plate) ? null : 'Formato inválido (ABC123)';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateBrandOrModel(value, label) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return `${label} es obligatorio`;
  return trimmed.length <= 30 ? null : `${label}: máx. 30 caracteres`;
}

/**
 * @param {number|string} value
 * @returns {string|null}
 */
export function validateYear(value) {
  const year = Number(value);
  const current = new Date().getFullYear();
  if (!year || String(year).length !== 4) return 'Año inválido';
  return year <= current ? null : 'El año no puede ser futuro';
}

/**
 * @param {Date|string|null} registrationDate
 * @param {number} modelYear
 * @returns {string|null}
 */
export function validateRegistrationDate(registrationDate, modelYear) {
  if (!registrationDate) return 'La fecha de matrícula es obligatoria';
  const date = startOfDay(new Date(registrationDate));
  const today = startOfDay(new Date());
  if (isAfter(date, today)) return 'No puede ser futura';
  const earliest = new Date(modelYear - 1, 0, 1);
  return isBefore(date, earliest)
    ? `No puede ser anterior al 1 ene ${modelYear - 1}`
    : null;
}

/**
 * @param {string} category
 * @param {number|string} capacity
 * @returns {string|null}
 */
export function validatePassengerCapacity(category, capacity) {
  const n = Number(capacity);
  if (!n || n < 1) return 'Capacidad inválida';
  return category === 'xl' && n < 6 ? 'XL requiere mínimo 6 pasajeros' : null;
}

/**
 * @param {Date|string|null} expiresAt
 * @returns {string|null}
 */
export function validateFutureExpiry(expiresAt, label) {
  if (!expiresAt) return `${label} es obligatorio`;
  return isAfter(startOfDay(new Date(expiresAt)), startOfDay(new Date()))
    ? null
    : `${label} debe vencer después de hoy`;
}

/**
 * @param {object} documents
 * @param {Date|string} registrationDate
 * @returns {Record<string, string>}
 */
export function validateDocumentsTab(documents, registrationDate) {
  const errors = {};
  const licenseErr = validateFutureExpiry(documents?.driverLicense?.expiresAt, 'Licencia');
  if (!(documents?.driverLicense?.number ?? '').trim()) {
    errors.licenseNumber = 'Número de licencia obligatorio';
  }
  if (!documents?.driverLicense?.photoUrl) errors.licensePhoto = 'Foto de licencia obligatoria';
  if (licenseErr) errors.licenseExpiry = licenseErr;

  if (!documents?.soat?.photoUrl) errors.soatPhoto = 'Foto de SOAT obligatoria';
  const soatErr = validateFutureExpiry(documents?.soat?.expiresAt, 'SOAT');
  if (soatErr) errors.soatExpiry = soatErr;

  const needsInspection = isTechnicalInspectionRequired(registrationDate);
  if (needsInspection) {
    if (!documents?.technicalInspection?.photoUrl) {
      errors.inspectionPhoto = 'Foto de revisión obligatoria';
    }
    const inspErr = validateFutureExpiry(
      documents?.technicalInspection?.expiresAt,
      'Revisión técnico-mecánica'
    );
    if (inspErr) errors.inspectionExpiry = inspErr;
  }

  const mpErr = validateEmail(documents?.mercadoPagoEmail ?? '');
  if (mpErr) errors.mercadoPagoEmail = mpErr;
  if (!documents?.termsAccepted) {
    errors.terms = `Debes aceptar los términos (comisión ${PRICING.commissionRate * 100} %)`;
  }
  return errors;
}

export { EMAIL_RE, PLATE_RE };

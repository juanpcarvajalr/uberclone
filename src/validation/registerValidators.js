// AI-assisted: see docs/AI_LOG.md #6, #38
import { differenceInYears, isAfter, isBefore, isValid, startOfDay } from 'date-fns';
import { isTechnicalInspectionRequired } from './isTechnicalInspectionRequired';
import { PRICING } from '../config/pricing';

const FULL_NAME_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)+$/;
const DOCUMENT_RE = /^\d{6,10}$/;
const PHONE_RE = /^3\d{9}$/;
const LICENSE_RE = /^\d{5,15}$/;
const PLATE_RE = /^[A-Z]{3}\d{3}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const BRAND_MODEL_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]+(?:[ -]?[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]+)*$/;
const PASSWORD_STRENGTH_RE = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñÜü])(?=.*\d).+$/;

const DOCUMENT_MAX_LENGTH = 10;
const DOCUMENT_MIN_LENGTH = 6;
const PHONE_MAX_LENGTH = 10;
const LICENSE_MAX_LENGTH = 15;
const LICENSE_MIN_LENGTH = 5;
const PLATE_MAX_LENGTH = 6;
const FULL_NAME_MAX_LENGTH = 50;
const FULL_NAME_MIN_WORDS = 2;
const BRAND_MODEL_MAX_LENGTH = 30;
const EMAIL_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 64;
const YEAR_LOOKBACK = 30;
const PASSENGER_CAPACITY_MAX = 8;
const XL_MIN_CAPACITY = 6;

/**
 * Keeps only digits up to the given length.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function digitsOnly(value, maxLength) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength);
}

/**
 * Keeps plate characters (letters + digits) uppercased and truncated.
 * @param {string} value
 * @returns {string}
 */
export function sanitizePlateInput(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, PLATE_MAX_LENGTH);
}

/**
 * Normalizes free-text name/brand fields for controlled typing.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeTextInput(value, maxLength) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateFullName(value) {
  const trimmed = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'El nombre es obligatorio';
  if (trimmed.length > FULL_NAME_MAX_LENGTH) {
    return `Máximo ${FULL_NAME_MAX_LENGTH} caracteres`;
  }
  const words = trimmed.split(' ');
  if (words.length < FULL_NAME_MIN_WORDS) {
    return 'Ingresa nombre y apellido';
  }
  return FULL_NAME_RE.test(trimmed)
    ? null
    : 'Solo letras y un espacio entre palabras';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateDocumentNumber(value) {
  const digits = digitsOnly(value, DOCUMENT_MAX_LENGTH);
  if (!digits) return 'El documento es obligatorio';
  if (digits.length < DOCUMENT_MIN_LENGTH || digits.length > DOCUMENT_MAX_LENGTH) {
    return `Debe tener entre ${DOCUMENT_MIN_LENGTH} y ${DOCUMENT_MAX_LENGTH} dígitos`;
  }
  return DOCUMENT_RE.test(digits) ? null : 'Solo se permiten dígitos';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validatePhone(value) {
  const digits = digitsOnly(value, PHONE_MAX_LENGTH);
  if (!digits) return 'El celular es obligatorio';
  if (digits.length !== PHONE_MAX_LENGTH) {
    return `Debe tener exactamente ${PHONE_MAX_LENGTH} dígitos`;
  }
  return PHONE_RE.test(digits)
    ? null
    : 'Celular inválido (debe iniciar en 3)';
}

/**
 * @param {Date|string|null} value
 * @returns {string|null}
 */
export function validateBirthDate(value) {
  if (!value) return 'La fecha de nacimiento es obligatoria';
  const birth = new Date(value);
  if (!isValid(birth)) return 'Fecha de nacimiento inválida';
  const today = startOfDay(new Date());
  if (isAfter(startOfDay(birth), today)) {
    return 'La fecha de nacimiento no puede ser futura';
  }
  const age = differenceInYears(new Date(), birth);
  if (age > 90) return 'Fecha de nacimiento fuera de rango';
  return age >= 18 ? null : 'Debes ser mayor de 18 años';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateEmail(value) {
  const trimmed = (value ?? '').trim().toLowerCase();
  if (!trimmed) return 'El correo es obligatorio';
  if (trimmed.length > EMAIL_MAX_LENGTH) return 'Correo demasiado largo';
  return EMAIL_RE.test(trimmed) ? null : 'Correo inválido (ej. nombre@dominio.com)';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validatePassword(value) {
  const password = value ?? '';
  if (!password.trim()) return 'La contraseña es obligatoria';
  if (/\s/.test(password)) return 'La contraseña no puede tener espacios';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Máximo ${PASSWORD_MAX_LENGTH} caracteres`;
  }
  return PASSWORD_STRENGTH_RE.test(password)
    ? null
    : 'Debe incluir al menos una letra y un número';
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validatePlate(value) {
  const plate = sanitizePlateInput(value);
  if (!plate) return 'La placa es obligatoria';
  if (plate.length < PLATE_MAX_LENGTH) {
    return 'Formato inválido (ABC123)';
  }
  return PLATE_RE.test(plate) ? null : 'Formato inválido (ABC123)';
}

/**
 * @param {string} value
 * @param {string} label
 * @returns {string|null}
 */
export function validateBrandOrModel(value, label) {
  const trimmed = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return `${label} es obligatorio`;
  if (trimmed.length > BRAND_MODEL_MAX_LENGTH) {
    return `${label}: máximo ${BRAND_MODEL_MAX_LENGTH} caracteres`;
  }
  return BRAND_MODEL_RE.test(trimmed)
    ? null
    : `${label}: solo letras, números, espacios o guiones`;
}

/**
 * @param {number|string} value
 * @returns {string|null}
 */
export function validateYear(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'El año es obligatorio';
  }
  const year = Number(value);
  const current = new Date().getFullYear();
  const minYear = current - YEAR_LOOKBACK;
  if (!Number.isInteger(year) || String(value).trim().length !== 4) {
    return 'El año debe tener 4 dígitos';
  }
  if (year < minYear) return `El año no puede ser anterior a ${minYear}`;
  return year <= current + 1
    ? null
    : `El año del modelo no puede ser mayor a ${current + 1}`;
}

/**
 * @param {Date|string|null} registrationDate
 * @param {number} modelYear
 * @returns {string|null}
 */
export function validateRegistrationDate(registrationDate, modelYear) {
  if (!registrationDate) return 'La fecha de matrícula es obligatoria';
  const date = startOfDay(new Date(registrationDate));
  if (!isValid(date)) return 'Fecha de matrícula inválida';
  const today = startOfDay(new Date());
  if (isAfter(date, today)) return 'No puede ser futura';
  const year = Number(modelYear);
  if (!Number.isInteger(year)) return 'Selecciona primero el año del vehículo';
  const earliest = new Date(year - 1, 0, 1);
  return isBefore(date, earliest)
    ? `No puede ser anterior al 1 ene ${year - 1}`
    : null;
}

/**
 * @param {string} category
 * @param {number|string} capacity
 * @returns {string|null}
 */
export function validatePassengerCapacity(category, capacity) {
  if (!(category ?? '').trim()) return 'Selecciona primero la categoría';
  if (capacity === null || capacity === undefined || String(capacity).trim() === '') {
    return 'La capacidad es obligatoria';
  }
  const n = Number(capacity);
  if (!Number.isInteger(n) || n < 1) return 'Capacidad inválida';
  if (n > PASSENGER_CAPACITY_MAX) {
    return `La capacidad máxima es ${PASSENGER_CAPACITY_MAX} pasajeros`;
  }
  return category === 'xl' && n < XL_MIN_CAPACITY
    ? `XL requiere mínimo ${XL_MIN_CAPACITY} pasajeros`
    : null;
}

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateLicenseNumber(value) {
  const digits = digitsOnly(value, LICENSE_MAX_LENGTH);
  if (!digits) return 'Número de licencia obligatorio';
  if (digits.length < LICENSE_MIN_LENGTH || digits.length > LICENSE_MAX_LENGTH) {
    return `Debe tener entre ${LICENSE_MIN_LENGTH} y ${LICENSE_MAX_LENGTH} dígitos`;
  }
  return LICENSE_RE.test(digits) ? null : 'Solo se permiten dígitos';
}

/**
 * @param {Date|string|null} expiresAt
 * @param {string} label
 * @returns {string|null}
 */
export function validateFutureExpiry(expiresAt, label) {
  if (!expiresAt) return `${label} es obligatorio`;
  const date = startOfDay(new Date(expiresAt));
  if (!isValid(date)) return `${label} inválido`;
  return isAfter(date, startOfDay(new Date()))
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
  const licenseNumberErr = validateLicenseNumber(documents?.driverLicense?.number ?? '');
  if (licenseNumberErr) errors.licenseNumber = licenseNumberErr;
  if (!documents?.driverLicense?.photoUrl) errors.licensePhoto = 'Foto de licencia obligatoria';
  const licenseErr = validateFutureExpiry(documents?.driverLicense?.expiresAt, 'Licencia');
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
    errors.terms = `Debes aceptar los Términos y Condiciones (comisión ${PRICING.commissionRate * 100} %)`;
  }
  return errors;
}

export {
  BRAND_MODEL_MAX_LENGTH,
  DOCUMENT_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  EMAIL_RE,
  FULL_NAME_MAX_LENGTH,
  LICENSE_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PLATE_MAX_LENGTH,
  PLATE_RE,
};

// AI-assisted: see docs/AI_LOG.md #31

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
];

export const CATEGORY_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'xl', label: 'XL' },
  { value: 'premium', label: 'Premium' },
];

export const COLOR_OPTIONS = [
  { value: 'blanco', label: 'Blanco' },
  { value: 'negro', label: 'Negro' },
  { value: 'gris', label: 'Gris' },
  { value: 'plata', label: 'Plata' },
  { value: 'rojo', label: 'Rojo' },
  { value: 'azul', label: 'Azul' },
  { value: 'verde', label: 'Verde' },
  { value: 'amarillo', label: 'Amarillo' },
  { value: 'naranja', label: 'Naranja' },
  { value: 'beige', label: 'Beige' },
];

/**
 * @returns {{ value: string, label: string }[]}
 */
export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 30; year -= 1) {
    years.push({ value: String(year), label: String(year) });
  }
  return years;
}

/**
 * @param {string} category
 * @returns {{ value: string, label: string }[]}
 */
export function getCapacityOptions(category) {
  const min = category === 'xl' ? 6 : 2;
  const options = [];
  for (let capacity = min; capacity <= 8; capacity += 1) {
    options.push({ value: String(capacity), label: String(capacity) });
  }
  return options;
}

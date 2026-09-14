const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

function parseHours(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function validateHours(value, field, errors, values) {
  if (value === undefined) return;
  if (Number.isNaN(value)) {
    errors[field] = 'Must be a valid number';
    return;
  }
  if (value < 0) {
    errors[field] = 'Cannot be negative';
    return;
  }
  values[field] = value;
}

function validateColor(value, errors, values) {
  if (value === undefined) return;
  const color = typeof value === 'string' ? value.trim() : value;
  if (color === '' || color === null) {
    values.color = null;
    return;
  }
  if (!HEX_COLOR_REGEX.test(color)) {
    errors.color = 'Color must be a valid hex color like #7c3aed';
    return;
  }
  values.color = color;
}

function validateName(value, errors, values, { required }) {
  const name = typeof value === 'string' ? value.trim() : value;
  if (name === undefined || name === '') {
    if (required) {
      errors.name = 'Subject name is required';
      return;
    }
    errors.name = 'Name cannot be empty';
    return;
  }
  if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
    return;
  }
  values.name = name;
}

function validateDescription(value, errors, values) {
  if (value === undefined) return;
  const description = typeof value === 'string' ? value.trim() : value;
  if (description === '') {
    values.description = '';
    return;
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    return;
  }
  values.description = description;
}

export function validateSubjectCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateName(body.name, errors, values, { required: true });
  validateDescription(body.description, errors, values);
  validateColor(body.color, errors, values);
  validateHours(parseHours(body.targetHours), 'targetHours', errors, values);
  validateHours(parseHours(body.completedHours), 'completedHours', errors, values);

  return { errors, values };
}

export function validateSubjectUpdateInput(body = {}) {
  const errors = {};
  const values = {};

  if ('name' in body) validateName(body.name, errors, values, { required: true });
  if ('description' in body) validateDescription(body.description, errors, values);
  if ('color' in body) validateColor(body.color, errors, values);
  if ('targetHours' in body) validateHours(parseHours(body.targetHours), 'targetHours', errors, values);
  if ('completedHours' in body) validateHours(parseHours(body.completedHours), 'completedHours', errors, values);

  return { errors, values };
}
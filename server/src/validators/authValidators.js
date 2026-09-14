const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeName(value) {
  return typeof value === 'string' ? value.trim() : value;
}

export function validateRegisterInput(body) {
  const errors = {};

  const name = normalizeName(body?.name);
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length > 60) {
    errors.name = 'Name cannot exceed 60 characters';
  }

  const email = normalizeEmail(body?.email);
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  const password = body?.password;
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return { errors, values: { name, email, password } };
}

export function validateLoginInput(body) {
  const errors = {};

  const email = normalizeEmail(body?.email);
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  const password = body?.password;
  if (!password) {
    errors.password = 'Password is required';
  }

  return { errors, values: { email, password } };
}
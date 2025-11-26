/**
 * Email validation regex pattern
 * Validates standard email format: user@domain.com
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex pattern
 * Validates international phone format: +1234567890 or 1234567890
 * Allows 7-15 digits after optional + sign
 */
export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

/**
 * Validates email format using regex
 * @param email - Email string to validate
 * @returns true if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates phone number format using regex
 * Removes spaces and validates international format
 * @param phone - Phone string to validate
 * @returns true if phone is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s/g, '');
  return PHONE_REGEX.test(cleaned);
};

/**
 * Gets validation error message for email
 * @param email - Email string to validate
 * @returns Error message if invalid, null if valid
 */
export const getEmailValidationError = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Gets validation error message for phone
 * @param phone - Phone string to validate
 * @returns Error message if invalid, null if valid
 */
export const getPhoneValidationError = (phone: string): string | null => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  if (!isValidPhone(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};


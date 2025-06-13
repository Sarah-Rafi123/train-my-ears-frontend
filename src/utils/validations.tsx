export interface ValidationErrors {
  name?: string
  email?: string
  password?: string
}

export const validateRegistrationForm = (
  name: string,
  email: string,
  password: string
): ValidationErrors => {
  const errors: ValidationErrors = {}

  // Name validation
  if (!name.trim()) {
    errors.name = 'Name is required'
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  } else if (name.trim().length > 50) {
    errors.name = 'Name must be less than 50 characters'
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  // Password validation
  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }

  return errors
}

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0
}
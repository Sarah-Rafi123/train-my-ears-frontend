export interface LoginValidationErrors {
  email?: string
  password?: string
}

export const validateLoginForm = (
  email: string,
  password: string
): LoginValidationErrors => {
  const errors: LoginValidationErrors = {}

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
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long'
  }

  return errors
}

export const hasLoginValidationErrors = (errors: LoginValidationErrors): boolean => {
  return Object.keys(errors).length > 0
}
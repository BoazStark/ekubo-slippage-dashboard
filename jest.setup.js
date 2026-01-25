// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Ensure React is in development mode for tests
// This prevents "act(...) is not supported in production builds" errors
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = 'test'
}

// Production-safe runtime configuration.
// Set window.INDO_API_BASE_URL before app startup when the frontend and backend
// are deployed on different origins. Falls back to /api for same-origin hosting.

export const API_BASE_URL = globalThis.INDO_API_BASE_URL || "/api";

/**
 * Central configuration of the application.
 * All environment variables are externalized here to avoid redundant access.
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";

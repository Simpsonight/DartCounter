/**
 * Services Layer
 *
 * This directory contains all external service integrations and data synchronization logic.
 * Services abstract away the implementation details of external APIs from the rest of the application.
 *
 * Structure:
 * - /supabase - Supabase client, authentication, and database operations
 * - /sync - Offline-first synchronization logic between IndexedDB and Supabase
 *
 * Usage:
 * Services should be injected via composables or directly imported where needed.
 * They should handle all API communication, error handling, and data transformation.
 */

// Re-export all services for convenient imports
export * from './supabase'
export * from './sync'

import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a string's length with both minimum and maximum constraints.
 * @param value - The string value to validate
 * @param minLength - Minimum required length (default: 1)
 * @param maxLength - Maximum allowed length
 * @param fieldName - Human-readable field name for error messages
 * @returns Error message string or null if valid
 */
export const validateStringLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string,
): string | null => {
  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return `${fieldName} is required`;
  }

  if (trimmedValue.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }

  return null;
};

/**
 * Validates that an end time is after a start time.
 * @param startTime - ISO date string for start time
 * @param endTime - ISO date string for end time
 * @returns Error message string or null if valid
 */
export const validateTimeRange = (startTime: string, endTime: string): string | null => {
  // Don't validate if either field is empty (let required validation handle that)
  if (!startTime || !endTime) {
    return null;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Validate that date parsing succeeded
  if (Number.isNaN(start.getTime())) {
    return "Invalid start time format";
  }

  if (Number.isNaN(end.getTime())) {
    return "Invalid end time format";
  }

  if (end <= start) {
    return "End time must be after start time";
  }

  return null;
};

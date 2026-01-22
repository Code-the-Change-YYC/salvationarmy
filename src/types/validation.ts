import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nameRegex =
  /^(?!.*\s{2})[A-Za-z0-9][A-Za-z0-9\s]*[A-Za-z0-9][A-Za-z0-9\s]*[A-Za-z0-9]$/;

export const isoTimeRegex = /^\+\d{5,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-07:00$/; //ISO timestamp regex in MST for 5+ digit years

export const isoTimeRegexFourDigitYears = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-07:00$/; //ISO timestamp regex in MST for 4 digit years

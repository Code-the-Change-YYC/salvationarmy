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

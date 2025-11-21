import { Resend } from "resend";
import { env } from "@/env";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

const conn = globalForResend.resend ?? new Resend(env.RESEND_API_KEY);
if (env.NODE_ENV !== "production") globalForResend.resend = conn;

export const resend = conn;

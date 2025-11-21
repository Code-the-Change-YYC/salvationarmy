import { Resend } from "resend";
import { env } from "@/env";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

// need this for ci build
const apiKey = env.RESEND_API_KEY ?? "placeholder";

const conn = globalForResend.resend ?? new Resend(apiKey);
if (env.NODE_ENV !== "production") globalForResend.resend = conn;

export const resend = conn;

export const runtime = "nodejs";

import { z } from "zod";
import { prisma } from "@/server/db/client";
import { hashPassword } from "@/server/lib/password";
import { otpRateLimiter } from "@/lib/rateLimiter";
import { logger } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST() {
  return Response.json(
    { error: "FORBIDDEN", message: "Registration is disabled" },
    { status: 403 },
  );
}

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function getOrCreateSessionKey() {
  const cookieStore = cookies();
  const existing = cookieStore.get("sessionKey")?.value;
  if (existing) return existing;
  const sessionKey = randomUUID();
  cookieStore.set("sessionKey", sessionKey, { httpOnly: true, sameSite: "lax", path: "/" });
  await prisma.userSession.upsert({
    where: { sessionKey },
    update: {},
    create: { sessionKey }
  });
  return sessionKey;
}

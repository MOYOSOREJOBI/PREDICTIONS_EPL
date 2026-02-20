import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export function getOrCreateSessionKey() {
  const c = cookies();
  const existing = c.get("sessionKey")?.value;
  if (existing) return existing;
  const key = randomUUID();
  c.set("sessionKey", key, { httpOnly: true, sameSite: "lax", path: "/" });
  return key;
}

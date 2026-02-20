import { NextResponse } from "next/server";
import { artifacts } from "@/lib/artifacts";

export async function GET() {
  return NextResponse.json({ ok: true, ...artifacts.teams });
}

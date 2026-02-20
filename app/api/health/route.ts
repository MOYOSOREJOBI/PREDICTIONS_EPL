import { NextResponse } from "next/server";
import { artifacts } from "@/lib/artifacts";

export async function GET() {
  return NextResponse.json({ ok: true, modelUpdatedAt: artifacts.model.updatedAt, dataUpdatedAt: artifacts.metadata.updatedAt });
}

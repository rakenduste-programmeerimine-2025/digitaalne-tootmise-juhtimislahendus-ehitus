import { NextRequest, NextResponse } from "next/server";
import { sessions, profiles, users } from "@/lib/memoryDb";

export async function GET(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("User not found");

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

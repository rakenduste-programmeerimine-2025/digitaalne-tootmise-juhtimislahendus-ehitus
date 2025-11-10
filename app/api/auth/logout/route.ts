import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/memoryDb";

export async function POST(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index !== -1) sessions.splice(index, 1);

    const response = NextResponse.json(
      { message: "[oAuth] User logged out successfully." },
      { status: 200 }
    );
    response.cookies.delete("sid");

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

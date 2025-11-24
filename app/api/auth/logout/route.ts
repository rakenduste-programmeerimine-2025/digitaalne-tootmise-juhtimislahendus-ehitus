import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const { error } = await supabase.from("sessions").delete().eq("id", sid);

    if (error) {
      console.error("Logout error:", error);
    }

    const response = NextResponse.json(
      { message: "User logged out successfully." },
      { status: 200 }
    );
    response.cookies.delete("sid");

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

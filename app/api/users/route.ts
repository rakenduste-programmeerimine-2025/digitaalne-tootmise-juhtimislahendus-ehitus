import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("id", sid)
      .single();

    if (!session) throw new Error("Session not found");

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user_id)
      .single();

    if (!user) throw new Error("User not found");
    
    const { data: profiles, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, is_active, created_at, activated_at, deleted_at");

    if (error) throw error;

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

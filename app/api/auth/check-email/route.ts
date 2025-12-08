import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("email", email)
      .single();

    if (user) {
      return NextResponse.json({ status: "exists", user });
    }

    const { data: invite } = await supabase
      .from("invited_users")
      .select("*")
      .eq("email", email)
      .gt("expire_at", new Date().toISOString())
      .limit(1)
      .single();

    if (invite) {
      return NextResponse.json({ status: "invited", invite });
    }

    return NextResponse.json({ status: "unknown" });
  } catch (err: unknown) {
    console.error("Check email error:", err);
    return NextResponse.json({ status: "unknown" }); 
  }
}

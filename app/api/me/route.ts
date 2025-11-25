import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
    const sid = req.cookies.get("sid")?.value;

    if (!sid) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*, users(*)")
        .eq("id", sid)
        .single();

    if (sessionError || !session) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const now = new Date();
    const expires = new Date(session.expires);

    if (now > expires) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json({
        user: session.users,
    });
}

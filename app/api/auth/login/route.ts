import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      const errorMessage = "Invalid JSON body";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sid = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({ id: sid, user_id: user.id, expires });

    if (sessionError) {
      console.log(sessionError);
      throw new Error("Failed to create session");
    }

    const { data: userScopes } = await supabase
      .from("users_scopes")
      .select("scope_id, scopes(scope)")
      .eq("user_id", user.id);

    const scopes = userScopes?.map((us: any) => us.scopes?.scope) || [];

    const response = NextResponse.json(
      {
        message: "User logged in successfully.",
        data: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          scopes: scopes,
        },
      },
      { status: 200 }
    );

    response.cookies.set("sid", sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    console.log(err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}

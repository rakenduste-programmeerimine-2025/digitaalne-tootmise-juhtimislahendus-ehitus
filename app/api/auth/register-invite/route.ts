import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcrypt";
import { ROLE_IDS } from "@/lib/roles";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, inviteId } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: invite } = await supabase
      .from("invited_users")
      .select("*")
      .eq("email", email)
      .gt("expire_at", new Date().toISOString())
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
            email,
            password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            is_active: true,
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) {
        if (createError.code === '23505') {
             return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        throw createError;
    }

    const { error: linkError } = await supabase
        .from("users_in_organizations")
        .insert({
            user_id: newUser.id,
            organization_id: invite.organization_id
        });

    if (linkError) throw linkError;

    const { error: roleError } = await supabase
        .from("user_company_roles")
        .insert({
            user_id: newUser.id,
            organization_id: invite.organization_id,
            role_id: invite.role_id || ROLE_IDS.ORG_USER
        });
    
    if (roleError) throw roleError;

    await supabase.from("invited_users").delete().eq("id", invite.id);

    const sid = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({ id: sid, user_id: newUser.id, expires });

    if (sessionError) throw sessionError;

    const response = NextResponse.json(
      {
        message: "Registration successful",
        data: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
        }
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
    console.error("Register invite error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

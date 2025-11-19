import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { users, sessions, scopes } from "@/lib/memoryDb";
import jsonwebtoken from "jsonwebtoken";

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
    const user = users.find(
      (u) => u.email === email && u.password === password && u.is_active
    );
    if (!user) throw new Error("Invalid credentials");

    const sid = "session1";
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    sessions.push({ sid, userId: user.id, expires });

    //tbd: add jwt token that stores user session.

    const response = NextResponse.json(
      {
        message: "User logged in successfully.",
        data: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          scopes: scopes.map((s) => s.scope),
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

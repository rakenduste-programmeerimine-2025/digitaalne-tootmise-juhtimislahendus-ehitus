import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { users, sessions } from "@/lib/memoryDb";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = users.find(
      (u) => u.email === email && u.password === password && u.is_active
    );
    if (!user) throw new Error("Invalid credentials");

    const sid = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    sessions.push({ sid, userId: user.id, expires });

    const response = NextResponse.json(
      {
        message: "[oAuth] User logged in successfully.",
        data: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        }, // hash?
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
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}

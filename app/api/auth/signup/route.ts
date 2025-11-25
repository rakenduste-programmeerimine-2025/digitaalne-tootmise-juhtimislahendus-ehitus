import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { firstName, lastName, email, password, orgName } = body ?? {};

        if (!firstName || !lastName || !email || !password || !orgName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: userError } = await supabase
            .from("users")
            .insert({
                first_name: firstName,
                last_name: lastName,
                email,
                password: hashedPassword,
                is_active: true,
            })
            .select()
            .single();

        if (userError) {
            console.error("User creation error:", userError);
            return NextResponse.json(
                { error: "Failed to create user. Email might be taken." },
                { status: 400 }
            );
        }

        const { data: newOrg, error: orgError } = await supabase
            .from("organizations")
            .insert({
                name: orgName,
                owner_id: newUser.id,
            })
            .select()
            .single();

        if (orgError) {
            console.error("Organization creation error:", orgError);
            return NextResponse.json(
                { error: "Failed to create organization" },
                { status: 500 }
            );
        }

        const { error: linkError } = await supabase
            .from("users_in_organizations")
            .insert({
                user_id: newUser.id,
                organization_id: newOrg.id,
            });

        if (linkError) {
            console.error("Link user-org error:", linkError);
            return NextResponse.json(
                { error: "Failed to link user to organization" },
                { status: 500 }
            );
        }

        const sid = crypto.randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { error: sessionError } = await supabase
            .from("sessions")
            .insert({ id: sid, user_id: newUser.id, expires });

        if (sessionError) {
            console.error("Session creation error:", sessionError);
            return NextResponse.json(
                { error: "Failed to create session" },
                { status: 500 }
            );
        }

        const response = NextResponse.json(
            {
                message: "User registered successfully",
                data: {
                    user: newUser,
                    organization: newOrg,
                },
            },
            { status: 201 }
        );

        response.cookies.set("sid", sid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60,
        });

        return response;

    } catch (err: unknown) {
        console.error("Signup error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

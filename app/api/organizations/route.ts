import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

async function getUserFromSession(req: NextRequest) {
  const sid = req.cookies.get("sid")?.value;
  if (!sid) return null;

  const { data: session } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("id", sid)
    .single();

  if (!session) return null;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user_id)
    .single();

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const { data: userOrganizations, error } = await supabase
      .from("users_in_organizations")
      .select("organization_id, organizations(*)")
      .eq("user_id", user.id);

    if (error) throw error;

    const organizations = userOrganizations.map((uo: any) => uo.organizations);

    return NextResponse.json(
      { organizations },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name } = body ?? {};
    if (!name)
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );

    const { data: newOrganization, error: orgError } = await supabase
      .from("organizations")
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (orgError) throw orgError;

    const { error: linkError } = await supabase
      .from("users_in_organizations")
      .insert({ user_id: user.id, organization_id: newOrganization.id });

    if (linkError) throw linkError;

    return NextResponse.json(
      { organization: newOrganization },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id, name } = body ?? {};
    if (!id)
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    if (!name)
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (!org) throw new Error("Organization not found");

    if (org.owner_id !== user.id)
      throw new Error("Only the owner can update the organization");

    const { data: updatedOrg, error } = await supabase
      .from("organizations")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { organization: updatedOrg },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id } = body ?? {};
    if (!id)
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (!org) throw new Error("Organization not found");

    if (org.owner_id !== user.id)
      throw new Error("Only the owner can delete the organization");

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Organization deleted" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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

async function hasScope(userId: string, scopeId: number) {
  const { data } = await supabase
    .from("users_scopes")
    .select("id")
    .eq("user_id", userId)
    .eq("scope_id", scopeId)
    .single();
  return !!data;
}

async function isMember(userId: string, organizationId: number) {
  const { data } = await supabase
    .from("users_in_organizations")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();
  return !!data;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const { searchParams } = new URL(req.url);
    const organizationIdStr = searchParams.get("organizationId");
    if (!organizationIdStr) throw new Error("Missing organizationId parameter");
    const organizationId = parseInt(organizationIdStr);

    if (!(await isMember(user.id, organizationId))) {
      throw new Error("User is not a member of the organization");
    }

    const { data: orgProjects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId);

    if (error) throw error;

    return NextResponse.json({ projects: orgProjects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const { name, organizationId } = body;
    if (!name) throw new Error("Missing project name");
    if (!organizationId) throw new Error("Missing organizationId");
    if (!(await hasScope(user.id, 6)))
      throw new Error("Access denied: insufficient scopes");

    if (!(await isMember(user.id, organizationId))) {
      throw new Error("User is not a member of the organization");
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({ name, organization_id: organizationId, status: "active" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const { searchParams } = new URL(req.url);
    const projectIdStr = searchParams.get("projectId");
    if (!projectIdStr) throw new Error("Missing projectId parameter");
    const projectId = parseInt(projectIdStr);

    const { data: currentProject } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!currentProject) throw new Error("Project not found");

    if (!(await isMember(user.id, currentProject.organization_id))) {
      throw new Error("User is not a member of the organization");
    }

    const updates = await req.json();
    const { name } = updates;

    const { data: project, error } = await supabase
      .from("projects")
      .update({ name })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");
    if (!(await hasScope(user.id, 6)))
      throw new Error("Insufficient scopes to delete project");

    const { searchParams } = new URL(req.url);
    const projectIdStr = searchParams.get("projectId");
    if (!projectIdStr) throw new Error("Missing projectId parameter");
    const projectId = parseInt(projectIdStr);

    const { data: currentProject } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!currentProject) throw new Error("Project not found");
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

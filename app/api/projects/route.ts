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

async function getCompanyRole(userId: string, organizationId: number) {
  const { data } = await supabase
    .from("user_company_roles")
    .select("role_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();
  return data?.role_id;
}

async function getProjectRole(userId: string, projectId: number) {
  const { data } = await supabase
    .from("user_project_roles")
    .select("role_id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single();
  return data?.role_id;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const { searchParams } = new URL(req.url);
    const organizationIdStr = searchParams.get("organizationId");

    if (!organizationIdStr) {
      throw new Error("Missing organizationId parameter");
    }

    const organizationId = parseInt(organizationIdStr);
    const companyRole = await getCompanyRole(user.id, organizationId);

    let projects;

    if (companyRole === 1 || companyRole === 2) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId);
      if (error) throw error;
      projects = data;
    } else {
      const { data, error } = await supabase
        .from("projects")
        .select("*, user_project_roles!inner(role_id)")
        .eq("organization_id", organizationId)
        .eq("user_project_roles.user_id", user.id);

      if (error) throw error;
      projects = data;
    }

    return NextResponse.json({ projects });
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

    const companyRole = await getCompanyRole(user.id, organizationId);
    if (companyRole !== 1 && companyRole !== 2) {
      throw new Error("Access denied: Only Company Owner or Admin can create projects");
    }
    const { data: project, error: createError } = await supabase
      .from("projects")
      .insert({ name, organization_id: organizationId, status: "Active" })
      .select()
      .single();

    if (createError) throw createError;

    const { error: roleError } = await supabase
      .from("user_project_roles")
      .insert({
        user_id: user.id,
        project_id: project.id,
        role_id: 4 
      });

    if (roleError) {
      throw roleError;
      throw roleError;
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    console.log(err);
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

    const companyRole = await getCompanyRole(user.id, currentProject.organization_id);
    const projectRole = await getProjectRole(user.id, projectId);

    if (companyRole !== 1 && companyRole !== 2 && projectRole !== 4 && projectRole !== 5) {
      throw new Error("Insufficient permissions to update project");
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

    const companyRole = await getCompanyRole(user.id, currentProject.organization_id);
    const projectRole = await getProjectRole(user.id, projectId);

    if (companyRole !== 1 && companyRole !== 2 && projectRole !== 4) {
      throw new Error("Insufficient permissions to delete project");
    }

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

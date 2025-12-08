import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { ROLE_IDS, canManageProjectUsers } from "@/lib/roles";

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

async function getProjectRole(userId: string, projectId: number) {
  const { data } = await supabase
    .from("user_project_roles")
    .select("role_id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single();
  return data?.role_id;
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


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const projectIdInt = parseInt(id);

    const { data: project } = await supabase
        .from("projects")
        .select("organization_id")
        .eq("id", projectIdInt)
        .single();
    
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectRole = await getProjectRole(user.id, projectIdInt);

    if (!projectRole) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: users, error } = await supabase
      .from("user_project_roles")
      .select(`
        role_id,
        user_id,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("project_id", projectIdInt);

    if (error) throw error;

    const formattedUsers = users.map((u: any) => ({
      id: u.users.id,
      first_name: u.users.first_name,
      last_name: u.users.last_name,
      email: u.users.email,
      role_id: u.role_id,
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const projectIdInt = parseInt(id);

    const { userId, roleId } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const projectRole = await getProjectRole(user.id, projectIdInt);

    if (!canManageProjectUsers(projectRole)) {
         return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { data: project } = await supabase.from("projects").select("organization_id").eq("id", projectIdInt).single();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    
    const targetUserOrgRole = await getCompanyRole(userId, project.organization_id);

    if (!targetUserOrgRole) {
         return NextResponse.json({ error: "User must be a member of the organization first" }, { status: 400 });
    }

    const existingRole = await getProjectRole(userId, projectIdInt);
    if (existingRole) {
        return NextResponse.json({ error: "User already in project" }, { status: 400 });
    }

    const { error } = await supabase
        .from("user_project_roles")
        .insert({
            user_id: userId,
            project_id: projectIdInt,
            role_id: roleId || ROLE_IDS.ENGINEER
        });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserFromSession(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const projectIdInt = parseInt(id);

        const projectRole = await getProjectRole(user.id, projectIdInt);
        if (!canManageProjectUsers(projectRole)) {
             return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { userId, roleId } = await req.json();

        const { data: project } = await supabase.from("projects").select("organization_id").eq("id", projectIdInt).single();
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
        
        const targetUserOrgRole = await getCompanyRole(userId, project.organization_id);

        if (targetUserOrgRole === ROLE_IDS.ORG_OWNER || targetUserOrgRole === ROLE_IDS.ORG_ADMIN) {
             if (roleId !== ROLE_IDS.PROJECT_ADMIN) {
                 return NextResponse.json({ error: "Org Owner/Admins must retain Project Admin role" }, { status: 403 });
             }
        }

        const { error } = await supabase
            .from("user_project_roles")
            .update({ role_id: roleId })
            .eq("user_id", userId)
            .eq("project_id", projectIdInt);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserFromSession(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const projectIdInt = parseInt(id);

        const projectRole = await getProjectRole(user.id, projectIdInt);
        if (!canManageProjectUsers(projectRole)) {
             return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { userId } = await req.json();

        const { data: project } = await supabase.from("projects").select("organization_id").eq("id", projectIdInt).single();
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
        
        const targetUserOrgRole = await getCompanyRole(userId, project.organization_id);

        if (targetUserOrgRole === ROLE_IDS.ORG_OWNER || targetUserOrgRole === ROLE_IDS.ORG_ADMIN) {
             return NextResponse.json({ error: "Cannot remove Org Owner/Admin from project" }, { status: 403 });
        }

        const { error } = await supabase
            .from("user_project_roles")
            .delete()
            .eq("user_id", userId)
            .eq("project_id", projectIdInt);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

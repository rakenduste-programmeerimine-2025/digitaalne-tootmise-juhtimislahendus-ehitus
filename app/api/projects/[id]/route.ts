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

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const projectId = parseInt(params.id);
    if (isNaN(projectId)) throw new Error("Invalid project ID");

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !project) throw new Error("Project not found");

    const companyRole = await getCompanyRole(user.id, project.organization_id);
    const projectRole = await getProjectRole(user.id, projectId);

    if (companyRole !== 1 && companyRole !== 2 && !projectRole) {
      throw new Error("Access denied");
    }

    return NextResponse.json({ 
      project,
      user_role: projectRole,
      org_role: companyRole
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

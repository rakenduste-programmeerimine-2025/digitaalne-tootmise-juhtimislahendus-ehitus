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

    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", organizationId);

    if (!projects || projects.length === 0) {
      return NextResponse.json({ project_details: [] });
    }

    const projectIds = projects.map((p) => p.id);

    const { data: details, error } = await supabase
      .from("project_details")
      .select("*")
      .in("project_id", projectIds);

    if (error) throw error;

    return NextResponse.json({ project_details: details });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const { organizationId, projectId } = await req.json();
    if (!organizationId || !projectId) {
      throw new Error("Missing required fields");
    }

    if (!(await isMember(user.id, organizationId))) {
      throw new Error("User is not a member of the organization");
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("organization_id", organizationId)
      .single();

    if (!project) throw new Error("Project not found in the organization");

    const { data: newDetail, error } = await supabase
      .from("project_details")
      .insert({
        project_id: projectId,
        status: "Pending",
        name: "New Detail",
        location: "Unknown",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Project detail added",
      detail: newDetail,
    });
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
    const detailIdStr = searchParams.get("detailId");
    const organizationIdStr = searchParams.get("organizationId");
    if (!detailIdStr || !organizationIdStr)
      throw new Error("Missing required parameters");
    
    const detailId = parseInt(detailIdStr);
    const organizationId = parseInt(organizationIdStr);

    if (!(await isMember(user.id, organizationId))) {
      throw new Error("User is not a member of the organization");
    }

    const { data: detail } = await supabase
      .from("project_details")
      .select("project_id")
      .eq("id", detailId)
      .single();

    if (!detail) throw new Error("Project detail not found");

    const { data: project } = await supabase
      .from("projects")
      .select("organization_id")
      .eq("id", detail.project_id)
      .single();

    if (!project || project.organization_id !== organizationId) {
      throw new Error("Project detail does not belong to the organization");
    }

    const { error } = await supabase
      .from("project_details")
      .delete()
      .eq("id", detailId);

    if (error) throw error;

    return NextResponse.json({ message: "Project detail deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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
    const projectIdStr = searchParams.get("projectId");
    const detailIdStr = searchParams.get("detailId");

    if (!organizationIdStr && !projectIdStr && !detailIdStr) {
        throw new Error("Missing organizationId, projectId, or detailId parameter");
    }

    let organizationId: number;

    if (detailIdStr) {
        const detailId = parseInt(detailIdStr);
        const { data: detail } = await supabase
            .from("project_details")
            .select("*, projects(organization_id)")
            .eq("id", detailId)
            .single();
        
        if (!detail) throw new Error("Detail not found");
        
        organizationId = detail.projects?.organization_id;

        if (!organizationId) throw new Error("Organization not found for this detail");

        if (!(await isMember(user.id, organizationId))) {
            throw new Error("User is not a member of the organization");
        }

        return NextResponse.json({ project_details: [detail] });
    }

    if (projectIdStr) {
        const projectId = parseInt(projectIdStr);
        const { data: project } = await supabase
            .from("projects")
            .select("organization_id")
            .eq("id", projectId)
            .single();
        
        if (!project) throw new Error("Project not found");
        organizationId = project.organization_id;
    } else {
        organizationId = parseInt(organizationIdStr!);
    }

    if (!(await isMember(user.id, organizationId))) {
      throw new Error("User is not a member of the organization");
    }

    let query = supabase.from("projects").select("id").eq("organization_id", organizationId);
    
    if (projectIdStr) {
        query = query.eq("id", parseInt(projectIdStr));
    }

    const { data: projects } = await query;

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

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) throw new Error("Unauthorized");

    const { detailId, newStatus, name, location } = await req.json();

    if (!detailId) {
      throw new Error("Missing detailId");
    }

    const { data: currentDetail } = await supabase
      .from("project_details")
      .select("*, projects(organization_id)")
      .eq("id", detailId)
      .single();

    if (!currentDetail) throw new Error("Detail not found");

    const organizationId = currentDetail.projects?.organization_id;

    if (!organizationId) throw new Error("Organization not found for this detail");

    if (!(await isMember(user.id, organizationId))) {
      throw new Error("User is not a member of the organization");
    }

    const updates: any = {};
    if (newStatus) updates.status = newStatus;
    if (name) updates.name = name;
    if (location) updates.location = location;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ message: "No changes provided" });
    }

    const { data: updatedDetail, error: updateError } = await supabase
      .from("project_details")
      .update(updates)
      .eq("id", detailId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (newStatus && newStatus !== currentDetail.status) {
        const { error: logError } = await supabase
        .from("project_details_log")
        .insert({
            organization_id: organizationId,
            project_id: currentDetail.project_id,
            detail_id: detailId,
            old_status: currentDetail.status,
            new_status: newStatus,
        });

        if (logError) {
            console.error("Failed to create log entry:", logError);
        }
    }

    return NextResponse.json({
      message: "Detail updated",
      detail: updatedDetail,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

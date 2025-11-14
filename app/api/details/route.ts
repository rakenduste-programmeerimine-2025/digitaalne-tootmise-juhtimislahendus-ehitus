import { NextRequest, NextResponse } from "next/server";
import { sessions, project_details, usersInOrganizations, users, projects } from "@/lib/memoryDb";

export async function GET(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("[oAuth] No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("[oAuth] Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("[oAuth] User not found");

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    if (!organizationId) throw new Error("Missing organizationId parameter");

    const isMember = usersInOrganizations.some(
      (uio) => uio.userId === user.id && uio.organizationId === organizationId
    );
    if (!isMember) throw new Error("User is not a member of the organization");

    const organizationProjects = projects.filter(
      (p) => p.organizationId === organizationId
    );

    const details = project_details.filter((detail) =>
      organizationProjects.some((proj) => proj.id === detail.projectId)
    );

    return NextResponse.json({ project_details: details });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

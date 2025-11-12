import { NextRequest, NextResponse } from "next/server";
import { sessions, organizations, usersInOrganizations, users, projects } from "@/lib/memoryDb";

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

    const orgProjects = projects.filter(
      (project) => project.organizationId === organizationId
    );
    return NextResponse.json({ projects: orgProjects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

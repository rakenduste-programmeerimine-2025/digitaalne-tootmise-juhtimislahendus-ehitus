import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  sessions,
  organizations,
  usersInOrganizations,
  users,
  projects,
} from "@/lib/memoryDb";

const userScopesMap: Record<string, number[]> = {
  // user "1" is admin (scope 6)
  "1": [6],
};

function hasScope(userId: string, scopeId: number) {
  const scopes = userScopesMap[userId] ?? [];
  return scopes.includes(scopeId);
}

export async function GET(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("User not found");

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

export async function POST(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("User not found");

    const body = await req.json();
    const { name, organizationId } = body;
    if (!name) throw new Error("Missing project name");
    if (!organizationId) throw new Error("Missing organizationId");

    // require scope 6 to create
    if (!hasScope(user.id, 6))
      throw new Error("Access denied: insufficient scopes");

    const isMember = usersInOrganizations.some(
      (uio) => uio.userId === user.id && uio.organizationId === organizationId
    );
    if (!isMember) throw new Error("User is not a member of the organization");

    const id = crypto.randomUUID();
    const project = { id, name, organizationId };
    projects.push(project);

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("User not found");

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) throw new Error("Missing projectId parameter");

    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) throw new Error("Project not found");

    const project = projects[projectIndex];

    const isMember = usersInOrganizations.some(
      (uio) =>
        uio.userId === user.id && uio.organizationId === project.organizationId
    );
    if (!isMember) throw new Error("User is not a member of the organization");

    const updates = await req.json();
    // allow the editing of name and other simple fields, but not id or organizationId
    if (typeof updates.name === "string") project.name = updates.name;

    projects[projectIndex] = project;
    return NextResponse.json({ project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("User not found");

    // require scope 6 to delete
    if (!hasScope(user.id, 6))
      throw new Error("Insufficient scopes to delete project");

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) throw new Error("Missing projectId parameter");

    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) throw new Error("Project not found");

    const [deleted] = projects.splice(projectIndex, 1);
    return NextResponse.json({ deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

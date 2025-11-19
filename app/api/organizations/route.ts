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

    const userOrganizationsIds = usersInOrganizations
      .filter((uio) => uio.userId === user.id)
      .map((uio) => uio.organizationId);

    const userOrganizations = organizations.filter((org) =>
      userOrganizationsIds.includes(org.id)
    );

    return NextResponse.json({ organizations: userOrganizations }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("[oAuth] No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("[oAuth] Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("[oAuth] User not found");

    const { name } = await req.json();
    if (!name) throw new Error("Organization name is required");

    const newOrganization = {
      id: `org_${Date.now()}`,
      name,
      ownerId: user.id,
    };

    organizations.push(newOrganization);
    usersInOrganizations.push({
      userId: user.id,
      organizationId: newOrganization.id,
    });

    return NextResponse.json({ organization: newOrganization }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("[oAuth] No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("[oAuth] Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("[oAuth] User not found");

    const { id, name } = await req.json();
    if (!id) throw new Error("Organization ID is required");
    if (!name) throw new Error("Organization name is required");

    const orgIndex = organizations.findIndex((org) => org.id === id);
    if (orgIndex === -1) throw new Error("Organization not found");

    if (organizations[orgIndex].ownerId !== user.id)
      throw new Error("Only the owner can update the organization");

    organizations[orgIndex].name = name;

    return NextResponse.json({ organization: organizations[orgIndex] }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sid = req.cookies.get("sid")?.value;
    if (!sid) throw new Error("[oAuth] No session");

    const index = sessions.findIndex((s) => s.sid === sid);
    if (index === -1) throw new Error("[oAuth] Session not found");

    const user = users.find((u) => u.id === sessions[index].userId);
    if (!user) throw new Error("[oAuth] User not found");

    const { id } = await req.json();
    if (!id) throw new Error("Organization ID is required");

    const orgIndex = organizations.findIndex((org) => org.id === id);
    if (orgIndex === -1) throw new Error("Organization not found");

    if (organizations[orgIndex].ownerId !== user.id)
      throw new Error("Only the owner can delete the organization");

    organizations.splice(orgIndex, 1);

    for (let i = usersInOrganizations.length - 1; i >= 0; i--) {
      if (usersInOrganizations[i].organizationId === id) {
        usersInOrganizations.splice(i, 1);
      }
    }

    for (let i = projects.length - 1; i >= 0; i--) {
      if (projects[i].organizationId === id) {
        projects.splice(i, 1);
      }
    }

    return NextResponse.json({ message: "Organization deleted" }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
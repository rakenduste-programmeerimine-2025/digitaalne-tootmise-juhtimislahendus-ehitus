import { NextRequest, NextResponse } from "next/server";
import { sessions, organizations, usersInOrganizations, users } from "@/lib/memoryDb";

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

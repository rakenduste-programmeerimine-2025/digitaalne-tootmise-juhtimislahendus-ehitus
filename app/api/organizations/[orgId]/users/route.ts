import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { ROLE_IDS, canManageOrgUsers } from "@/lib/roles";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    const organizationId = parseInt(orgId);

    const currentUserRole = await getCompanyRole(user.id, organizationId);

    if (!currentUserRole) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: users, error } = await supabase
      .from("user_company_roles")
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
      .eq("organization_id", organizationId);

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    const organizationId = parseInt(orgId);

    const currentUserRole = await getCompanyRole(user.id, organizationId);
    if (!canManageOrgUsers(currentUserRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { email, roleId } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const { data: targetUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!targetUser) {
        const { data: existingInvite } = await supabase
            .from("invited_users")
            .select("id")
            .eq("email", email)
            .eq("organization_id", organizationId)
            .single();

        if (existingInvite) {
            return NextResponse.json({ error: "User already invited" }, { status: 400 });
        }

        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + 7);

        const { error: inviteError } = await supabase
            .from("invited_users")
            .insert({
                email: email,
                organization_id: organizationId,
                role_id: roleId || ROLE_IDS.ORG_USER,
                expire_at: expireAt.toISOString(),
            });

        if (inviteError) throw inviteError;

        return NextResponse.json({ success: true, message: "Invitation sent" });
    }

    const existingRole = await getCompanyRole(targetUser.id, organizationId);
    if (existingRole) {
        return NextResponse.json({ error: "User already in organization" }, { status: 400 });
    }

    const { error: linkError } = await supabase
        .from("users_in_organizations")
        .insert({
            user_id: targetUser.id,
            organization_id: organizationId
        });
    
    if (linkError) throw linkError;

    const { error: roleError } = await supabase
        .from("user_company_roles")
        .insert({
            user_id: targetUser.id,
            organization_id: organizationId,
            role_id: roleId || ROLE_IDS.ORG_USER
        });

    if (roleError) throw roleError;

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
    try {
        const user = await getUserFromSession(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orgId } = await params;
        const organizationId = parseInt(orgId);

        const currentUserRole = await getCompanyRole(user.id, organizationId);
        if (!canManageOrgUsers(currentUserRole)) {
             return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { userId, roleId } = await req.json();

        const targetUserRole = await getCompanyRole(userId, organizationId);
        
        if (targetUserRole === ROLE_IDS.ORG_OWNER) {
             return NextResponse.json({ error: "Cannot modify Organization Owner role" }, { status: 403 });
        }

        const { error } = await supabase
            .from("user_company_roles")
            .update({ role_id: roleId })
            .eq("user_id", userId)
            .eq("organization_id", organizationId);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
    try {
        const user = await getUserFromSession(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orgId } = await params;
        const organizationId = parseInt(orgId);

        const currentUserRole = await getCompanyRole(user.id, organizationId);
        if (!canManageOrgUsers(currentUserRole)) {
             return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const { userId } = await req.json();

        const targetUserRole = await getCompanyRole(userId, organizationId);
        if (targetUserRole === ROLE_IDS.ORG_OWNER) {
             return NextResponse.json({ error: "Cannot remove Organization Owner" }, { status: 403 });
        }

        const { error: roleError } = await supabase
            .from("user_company_roles")
            .delete()
            .eq("user_id", userId)
            .eq("organization_id", organizationId);

        if (roleError) throw roleError;

        const { error: linkError } = await supabase
            .from("users_in_organizations")
            .delete()
            .eq("user_id", userId)
            .eq("organization_id", organizationId);

        if (linkError) throw linkError;

        return NextResponse.json({ success: true });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

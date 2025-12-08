export const ROLE_IDS = {
  ORG_OWNER: 1,
  ORG_ADMIN: 2,
  ORG_USER: 3,

  PROJECT_OWNER: 4,
  PROJECT_ADMIN: 5,
  ENGINEER: 6,
} as const;

export const ROLE_NAMES = {
  [ROLE_IDS.ORG_OWNER]: "Owner",
  [ROLE_IDS.ORG_ADMIN]: "Admin",
  [ROLE_IDS.ORG_USER]: "User",
  [ROLE_IDS.PROJECT_OWNER]: "Project Owner",
  [ROLE_IDS.PROJECT_ADMIN]: "Project Admin",
  [ROLE_IDS.ENGINEER]: "Engineer",
} as const;

export function isOrgAdminOrOwner(roleId: number | null | undefined): boolean {
  return roleId === ROLE_IDS.ORG_OWNER || roleId === ROLE_IDS.ORG_ADMIN;
}

export function isProjectAdminOrOwner(roleId: number | null | undefined): boolean {
  return roleId === ROLE_IDS.PROJECT_OWNER || roleId === ROLE_IDS.PROJECT_ADMIN;
}

export function canManageOrgUsers(roleId: number | null | undefined): boolean {
  return isOrgAdminOrOwner(roleId);
}

export function canManageProjectUsers(roleId: number | null | undefined): boolean {
  return isProjectAdminOrOwner(roleId);
}

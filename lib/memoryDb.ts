interface Session {
  sid: string;
  userId: string;
  expires: Date;
}

export const users = [
  {
    id: "1",
    email: "test@gmail.com",
    first_name: "Fahn",
    last_name: "WhathaFahn",
    password: "password123",
    is_active: true,
  },
];

export const organizations = [
  {
    id: "org1",
    name: "Test Organization",
    ownerId: "1",
  },
];

export const usersInOrganizations: {
  userId: string;
  organizationId: string;
}[] = [
  {
    userId: "1",
    organizationId: "org1",
  },
];

export const projects = [
  {
    id: "proj1",
    name: "Test Project",
    organizationId: "org1",
  },
];

export const project_details = [
  {
    id: "detail1",
    projectId: "proj1",
  },
]

export const sessions: Session[] = [];

export const scopes = [
  { id: 1, scope: "scope1" },
  { id: 2, scope: "scope2" },
  { id: 3, scope: "scope3" },
  { id: 4, scope: "scope4" },
  { id: 5, scope: "scope5" },
  { id: 6, scope: "scope6" },
];

export const profiles = [
  {
    user_id: "1",
    first_name: "Fahn",
    last_name: "WhathaFahn",
    email: "test@gmail.com",
    is_active: true,
    created_at: new Date("2025-01-01T00:00:00Z"),
    activated_at: new Date("2025-01-02T00:00:00Z"),
    deleted_at: null,
  },
];

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

export const usersInOrganizations: { userId: string; organizationId: string }[] = [
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
]

export const sessions: Session[] = [];

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
export const sessions: Session[] = [];

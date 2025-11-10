# FUNCTIONALITY

## Stack:

### Front-end

- next.js
- shadcn ui
- tailwindcss

### Back-end

- express.js
- supabase

### Low-fidelity wireframes (hover to see alt text)

![Landing page](https://raw.githubusercontent.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus/refs/heads/main/LFW/Landing%20page.png)

## Features

### User management

- Login
  - email/password
- Roles
  - Company
    - Company owner
    - Company admin
    - Company regular user (usually project engineer)
  - Project
    - Project owner
    - Project admin
    - Project engineer

### Building/Apartment management

- Company Owner
  - Add projects
  - Create projects
  - Edit projects
  - Delete projects
  - Assign admins
  - Assign users
  - Remove admins
  - Remove users
  - Can reassign ownership status
- Company admin
  - Add projects
  - Create projects
  - Edit projects
  - Delete projects
  - Assign admins
  - Assign users
  - Remove admins
  - Remove users
- Company regular user
  - by default has no company scoped rights, all project scoped rights are inherited from their project role
- Project owner
  - Edit the project
  - Can modify project settings
  - Add users to project
  - Delete users from project
  - Can assign users to project roles
  - Can reassign ownership status
- Project admin
  - Edit the project
  - Can modify project settings
  - Add users to project
  - Delete users from project
  - Can assign users to project roles
- Project engineer
  - Upload new blueprints

## Team Members

- Ksaveri Petrov
- Nikita Vassiljev

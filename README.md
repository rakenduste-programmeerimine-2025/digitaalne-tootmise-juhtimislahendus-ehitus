# Digital Production Management Solution (KNT-tech)

KNT-tech is a modern digital production management solution designed for the construction and manufacturing industry. It streamlines project tracking, inventory management and organizational workflows.

## Features

- **Organization Management**: Create and manage organizations with role-based access control.
- **Project Tracking**: comprehensive project dashboard to track status, details, and progress.
- **Inventory System**: detailed tracking of parts and components with location and status (Ready, In Transit, Delayed).
- **QR Code Integration**: quick access to item details via built-in QR code scanner.
- **Secure Authentication**: robust user authentication and session management using Supabase and JWT.
- **Responsive Design**: fully responsive interface for desktop and mobile use.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**:
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/)
  - [shadcn/ui](https://ui.shadcn.com/) 
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Authentication**: Custom implementation using JWT & Bcrypt with Supabase integration.
- **Tools & Utilities**:
  - `react-qr-scanner` for QR functionality
  - `zod` / `validator` for data validation

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus.git
    cd digitaalne-tootmise-juhtimislahendus-ehitus
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
    # Add other necessary env vars here (e.g., JWT_SECRET)
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js App Router pages and API routes.
  - `/api` - Backend API endpoints (Auth, Projects, User management).
  - `/app` - Main application dashboard (protected routes).
  - `/login`, `/register` - Authentication pages.
  - `/projects` - Project management views.
- `/components` - Reusable UI components.
- `/lib` - Utility functions and Supabase client configuration.

# FUNCTIONALITY

## Low-fidelity wireframes

### Landing page
![Landing page](https://raw.githubusercontent.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus/refs/heads/main/LFW/Landing%20page.png)

### Login page
![Login page](https://raw.githubusercontent.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus/refs/heads/main/LFW/Login%20page%20new.png)

### Home page
![Home page](https://raw.githubusercontent.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus/refs/heads/main/LFW/Home%20page%20new.png)

### Projects page
![Projects page](https://raw.githubusercontent.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus/refs/heads/main/LFW/Project%20home%20Page%20new.png)

### Project details page
![Project details page](https://raw.githubusercontent.com/rakenduste-programmeerimine-2025/digitaalne-tootmise-juhtimislahendus-ehitus/refs/heads/main/LFW/Detail%20tracking%20page%20new.png)

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

### Digital Production Management Solution for Construction

- Company Owner
  - Add projects
  - Create projects
  - Edit projects
  - Delete projects
  - Assign admins
  - Assign users
  - Remove admins
  - Remove users
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
  - Upload new blueprints (not planned atm)

## Team Members

- Ksaveri Petrov
- Nikita Vassiljev

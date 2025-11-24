import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
  deleted_at: string | null;
  password?: string;
}

export interface Organization {
  id: number;
  name: string;
  owner_id: string;
}

export interface Project {
  id: number;
  name: string;
  organization_id: number;
  status: string;
}

export interface ProjectDetail {
  id: number;
  project_id: number;
  status: string;
  name: string;
  location: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires: string;
}

export interface Scope {
  id: number;
  scope: string;
}

export interface UserScope {
  id: number;
  user_id: string;
  scope_id: number;
}

export interface UserInOrganization {
  id: number;
  user_id: string;
  organization_id: number;
}

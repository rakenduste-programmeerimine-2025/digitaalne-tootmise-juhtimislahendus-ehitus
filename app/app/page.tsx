"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Building2, Loader2, AlertCircle, LogOut, ArrowRight, ChevronDown } from "lucide-react";
import Logo from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Organization {
  id: number;
  name: string;
  created_at: string;
  owner_id: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  organization_id: number;
  created_at: string;
}

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        router.push("/login");
        return;
      }
    } else {
      router.push("/login");
      return;
    }

    async function fetchOrganizations() {
      try {
        const res = await fetch("/api/organizations");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch organizations");
        }
        const data = await res.json();
        setOrganizations(data.organizations || []);
        
        if (data.organizations && data.organizations.length > 0) {
          setSelectedOrgId(data.organizations[0].id.toString());
        } else {
            setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, [router]);

  useEffect(() => {
    if (!selectedOrgId) return;

    async function fetchProjects() {
      setProjectsLoading(true);
      try {
        const res = await fetch(`/api/projects?organizationId=${selectedOrgId}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setProjectsLoading(false);
        setLoading(false);
      }
    }

    fetchProjects();
  }, [selectedOrgId]);

  const handleOrgChange = (value: string) => {
    setSelectedOrgId(value);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const onSelectProject = (projectId: number) => {
      console.log("Selected project:", projectId);
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-red-100">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse"></div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-light text-slate-800">
              Welcome, <span className="font-semibold">{user?.first_name}</span>!
            </h1>
            
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-sm text-slate-500 whitespace-nowrap">Selected organisation:</span>
              <div className="relative group">
                <button className="flex items-center gap-2 font-semibold text-slate-900 bg-white border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors min-w-[180px] justify-between">
                  {organizations?.find(o => o.id.toString() === selectedOrgId)?.name || 'Loading...'}
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg hidden group-hover:block z-20">
                   {organizations?.map(org => (
                     <div key={org.id} onClick={() => setSelectedOrgId(org.id.toString())} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-black">
                       {org.name}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Projects:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <button 
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-white p-6 rounded-lg border-2 border-slate-200 hover:border-blue-600 hover:shadow-md transition-all text-left group flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg text-black">{project.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {project.status}
                  </span>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </button>
            ))}
          </div>
        </section>

        <Button variant="outline" className="w-full py-8 border-dashed border-2 border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 flex gap-2">
          <Plus className="h-5 w-5" /> Create New Project
        </Button>
      </main>
    </div>
  );
}
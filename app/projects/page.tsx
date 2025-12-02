"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "@/components/CreateProjectModal";

interface Project {
  id: number;
  name: string;
  status: string;
  organization_id: number;
}

interface Organization {
  id: number;
  name: string;
  role_id: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchProjects(selectedOrgId);
    }
  }, [selectedOrgId]);

  async function fetchOrganizations() {
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data.organizations);
      if (data.organizations.length > 0) {
        setSelectedOrgId(data.organizations[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load organizations");
      setLoading(false);
    }
  }

  async function fetchProjects(orgId: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?organizationId=${orgId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch projects");
      }
      const data = await res.json();
      setProjects(data.projects);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrgId || !newProjectName) return;

    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          organizationId: selectedOrgId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create project");
      }

      const data = await res.json();
      setProjects([...projects, data.project]);
      setIsModalOpen(false);
      setNewProjectName("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  const currentOrgRole = organizations.find(o => o.id === selectedOrgId)?.role_id;
  const canCreate = currentOrgRole === 1 || currentOrgRole === 2;

  if (loading && organizations.length === 0) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        
        <div className="flex gap-4 items-center">
          <select 
            value={selectedOrgId || ""} 
            onChange={(e) => setSelectedOrgId(Number(e.target.value))}
            className="p-2 border rounded bg-white dark:bg-gray-800"
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>

      {canCreate && (
            <button 
              onClick={() => {
                console.log("Create button clicked");
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Create New Project
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-6 hover:shadow-lg transition bg-white dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Status: {project.status}</span>
              <button 
                onClick={() => router.push(`/projects/${project.id}`)}
                className="text-blue-600 hover:underline"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No projects found.
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={(newProject: Project) => {
          setProjects([...projects, newProject]);
          setIsModalOpen(false);
        }}
        organizationId={selectedOrgId}
      />
    </div>
  );
}

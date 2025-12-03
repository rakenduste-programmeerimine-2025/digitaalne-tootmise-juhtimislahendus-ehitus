"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  ArrowRight,
  Box,
  CheckCircle2,
  Search,
  Truck,
  LogOut,
  Loader2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScannerModal } from "@/components/ScannerModal"

interface Project {
  id: number
  name: string
  organization_id: number
  status: string
}

interface ProjectDetail {
  id: number
  project_id: number
  name: string
  status: string
  location: string
  created_at: string
}

interface ActivityLog {
  id: number
  organization_id: number
  project_id: number
  detail_id: number
  old_status: string
  new_status: string
  created_at: string
  part_name: string
}

interface ProjectStats {
  total: number
  inTransit: number
  ready: number
  delayed: number
}

interface User {
  email: string
  first_name: string
  last_name: string
}

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [details, setDetails] = useState<ProjectDetail[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user from localStorage", e)
        router.push("/login")
        return
      }
    } else {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const projectRes = await fetch(`/api/projects/${id}`)
        if (!projectRes.ok) throw new Error("Failed to fetch project")
        const projectData = await projectRes.json()
        setProject(projectData.project)

        const detailsRes = await fetch(`/api/details?projectId=${id}`)
        if (!detailsRes.ok) throw new Error("Failed to fetch project details")
        const detailsData = await detailsRes.json()
        setDetails(detailsData.project_details || [])

        const logsRes = await fetch(`/api/logs?projectId=${id}`)
        if (!logsRes.ok) throw new Error("Failed to fetch activity logs")
        const logsData = await logsRes.json()
        setLogs(logsData.logs || [])
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("user")
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!project) return <div className="p-8 text-center">Project not found</div>

  const stats: ProjectStats = {
    total: details.length,
    inTransit: details.filter(d => d.status === "in_transit").length,
    ready: details.filter(d => d.status === "ready").length,
    delayed: details.filter(d => d.status === "delayed").length,
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <button
              onClick={() => router.push("/app")}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </button>
          </div>

          <div className="flex-1 text-center font-bold text-lg hidden sm:block text-slate-800">
            {project.name}
          </div>

          <div className="flex items-center space-x-4">
            <ScannerModal />
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
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
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

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-l-blue-600">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-600" /> SUMMARY
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-500">Total parts</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">In transit</div>
                <div className="text-2xl font-bold text-blue-700">
                  {stats.inTransit}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Ready</div>
                <div className="text-2xl font-bold text-green-700">
                  {stats.ready}
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600">Delayed</div>
                <div className="text-2xl font-bold text-amber-700">
                  {stats.delayed}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">RECENT ACTIVITY</h3>
            <div className="space-y-4">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0"
                >
                  {log.new_status === "ready" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : log.new_status === "delayed" ? (
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  ) : (
                    <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {log.part_name} -{" "}
                      {log.new_status === "in_transit"
                        ? "In Transit"
                        : log.new_status === "ready"
                        ? "Ready"
                        : log.new_status === "delayed"
                        ? "Delayed"
                        : log.new_status}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-slate-500 text-sm">No recent activity</p>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="SEARCH PARTS (ID, Name...)"
                className="pl-10 h-12 text-lg"
              />
            </div>
          </Card>
          <Card className="flex-1 min-h-[300px] bg-slate-900 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>
            <div className="relative z-10 text-center space-y-4">
              <div className="w-32 h-32 border-4 border-blue-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Box className="h-16 w-16 text-blue-400" />
              </div>
              <p className="text-slate-400 font-mono text-sm">
                [Interactive 3D View Loading...]
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full py-6 text-lg shadow-lg shadow-blue-900/20"
            onClick={() => router.push(`/projects/${id}/details`)}
          >
            GO TO DETAIL TRACKING <ArrowRight className="ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}

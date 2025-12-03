"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Filter, Loader2, LogOut, Menu, Search } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
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
import { EditDetailModal } from "@/components/EditDetailModal"

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

interface User {
  email: string
  first_name: string
  last_name: string
}

function DetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [inventory, setInventory] = useState<ProjectDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [selectedDetail, setSelectedDetail] = useState<ProjectDetail | null>(
    null,
  )
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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
        setInventory(detailsData.project_details || [])
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

  const handleUpdateDetail = (updatedDetail: ProjectDetail) => {
    setInventory(prev =>
      prev.map(item => (item.id === updatedDetail.id ? updatedDetail : item)),
    )
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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.id.toString().includes(filter)
    const matchesStatus = statusFilter === "All" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <div className="flex items-center text-sm font-medium text-slate-600 space-x-2">
              <button
                onClick={() => router.push("/app")}
                className="hover:text-slate-900 transition-colors"
              >
                Home
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => router.push(`/projects/${id}`)}
                className="hover:text-slate-900 transition-colors"
              >
                Projects
              </button>
            </div>
          </div>

          <div className="flex-1 text-center font-bold text-lg hidden sm:block text-slate-800">
            {project.name}
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

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Filter: All</option>
              <option value="in_transit">In Transit</option>
              <option value="ready">Ready</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div className="relative flex-[2]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by part ID, Name..."
              className="pl-9 h-9"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <ScannerModal />
            <Button
              variant="outline"
              className="h-9 w-9 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-9 w-9 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">NAME</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">LOCATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    onDoubleClick={() => {
                      setSelectedDetail(row)
                      setIsEditModalOpen(true)
                    }}
                    title="Double click to edit"
                  >
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          row.status === "ready"
                            ? "bg-green-100 text-green-800"
                            : row.status === "delayed"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {row.status === "in_transit"
                          ? "In Transit"
                          : row.status === "ready"
                          ? "Ready"
                          : row.status === "delayed"
                          ? "Delayed"
                          : row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 group-hover:text-blue-700">
                      {row.location}
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No parts found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-center text-slate-400 italic">
            When double-clicked on any part - opens "EDIT" menu
          </div>
        </Card>
      </main>

      <EditDetailModal
        detail={selectedDetail}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateDetail}
      />
    </div>
  )
}

export default DetailsPage

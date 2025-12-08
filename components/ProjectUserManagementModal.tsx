"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle, Trash2, Loader2, Plus, Users } from "lucide-react"
import { ROLE_IDS, ROLE_NAMES } from "@/lib/roles"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role_id: number
}

interface ProjectUserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  organizationId: number
  currentUserId: string
}

export function ProjectUserManagementModal({
  isOpen,
  onClose,
  projectId,
  organizationId,
  currentUserId,
}: ProjectUserManagementModalProps) {
  const [projectUsers, setProjectUsers] = useState<User[]>([])
  const [orgUsers, setOrgUsers] = useState<User[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [newUserRole, setNewUserRole] = useState<string>(
    ROLE_IDS.ENGINEER.toString(),
  )
  const [isAdding, setIsAdding] = useState(false)

  const fetchProjectUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/users`)
      if (!res.ok) throw new Error("Failed to fetch project users")
      const data = await res.json()
      setProjectUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrgUsers = async () => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/users`)
      if (!res.ok) throw new Error("Failed to fetch org users")
      const data = await res.json()
      setOrgUsers(data.users || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isOpen && projectId && organizationId) {
      fetchProjectUsers()
      fetchOrgUsers()
    }
  }, [isOpen, projectId, organizationId])

  const availableUsers = orgUsers.filter(
    ou => !projectUsers.find(pu => pu.id === ou.id),
  )

  const handleAddUser = async () => {
    if (!selectedUserId) return
    setIsAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          roleId: parseInt(newUserRole),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add user")
      }

      setSelectedUserId("")
      fetchProjectUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRoleId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId: newRoleId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update role")
      }

      fetchProjectUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the project?"))
      return

    try {
      const res = await fetch(`/api/projects/${projectId}/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove user")
      }

      fetchProjectUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user")
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Project Team</DialogTitle>
          <DialogDescription>
            Add members from your organization to this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add User Form */}
          <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Select Member
              </label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <SelectItem
                      value="none"
                      disabled
                    >
                      No available members
                    </SelectItem>
                  ) : (
                    availableUsers.map(user => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                      >
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40 space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Select
                value={newUserRole}
                onValueChange={setNewUserRole}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLE_IDS.PROJECT_ADMIN.toString()}>
                    {ROLE_NAMES[ROLE_IDS.PROJECT_ADMIN]}
                  </SelectItem>
                  <SelectItem value={ROLE_IDS.ENGINEER.toString()}>
                    {ROLE_NAMES[ROLE_IDS.ENGINEER]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddUser}
              disabled={isAdding || !selectedUserId}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add to Team
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : projectUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-slate-500"
                    >
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role_id === ROLE_IDS.PROJECT_OWNER ? (
                          <span className="font-semibold text-slate-700">
                            Project Owner
                          </span>
                        ) : (
                          <Select
                            value={user.role_id.toString()}
                            onValueChange={val =>
                              handleUpdateRole(user.id, parseInt(val))
                            }
                          >
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={ROLE_IDS.PROJECT_ADMIN.toString()}
                              >
                                {ROLE_NAMES[ROLE_IDS.PROJECT_ADMIN]}
                              </SelectItem>
                              <SelectItem value={ROLE_IDS.ENGINEER.toString()}>
                                {ROLE_NAMES[ROLE_IDS.ENGINEER]}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role_id !== ROLE_IDS.PROJECT_OWNER &&
                          user.id !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

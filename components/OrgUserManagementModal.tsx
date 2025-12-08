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
import { Input } from "@/components/ui/input"
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
import { AlertCircle, Trash2, Loader2, Plus } from "lucide-react"
import { ROLE_IDS, ROLE_NAMES } from "@/lib/roles"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role_id: number
}

interface OrgUserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  currentUserId: string
}

export function OrgUserManagementModal({
  isOpen,
  onClose,
  organizationId,
  currentUserId,
}: OrgUserManagementModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<string>(
    ROLE_IDS.ORG_USER.toString(),
  )
  const [isAdding, setIsAdding] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/organizations/${organizationId}/users`)
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && organizationId) {
      fetchUsers()
    }
  }, [isOpen, organizationId])

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleAddUser = async () => {
    if (!newUserEmail) return
    setIsAdding(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch(`/api/organizations/${organizationId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          roleId: parseInt(newUserRole),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add user")
      }

      setSuccessMessage(data.message || "User added successfully")
      setNewUserEmail("")
      fetchUsers()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRoleId: number) => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId: newRoleId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update role")
      }

      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this user from the organization?",
      )
    )
      return

    try {
      const res = await fetch(`/api/organizations/${organizationId}/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove user")
      }

      fetchUsers()
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
          <DialogTitle>Manage Organization Users</DialogTitle>
          <DialogDescription>
            Add new users or manage existing roles for this organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <Input
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
              />
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
                  <SelectItem value={ROLE_IDS.ORG_ADMIN.toString()}>
                    {ROLE_NAMES[ROLE_IDS.ORG_ADMIN]}
                  </SelectItem>
                  <SelectItem value={ROLE_IDS.ORG_USER.toString()}>
                    {ROLE_NAMES[ROLE_IDS.ORG_USER]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddUser}
              disabled={isAdding || !newUserEmail}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add User
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" />
              {successMessage}
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-slate-500"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role_id === ROLE_IDS.ORG_OWNER ? (
                          <span className="font-semibold text-slate-700">
                            Owner
                          </span>
                        ) : (
                          <Select
                            value={user.role_id.toString()}
                            onValueChange={val =>
                              handleUpdateRole(user.id, parseInt(val))
                            }
                            disabled={user.role_id === ROLE_IDS.ORG_OWNER}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ROLE_IDS.ORG_ADMIN.toString()}>
                                {ROLE_NAMES[ROLE_IDS.ORG_ADMIN]}
                              </SelectItem>
                              <SelectItem value={ROLE_IDS.ORG_USER.toString()}>
                                {ROLE_NAMES[ROLE_IDS.ORG_USER]}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role_id !== ROLE_IDS.ORG_OWNER &&
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

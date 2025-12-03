"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface ProjectDetail {
  id: number
  project_id: number
  status: string
  name: string
  location: string
  created_at: string
}

interface EditDetailModalProps {
  detail: ProjectDetail | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedDetail: ProjectDetail) => void
}

export function EditDetailModal({
  detail,
  isOpen,
  onClose,
  onUpdate,
}: EditDetailModalProps) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (detail) {
      setName(detail.name)
      setLocation(detail.location)
      setStatus(detail.status)
    }
  }, [detail])

  const handleSave = async () => {
    if (!detail) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detailId: detail.id,
          name,
          location,
          newStatus: status,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to update detail")
      }

      const json = await res.json()
      onUpdate(json.detail)
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Part Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="name"
              className="text-right"
            >
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="location"
              className="text-right"
            >
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="status"
              className="text-right"
            >
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

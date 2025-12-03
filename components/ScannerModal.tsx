"use client"

import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, QrCode } from "lucide-react"

interface ProjectDetail {
  id: number
  project_id: number
  status: string
  name: string
  location: string
}

export function ScannerModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProjectDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (codes: { rawValue: string }[]) => {
    if (!codes.length || loading || scannedData) return

    const data = codes[0].rawValue
    setScannedData(data)
    setLoading(true)
    setError(null)

    try {
      const detailId = parseInt(data)
      if (isNaN(detailId)) {
        throw new Error("Invalid QR code format. Expected a numeric ID.")
      }

      const res = await fetch(`/api/details?detailId=${detailId}`)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to fetch detail")
      }

      const json = await res.json()
      if (json.project_details && json.project_details.length > 0) {
        setResult(json.project_details[0])
      } else {
        throw new Error("Detail not found")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const resetScan = () => {
    setScannedData(null)
    setResult(null)
    setError(null)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!result) return
    setLoading(true)
    try {
      const res = await fetch("/api/details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detailId: result.id, newStatus }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to update status")
      }

      const json = await res.json()
      setResult(json.detail)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetScan()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Part QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {!scannedData ? (
            <div className="w-full aspect-square overflow-hidden rounded-lg border-2 border-slate-200 dark:border-slate-800 relative bg-black">
              <Scanner
                onScan={handleScan}
                allowMultiple={true}
                scanDelay={2000}
                components={{
                  finder: true,
                }}
                styles={{
                  container: { width: "100%", height: "100%" },
                  video: { width: "100%", height: "100%", objectFit: "cover" },
                }}
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <p className="text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full">
                  Point camera at QR code
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm font-medium">Processing...</p>
                </div>
              ) : error ? (
                <div className="text-center space-y-2 w-full">
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  <Button
                    onClick={resetScan}
                    className="w-full"
                  >
                    Scan Again
                  </Button>
                </div>
              ) : result ? (
                <div className="text-center space-y-4 w-full">
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full mx-auto w-fit">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="space-y-2 border rounded-lg p-4 text-left">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-2">
                      Part Details
                    </h3>
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{result.id}</span>

                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{result.name}</span>

                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize font-medium">
                        {result.status.replace("_", " ")}
                      </span>

                      <span className="text-muted-foreground">Location:</span>
                      <span>{result.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    <Button
                      variant={
                        result.status === "ready" ? "default" : "outline"
                      }
                      className={
                        result.status === "ready"
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:bg-green-50 text-green-700 border-green-200"
                      }
                      onClick={() => handleStatusUpdate("ready")}
                      disabled={result.status === "ready"}
                    >
                      Ready
                    </Button>
                    <Button
                      variant={
                        result.status === "in_transit" ? "default" : "outline"
                      }
                      className={
                        result.status === "in_transit"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:bg-blue-50 text-blue-700 border-blue-200"
                      }
                      onClick={() => handleStatusUpdate("in_transit")}
                      disabled={result.status === "in_transit"}
                    >
                      In Transit
                    </Button>
                    <Button
                      variant={
                        result.status === "delayed" ? "default" : "outline"
                      }
                      className={
                        result.status === "delayed"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "hover:bg-amber-50 text-amber-700 border-amber-200"
                      }
                      onClick={() => handleStatusUpdate("delayed")}
                      disabled={result.status === "delayed"}
                    >
                      Delayed
                    </Button>
                  </div>

                  <Button
                    onClick={resetScan}
                    variant="ghost"
                    className="w-full"
                  >
                    Scan Another
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

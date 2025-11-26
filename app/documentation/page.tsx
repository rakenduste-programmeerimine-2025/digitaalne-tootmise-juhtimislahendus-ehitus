"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DocumentationPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/me")
        if (res.ok) {
          setIsLoggedIn(true)
        }
      } catch (err) {
        console.error("Session check failed", err)
      }
    }
    checkSession()
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <header className="flex justify-between items-center p-6 border-b border-slate-100">
        <div
          className="cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo />
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(isLoggedIn ? "/app" : "/login")}
          >
            {isLoggedIn ? "DASHBOARD" : "LOGIN"}
          </Button>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-1">
          <h3 className="font-bold text-slate-900 mb-4 px-2">Documentation</h3>
          <button className="block w-full text-left px-2 py-1.5 rounded bg-blue-50 text-blue-700 font-medium text-sm">
            Introduction
          </button>
          <button className="block w-full text-left px-2 py-1.5 rounded text-slate-600 hover:bg-slate-50 text-sm">
            Getting Started
          </button>
          <button className="block w-full text-left px-2 py-1.5 rounded text-slate-600 hover:bg-slate-50 text-sm">
            API Reference
          </button>
          <button className="block w-full text-left px-2 py-1.5 rounded text-slate-600 hover:bg-slate-50 text-sm">
            Inventory Management
          </button>
          <button className="block w-full text-left px-2 py-1.5 rounded text-slate-600 hover:bg-slate-50 text-sm">
            Troubleshooting
          </button>
        </aside>

        {/* Content */}
        <div className="md:col-span-3 prose prose-slate max-w-none text-black">
          <h1>KNT Technology Documentation</h1>
          <p className="lead">
            Everything you need to know about tracking your inventory with KNT
            Tech.
          </p>

          <hr className="my-8 border-slate-200" />

          <h3>Overview</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>

          <br />

          <h3>Key Concepts</h3>
          <ul>
            <li>
              <strong>Projects:</strong> Groups of inventory specific to a
              construction site or job.
            </li>
            <li>
              <strong>Parts:</strong> Individual tracked items (beams, panels,
              pipes).
            </li>
            <li>
              <strong>Status:</strong> Current state of a part (Ready, In
              Transit, Delayed).
            </li>
          </ul>

          <br />

          <h3>Integration</h3>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
        </div>
      </main>
    </div>
  )
}

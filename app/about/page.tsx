"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AboutPage() {
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
      <main className="flex-grow max-w-4xl mx-auto p-8 text-slate-800">
        <h1 className="text-3xl font-bold mb-6">About KNT Technology</h1>
        <p className="mb-4 text-lg text-slate-600">
          Revolutionizing logistics for the modern engineering landscape.
        </p>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Sed ut perspiciatis
            unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-4">
            Our Mission
          </h3>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
            ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
            numquam eius modi tempora incidunt ut labore et dolore magnam
            aliquam quaerat voluptatem.
          </p>
        </div>
      </main>
    </div>
  )
}

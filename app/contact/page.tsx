"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ContactPage() {
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
      <main className="flex-grow max-w-2xl mx-auto w-full p-8 text-slate-800">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="mb-8 text-slate-600">
          We'd love to hear from you. Please reach out with any questions.
        </p>

        <Card className="p-8 mb-8">
          <h3 className="font-semibold mb-4">Send us a message</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                placeholder="How can we help?"
              ></textarea>
            </div>
            <Button className="w-full">Send Message</Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Headquarters</h4>
            <p>Laeva tn 2</p>
            <p>10151 Tallinn</p>
            <p>Estonia</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Support</h4>
            <p>sales@knt.ee</p>
            <p>+372 555 1234</p>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8 text-sm">
          Last updated: November 26, 2025
        </p>

        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              1. Introduction
            </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
              Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
              Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris
              massa. Vestibulum lacinia arcu eget nulla.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              2. Data Collection
            </h2>
            <p>
              Class aptent taciti sociosqu ad litora torquent per conubia
              nostra, per inceptos himenaeos. Curabitur sodales ligula in
              libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque
              nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.
              Sed convallis tristique sem. Proin ut ligula vel nunc egestas
              porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus
              non, massa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              3. Use of Information
            </h2>
            <p>
              Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla
              metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.
              Quisque volutpat condimentum velit. Class aptent taciti sociosqu
              ad litora torquent per conubia nostra, per inceptos himenaeos. Nam
              nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque
              adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi.
              Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus
              consequat imperdiet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Cookies
            </h2>
            <p>
              Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in
              justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus
              luctus magna. Quisque cursus, metus vitae pharetra auctor, sem
              massa mattis sem, at interdum magna augue eget diam. Vestibulum
              ante ipsum primis in faucibus orci luctus et ultrices posuere
              cubilia Curae; Morbi lacinia molestie dui.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

"use client"

import Logo from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreePolicy, setAgreePolicy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/me")
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem("user", JSON.stringify(data.user))
          router.push("/app")
        }
      } catch (err) {
        console.error("Session check failed", err)
      }
    }
    checkSession()
  }, [router])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.status === "exists") {
        setStep(1)
      } else if (data.status === "invited") {
        setStep(2)
      } else {
        setError(
          "Account does not exist. Please check your email or ask your administrator for an invite.",
        )
      }
    } catch (err) {
      setError("Failed to verify email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to login")
      }

      localStorage.setItem("user", JSON.stringify(data.data))
      router.push("/app")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreePolicy) {
      setError("You must agree to the privacy policy")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to register")
      }

      localStorage.setItem("user", JSON.stringify(data.data))
      router.push("/app")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 scale-125">
        <Logo />
      </div>

      <Card className="w-full max-w-md p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {step === 0 && "SIGN IN"}
          {step === 1 && "WELCOME BACK"}
          {step === 2 && "COMPLETE REGISTRATION"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {step === 0 && (
          <form
            onSubmit={handleEmailSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                EMAIL
              </label>
              <Input
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                type="email"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? "CHECKING..." : "CONTINUE"}
            </Button>
          </form>
        )}

        {step === 1 && (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4"
          >
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-500">{email}</p>
              <button
                type="button"
                onClick={() => {
                  setStep(0)
                  setError(null)
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Change email
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                PASSWORD
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-4"
          >
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-500">Invited as {email}</p>
              <button
                type="button"
                onClick={() => {
                  setStep(0)
                  setError(null)
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Change email
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="privacy"
                checked={agreePolicy}
                onCheckedChange={c => setAgreePolicy(c as boolean)}
              />
              <Label
                htmlFor="privacy"
                className="text-sm text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading || !agreePolicy}
            >
              {loading ? "Creating Account..." : "COMPLETE REGISTRATION"}
            </Button>
          </form>
        )}
      </Card>

      <div className="mt-8 text-center bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-sm">
        <p className="text-slate-600">
          New?{" "}
          <button
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => router.push("/register")}
          >
            Get started!
          </button>
        </p>
      </div>
    </div>
  )
}

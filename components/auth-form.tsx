"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push("/login?registered=true")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push("/")
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
          <Sparkles size={18} className="text-gold" />
        </div>
        <h1 className="font-serif text-xl font-semibold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login" ? "Sign in to your workspace" : "Start managing your productivity"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-input border-border rounded-xl h-11" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</label>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-input border-border rounded-xl h-11" />
        </div>
        {error && <p className="text-sm text-destructive/80 bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
        <Button type="submit" className="w-full rounded-xl h-11 bg-gold text-background hover:bg-gold/90" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        {mode === "login" ? (
          <>New here? <Link href="/register" className="text-gold hover:underline font-medium">Create account</Link></>
        ) : (
          <>Have an account? <Link href="/login" className="text-gold hover:underline font-medium">Sign in</Link></>
        )}
      </p>
    </div>
  )
}

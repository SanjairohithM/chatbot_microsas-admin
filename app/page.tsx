"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminOnly } from "@/components/role-guard"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AdminOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    }>
      <AdminDashboard />
    </AdminOnly>
  )
}

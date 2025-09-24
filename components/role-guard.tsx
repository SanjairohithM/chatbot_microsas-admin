"use client"

import { useAuth } from "@/hooks/use-auth"
import { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: ("user" | "admin")[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function UserOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["user", "admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

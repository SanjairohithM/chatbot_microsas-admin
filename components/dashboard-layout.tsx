"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import {
  Bot,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Search,
  Plus,
  Activity,
  Zap,
  Bell,
  LogOut,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user: currentUser, signOut } = useAuth()

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3, href: "/dashboard" },
    { id: "users", label: "Users", icon: Users, href: "/dashboard/users" },
    { id: "bots", label: "Bots", icon: Bot, href: "/dashboard/bots" },
    { id: "chats", label: "Chats", icon: MessageSquare, href: "/dashboard/chats" },
    { id: "analytics", label: "Analytics", icon: Activity, href: "/dashboard/analytics" },
    { id: "integrations", label: "Integrations", icon: Zap, href: "/dashboard/integrations" },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ]

  const currentPage = sidebarItems.find(item => 
    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex justify-center mb-8">
            <div className="w-20% h-20% rounded overflow-hidden">
              <Image 
                src="/chatbotlogo.png" 
                alt="ChatBot Logo" 
                quality={100}
                width={18} 
                height={18} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-card-foreground">
                {currentPage?.label || "Dashboard"}
              </h1>
              <p className="text-muted-foreground text-sm">Manage your AI chatbots and monitor performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search..." className="pl-10 w-64" />
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Bot
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">{currentUser?.name}</div>
                  <div className="text-xs text-muted-foreground">{currentUser?.role}</div>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/admin-avatar.png" />
                  <AvatarFallback>
                    {currentUser?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

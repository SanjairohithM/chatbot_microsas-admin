"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserTable } from "@/components/user-table"
import { UserForm } from "@/components/user-form"
import { UserDetails } from "@/components/user-details"
import { useUsers } from "@/hooks/use-users"
import { useAuth } from "@/hooks/use-auth"
import { useDashboard } from "@/hooks/use-dashboard"
import { User } from "@/lib/types"
import {
  Bot,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Search,
  Plus,
  MoreHorizontal,
  Activity,
  Zap,
  Brain,
  Shield,
  Bell,
  LogOut,
} from "lucide-react"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const { user: currentUser, signOut } = useAuth()
  const { stats, recentBots, recentUsers, loading: dashboardLoading } = useDashboard()
  

  // User management functions
  const handleCreateUser = () => {
    setFormMode("create")
    setSelectedUser(null)
    setUserFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setFormMode("edit")
    setSelectedUser(user)
    setUserFormOpen(true)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setUserDetailsOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleUserSubmit = async (userData: { email: string; password?: string; name: string; role?: "user" | "admin"; is_active?: boolean }) => {
    if (formMode === "create") {
      await createUser(userData as { email: string; password: string; name: string; role: "user" | "admin" })
    } else if (selectedUser) {
      await updateUser(selectedUser.id, userData)
    }
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "bots", label: "Bots", icon: Bot },
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const statsData = [
    {   
      title: "Total Users", 
      value: stats ? stats.totalUsers.toLocaleString() : (dashboardLoading ? "..." : "0"), 
      change: "+12%", 
      icon: Users 
    },
    { 
      title: "Active Bots", 
      value: stats ? stats.activeBots.toLocaleString() : (dashboardLoading ? "..." : "0"), 
      change: "+8%", 
      icon: Bot 
    },
    { 
      title: "Messages Today", 
      value: stats ? stats.messagesToday.toLocaleString() : (dashboardLoading ? "..." : "0"), 
      change: "+23%", 
      icon: MessageSquare 
    },
    { 
      title: "Success Rate", 
      value: stats ? `${stats.successRate}%` : (dashboardLoading ? "..." : "0%"), 
      change: "+2%", 
      icon: Shield 
    },
  ]


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex justify-center mb-8">
            <div className="w-50% h-50% rounded overflow-hidden">
              <Image 
                src="/chatbotlogo.png" 
                alt="ChatBot Logo" 
                quality={100}
                width={16} 
                height={16} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
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
                {sidebarItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
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
          {activeTab === "overview" && (
            <div className="space-y-6">
         
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold text-card-foreground">
                              {stat.value}
                            </p>
                            <p className="text-xs text-green-500">{stat.change} from last month</p>
                          </div>
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bots</CardTitle>
                    <CardDescription>Your latest AI chatbot deployments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading bots...</p>
                        </div>
                      ) : recentBots.length > 0 ? (
                        recentBots.map((bot) => (
                          <div
                            key={bot.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">{bot.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {bot.messages} messages • {bot.accuracy}% accuracy
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={bot.status === "active" ? "default" : "secondary"}>{bot.status}</Badge>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No bots found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Latest user activity and registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading users...</p>
                        </div>
                      ) : recentUsers.length > 0 ? (
                        recentUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={`/.jpg?height=40&width=40&query=${user.name}`} />
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-card-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{user.role}</Badge>
                              <p className="text-xs text-muted-foreground mt-1">{user.lastActive}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No users found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-muted-foreground">Manage user accounts and permissions</p>
              </div>
              <UserTable
                users={users}
                loading={loading}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onView={handleViewUser}
                onCreate={handleCreateUser}
              />
            </div>
          )}

          {activeTab === "bots" && (
            <Card>
              <CardHeader>
                <CardTitle>Bot Management</CardTitle>
                <CardDescription>Create, configure, and deploy AI chatbots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Bot management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "chats" && (
            <Card>
              <CardHeader>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>View and analyze chat conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chat history interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Performance metrics and usage analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect with external services and APIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Integrations panel coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your chatbot platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Settings panel coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* User Form Dialog */}
      <UserForm
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={selectedUser}
        onSubmit={handleUserSubmit}
        mode={formMode}
      />

      {/* User Details Dialog */}
      <UserDetails
        user={selectedUser}
        open={userDetailsOpen}
        onOpenChange={setUserDetailsOpen}
        onEdit={handleEditUser}
      />
    </div>
  )
}

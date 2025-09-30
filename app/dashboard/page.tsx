"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useDashboard } from "@/hooks/use-dashboard"
import {
  Bot,
  Users,
  MessageSquare,
  Shield,
  MoreHorizontal,
} from "lucide-react"

export default function DashboardOverview() {
  const { stats, recentBots, recentUsers, loading: dashboardLoading } = useDashboard()

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium text-muted-foreground mb-2">{stat.title}</p>
                      <p className="text-4xl font-bold text-card-foreground mb-2">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-500 font-medium">{stat.change} from last month</p>
                    </div>
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Recent Bots</CardTitle>
              <CardDescription className="text-base">Your latest AI chatbot deployments</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
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

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Recent Users</CardTitle>
              <CardDescription className="text-base">Latest user activity and registrations</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
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
    </DashboardLayout>
  )
}

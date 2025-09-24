"use client"

import { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Bot,
  MessageSquare,
  Calendar,
  Mail,
  User as UserIcon,
  X,
} from "lucide-react"
import { format } from "date-fns"

interface UserDetailsProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (user: User) => void
}

export function UserDetails({ user, open, onOpenChange, onEdit }: UserDetailsProps) {
  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about this user
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`/placeholder-user.jpg?height=64&width=64&query=${user.name}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">User ID: {user.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {format(new Date(user.created_at), "MMMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
              <CardDescription>
                User's activity and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.bots_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Bots Created</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.conversations_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Conversations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User ID</span>
                  <Badge variant="outline">{user.id}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onEdit(user)}>
            Edit User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

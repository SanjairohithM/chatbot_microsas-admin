"use client"

import { useState } from "react"
import { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Bot,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"

interface UserTableProps {
  users: User[]
  loading: boolean
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
  onView: (user: User) => void
  onCreate: () => void
}

export function UserTable({ 
  users, 
  loading, 
  onEdit, 
  onDelete, 
  onView, 
  onCreate 
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDelete(userToDelete.id)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bots</TableHead>
              <TableHead>Conversations</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No users found matching your search." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`/placeholder-user.jpg?height=32&width=32&query=${user.name}`} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.bots_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{user.conversations_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(user.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
              This action cannot be undone and will also delete all associated bots and conversations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

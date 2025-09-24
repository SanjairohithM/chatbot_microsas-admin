"use client"

import { useState, useEffect } from "react"
import { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSubmit: (userData: { email: string; password?: string; name: string; role?: "user" | "admin"; is_active?: boolean }) => Promise<void>
  mode: "create" | "edit"
}

export function UserForm({ open, onOpenChange, user, onSubmit, mode }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        is_active: user.is_active,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        is_active: true,
      })
    }
  }, [user, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required.",
        variant: "destructive",
      })
      return
    }

    if (mode === "create" && !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required for new users.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
        ...(mode === "create" && { password: formData.password }),
      }
      
      await onSubmit(submitData)
      
      toast({
        title: mode === "create" ? "User Created" : "User Updated",
        description: `User ${mode === "create" ? "created" : "updated"} successfully.`,
      })
      
      onOpenChange(false)
      setFormData({ name: "", email: "", password: "", role: "user", is_active: true })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new user to the system." 
              : "Update user information."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          )}
          
          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="is_active">Account Status</Label>
              <Select value={formData.is_active.toString()} onValueChange={(value) => handleInputChange("is_active", value === "true")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

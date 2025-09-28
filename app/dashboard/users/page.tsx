"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserTable } from "@/components/user-table"
import { UserForm } from "@/components/user-form"
import { UserDetails } from "@/components/user-details"
import { UserChatTable } from "@/components/user-chat-table"
import { useUsers } from "@/hooks/use-users"
import { User } from "@/lib/types"

export default function UsersPage() {
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [userChatsOpen, setUserChatsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()

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

  const handleViewUserChats = (user: User) => {
    setSelectedUser(user)
    setUserChatsOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleUserSubmit = async (userData: { 
    email: string; 
    password?: string; 
    name: string; 
    role?: "user" | "admin"; 
    is_active?: boolean 
  }) => {
    if (formMode === "create") {
      await createUser(userData as { email: string; password: string; name: string; role: "user" | "admin" })
    } else if (selectedUser) {
      await updateUser(selectedUser.id, userData)
    }
  }

  return (
    <DashboardLayout>
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
                onViewChats={handleViewUserChats}
              />

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

        {/* User Chat Table Dialog */}
        {userChatsOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <UserChatTable
                  user={selectedUser}
                  onClose={() => setUserChatsOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

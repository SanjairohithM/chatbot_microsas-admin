"use client"

import { useState, useEffect } from "react"
import { User } from "@/lib/types"

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createUser: (userData: { email: string; password: string; name: string; role: "user" | "admin" }) => Promise<User>
  updateUser: (id: number, updates: Partial<User>) => Promise<User>
  deleteUser: (id: number) => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: { email: string; password: string; name: string }): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Failed to create user')
    }

    const newUser = await response.json()
    setUsers(prev => [newUser, ...prev])
    return newUser
  }

  const updateUser = async (id: number, updates: Partial<User>): Promise<User> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    const updatedUser = await response.json()
    setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
    return updatedUser
  }

  const deleteUser = async (id: number): Promise<void> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    setUsers(prev => prev.filter(user => user.id !== id))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}

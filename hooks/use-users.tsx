"use client"

import { useState, useEffect, useRef } from "react"
import { User } from "@/lib/types"

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createUser: (userData: { email: string; password: string; name: string; role: "user" | "admin" }) => Promise<User>
  updateUser: (id: string, updates: Partial<User>) => Promise<User>
  deleteUser: (id: string) => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchUsers = async () => {
    if (hasFetched.current) return
    hasFetched.current = true
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        setUsers([])
      }
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

    const data = await response.json()
    if (data && data.id) {
      setUsers(prev => [data, ...prev])
      return data
    }
    throw new Error('Invalid response from server')
  }

  const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
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

    const data = await response.json()
    if (data && data.id) {
      setUsers(prev => prev.map(user => user.id === id ? data : user))
      return data
    }
    throw new Error('Invalid response from server')
  }

  const deleteUser = async (id: string): Promise<void> => {
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

  const refetch = () => {
    hasFetched.current = false
    return fetchUsers()
  }

  return {
    users,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
  }
}

"use client"

import { useState, useEffect } from 'react'
import { Bot } from '@/lib/types'
import { useAuth } from './use-auth'

interface CreateBotData {
  name: string
  description?: string
  system_prompt?: string
  model?: string
  temperature?: number
  max_tokens?: number
  status?: "draft" | "active" | "inactive"
  is_deployed?: boolean
  deployment_url?: string
}

interface UpdateBotData extends Partial<CreateBotData> {}

interface BotFilters {
  userId?: string
  status?: string
  isDeployed?: boolean
  search?: string
}

export function useBots(filters?: BotFilters) {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchBots = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      
      // Always filter by current user for non-admin users
      if (user.role !== 'admin') {
        params.append('userId', user.id)
      } else if (filters?.userId) {
        params.append('userId', filters.userId)
      }
      
      if (filters?.status) params.append('status', filters.status)
      if (filters?.isDeployed !== undefined) params.append('isDeployed', filters.isDeployed.toString())
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/bots?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bots')
      }

      const data = await response.json()
      setBots(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bots')
      console.error('Error fetching bots:', err)
    } finally {
      setLoading(false)
    }
  }

  const createBot = async (botData: CreateBotData): Promise<Bot> => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          ...botData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create bot')
      }

      const data = await response.json()
      const newBot = data.data

      setBots(prev => [newBot, ...prev])
      return newBot
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bot'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateBot = async (botId: number, updates: UpdateBotData): Promise<Bot> => {
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update bot')
      }

      const data = await response.json()
      const updatedBot = data.data

      setBots(prev => prev.map(bot => bot.id === botId ? updatedBot : bot))
      return updatedBot
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bot'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteBot = async (botId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete bot')
      }

      setBots(prev => prev.filter(bot => bot.id !== botId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bot'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deployBot = async (botId: number): Promise<Bot> => {
    return updateBot(botId, { is_deployed: true, status: 'active' })
  }

  const undeployBot = async (botId: number): Promise<Bot> => {
    return updateBot(botId, { is_deployed: false })
  }

  const getBotStats = async (botId: number) => {
    try {
      const response = await fetch(`/api/bots/${botId}/stats`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bot stats')
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      console.error('Error fetching bot stats:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchBots()
  }, [user, filters?.userId, filters?.status, filters?.isDeployed, filters?.search])

  return {
    bots,
    loading,
    error,
    createBot,
    updateBot,
    deleteBot,
    deployBot,
    undeployBot,
    getBotStats,
    refetch: fetchBots,
  }
}

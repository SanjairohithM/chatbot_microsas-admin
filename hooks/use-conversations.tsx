"use client"

import { useState, useEffect } from 'react'
import { Conversation, Message } from '@/lib/types'
import { useAuth } from './use-auth'

interface CreateConversationData {
  botId: number
  title?: string
  isTest?: boolean
}

interface CreateMessageData {
  conversationId: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tokensUsed?: number
  responseTimeMs?: number
}

export function useConversations(botId?: number) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchConversations = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/conversations'
      const params = new URLSearchParams()
      
      if (botId) {
        // Fetch conversations for a specific bot
        url = `/api/bots/${botId}/conversations`
      } else {
        // Fetch conversations for the current user
        params.append('userId', user.id)
        url = `${url}?${params.toString()}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (conversationData: CreateConversationData): Promise<Conversation> => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...conversationData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create conversation')
      }

      const data = await response.json()
      const newConversation = data.data

      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateConversation = async (conversationId: number, updates: { title?: string }): Promise<Conversation> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update conversation')
      }

      const data = await response.json()
      const updatedConversation = data.data

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? updatedConversation : conv
      ))
      return updatedConversation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update conversation'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteConversation = async (conversationId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete conversation')
      }

      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete conversation'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user, botId])

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    refetch: fetchConversations,
  }
}

export function useMessages(conversationId?: number) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const createMessage = async (messageData: CreateMessageData): Promise<Message> => {
    try {
      const response = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create message')
      }

      const data = await response.json()
      const newMessage = data.data

      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create message'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  return {
    messages,
    loading,
    error,
    createMessage,
    refetch: fetchMessages,
  }
}

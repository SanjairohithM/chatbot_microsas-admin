// Shared types for the application
export interface User {
  id: number
  email: string
  name: string
  role: "user" | "admin"
  is_active: boolean
  created_at: string
  bots_count?: number
  conversations_count?: number
}

export interface Bot {
  id: number
  user_id: number
  name: string
  description: string
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  status: "draft" | "active" | "inactive"
  is_deployed: boolean
  deployment_url?: string
  created_at: string
  updated_at: string
}

export interface KnowledgeDocument {
  id: number
  bot_id: number
  title: string
  content: string
  file_url?: string
  file_type?: string
  file_size?: number
  status: "processing" | "indexed" | "error"
  processing_error?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  bot_id: number
  user_id: number
  title: string
  is_test: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  conversation_id: number
  role: "user" | "assistant" | "system"
  content: string
  image_url?: string
  image_analysis?: string
  tokens_used?: number
  response_time_ms?: number
  created_at: string
}

export interface BotAnalytics {
  id: number
  bot_id: number
  date: string
  total_conversations: number
  total_messages: number
  total_tokens_used: number
  avg_response_time_ms: number
  user_satisfaction_score: number
  created_at: string
}

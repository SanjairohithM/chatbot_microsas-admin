import { db } from './db'
import bcrypt from 'bcryptjs'
import type { Bot, KnowledgeDocument, Conversation, BotAnalytics, User } from './types'

// User operations (server-side only)
export class ServerUserService {
  static async create(email: string, password: string, name: string, role: "user" | "admin" = "user"): Promise<User> {
    const password_hash = await bcrypt.hash(password, 12)
    
    const user = await db.user.create({
      data: {
        email,
        password_hash,
        name,
        role,
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
    }
  }

  static async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
    }
  }

  static async findAll(): Promise<User[]> {
    const users = await db.user.findMany({
      include: {
        _count: {
          select: {
            bots: true,
            conversations: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
      bots_count: user._count.bots,
      conversations_count: user._count.conversations,
    }))
  }

  static async findById(id: string): Promise<User | null> {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bots: true,
            conversations: true,
          },
        },
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
      bots_count: user._count.bots,
      conversations_count: user._count.conversations,
    }
  }

  static async update(id: string, updates: Partial<{ name: string; email: string; role: "user" | "admin"; is_active: boolean }>): Promise<User | null> {
    const user = await db.user.update({
      where: { id },
      data: updates,
      include: {
        _count: {
          select: {
            bots: true,
            conversations: true,
          },
        },
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
      bots_count: user._count.bots,
      conversations_count: user._count.conversations,
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await db.user.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }
}

// Bot operations (server-side only)
export class ServerBotService {
  static async create(userId: string, botData: Partial<Bot>): Promise<Bot> {
    const bot = await db.bot.create({
      data: {
        user_id: userId,
        name: botData.name || 'New Bot',
        description: botData.description || '',
        system_prompt: botData.system_prompt || '',
        model: botData.model || 'deepseek-chat',
        temperature: botData.temperature || 0.7,
        max_tokens: botData.max_tokens || 1000,
        status: botData.status || 'draft',
        is_deployed: botData.is_deployed || false,
        deployment_url: botData.deployment_url,
      },
    })

    return {
      id: bot.id,
      user_id: bot.user_id,
      name: bot.name,
      description: bot.description || '',
      system_prompt: bot.system_prompt || '',
      model: bot.model,
      temperature: bot.temperature,
      max_tokens: bot.max_tokens,
      status: bot.status as 'draft' | 'active' | 'inactive',
      is_deployed: bot.is_deployed,
      deployment_url: bot.deployment_url || undefined,
      created_at: bot.created_at.toISOString(),
      updated_at: bot.updated_at.toISOString(),
    }
  }

  static async findByUserId(userId: string): Promise<Bot[]> {
    const bots = await db.bot.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })

    return bots.map(bot => ({
      id: bot.id,
      user_id: bot.user_id,
      name: bot.name,
      description: bot.description || '',
      system_prompt: bot.system_prompt || '',
      model: bot.model,
      temperature: bot.temperature,
      max_tokens: bot.max_tokens,
      status: bot.status as 'draft' | 'active' | 'inactive',
      is_deployed: bot.is_deployed,
      deployment_url: bot.deployment_url || undefined,
      created_at: bot.created_at.toISOString(),
      updated_at: bot.updated_at.toISOString(),
    }))
  }

  static async findById(id: number): Promise<Bot | null> {
    const bot = await db.bot.findUnique({
      where: { id },
    })

    if (!bot) return null

    return {
      id: bot.id,
      user_id: bot.user_id,
      name: bot.name,
      description: bot.description || '',
      system_prompt: bot.system_prompt || '',
      model: bot.model,
      temperature: bot.temperature,
      max_tokens: bot.max_tokens,
      status: bot.status as 'draft' | 'active' | 'inactive',
      is_deployed: bot.is_deployed,
      deployment_url: bot.deployment_url || undefined,
      created_at: bot.created_at.toISOString(),
      updated_at: bot.updated_at.toISOString(),
    }
  }

  static async update(id: number, updates: Partial<Bot>): Promise<Bot | null> {
    const bot = await db.bot.update({
      where: { id },
      data: {
        name: updates.name,
        description: updates.description,
        system_prompt: updates.system_prompt,
        model: updates.model,
        temperature: updates.temperature,
        max_tokens: updates.max_tokens,
        status: updates.status,
        is_deployed: updates.is_deployed,
        deployment_url: updates.deployment_url,
      },
    })

    return {
      id: bot.id,
      user_id: bot.user_id,
      name: bot.name,
      description: bot.description || '',
      system_prompt: bot.system_prompt || '',
      model: bot.model,
      temperature: bot.temperature,
      max_tokens: bot.max_tokens,
      status: bot.status as 'draft' | 'active' | 'inactive',
      is_deployed: bot.is_deployed,
      deployment_url: bot.deployment_url || undefined,
      created_at: bot.created_at.toISOString(),
      updated_at: bot.updated_at.toISOString(),
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await db.bot.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }
}

// Knowledge Document operations (server-side only)
export class ServerKnowledgeDocumentService {
  static async create(botId: number, documentData: Partial<KnowledgeDocument>): Promise<KnowledgeDocument> {
    const doc = await db.knowledgeDocument.create({
      data: {
        bot_id: botId,
        title: documentData.title || 'Untitled Document',
        content: documentData.content || '',
        file_type: documentData.file_type || 'text',
        file_size: documentData.file_size || 0,
        status: documentData.status || 'processing',
      },
    })

    return {
      id: doc.id,
      bot_id: doc.bot_id,
      title: doc.title,
      content: doc.content,
      file_type: doc.file_type || 'text',
      file_size: doc.file_size || 0,
      status: doc.status as 'processing' | 'indexed' | 'error',
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    }
  }

  static async findByBotId(botId: number): Promise<KnowledgeDocument[]> {
    const docs = await db.knowledgeDocument.findMany({
      where: { bot_id: botId },
      orderBy: { created_at: 'desc' },
    })

    return docs.map(doc => ({
      id: doc.id,
      bot_id: doc.bot_id,
      title: doc.title,
      content: doc.content,
      file_type: doc.file_type || 'text',
      file_size: doc.file_size || 0,
      status: doc.status as 'processing' | 'indexed' | 'error',
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
    }))
  }
}

// Conversation operations (server-side only)
export class ServerConversationService {
  static async create(botId: number, userId: string, title?: string, isTest = false): Promise<Conversation> {
    const conversation = await db.conversation.create({
      data: {
        bot_id: botId,
        user_id: userId,
        title: title || 'New Conversation',
        is_test: isTest,
      },
    })

    return {
      id: conversation.id,
      bot_id: conversation.bot_id,
      user_id: conversation.user_id,
      title: conversation.title || 'New Conversation',
      is_test: conversation.is_test,
      created_at: conversation.created_at.toISOString(),
      updated_at: conversation.updated_at.toISOString(),
    }
  }

  static async findByUserId(userId: string): Promise<Conversation[]> {
    const conversations = await db.conversation.findMany({
      where: { user_id: userId },
      include: {
        bot: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    })

    return conversations.map(conv => ({
      id: conv.id,
      bot_id: conv.bot_id,
      user_id: conv.user_id,
      title: conv.title || 'New Conversation',
      is_test: conv.is_test,
      created_at: conv.created_at.toISOString(),
      updated_at: conv.updated_at.toISOString(),
    }))
  }

  static async findById(id: number): Promise<Conversation | null> {
    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    if (!conversation) return null

    return {
      id: conversation.id,
      bot_id: conversation.bot_id,
      user_id: conversation.user_id,
      title: conversation.title || 'New Conversation',
      is_test: conversation.is_test,
      created_at: conversation.created_at.toISOString(),
      updated_at: conversation.updated_at.toISOString(),
    }
  }
}

// Message operations (server-side only)
export class ServerMessageService {
  static async create(conversationId: number, role: 'user' | 'assistant' | 'system', content: string, tokensUsed?: number, responseTimeMs?: number) {
    const message = await db.message.create({
      data: {
        conversation_id: conversationId,
        role,
        content,
        tokens_used: tokensUsed,
        response_time_ms: responseTimeMs,
      },
    })

    return {
      id: message.id,
      conversation_id: message.conversation_id,
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content,
      tokens_used: message.tokens_used || undefined,
      response_time_ms: message.response_time_ms || undefined,
      created_at: message.created_at.toISOString(),
    }
  }

  static async findByConversationId(conversationId: number) {
    const messages = await db.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
    })

    return messages.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      tokens_used: msg.tokens_used || undefined,
      response_time_ms: msg.response_time_ms || undefined,
      created_at: msg.created_at.toISOString(),
    }))
  }
}

// Analytics operations (server-side only)
export class ServerAnalyticsService {
  static async getBotAnalytics(botId: number, days = 7): Promise<BotAnalytics[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const analytics = await db.botAnalytics.findMany({
      where: {
        bot_id: botId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    return analytics.map(analytics => ({
      id: analytics.id,
      bot_id: analytics.bot_id,
      date: analytics.date.toISOString().split('T')[0],
      total_conversations: analytics.total_conversations,
      total_messages: analytics.total_messages,
      total_tokens_used: analytics.total_tokens_used,
      avg_response_time_ms: analytics.avg_response_time_ms || 0,
      user_satisfaction_score: analytics.user_satisfaction_score || 0,
      created_at: analytics.created_at.toISOString(),
    }))
  }

  static async createOrUpdateAnalytics(botId: number, date: string, data: Partial<BotAnalytics>) {
    const targetDate = new Date(date)
    
    await db.botAnalytics.upsert({
      where: {
        bot_id_date: {
          bot_id: botId,
          date: targetDate,
        },
      },
      update: {
        total_conversations: data.total_conversations,
        total_messages: data.total_messages,
        total_tokens_used: data.total_tokens_used,
        avg_response_time_ms: data.avg_response_time_ms,
        user_satisfaction_score: data.user_satisfaction_score,
      },
      create: {
        bot_id: botId,
        date: targetDate,
        total_conversations: data.total_conversations || 0,
        total_messages: data.total_messages || 0,
        total_tokens_used: data.total_tokens_used || 0,
        avg_response_time_ms: data.avg_response_time_ms,
        user_satisfaction_score: data.user_satisfaction_score,
      },
    })
  }
}

import { db } from '../db'
import { ServerBotService, ServerUserService } from '../server-database'

export interface DashboardStats {
  totalUsers: number
  activeBots: number
  messagesToday: number
  successRate: number
}

export interface RecentBot {
  id: number
  name: string
  status: string
  messages: number
  accuracy: number
  created_at: string
}

export interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  lastActive: string
  created_at: string
}

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [
        totalUsers,
        activeBots,
        messagesToday,
        totalMessages,
        totalConversations
      ] = await Promise.all([
        // Total users
        db.user.count({
          where: { is_active: true }
        }),
        // Active bots
        db.bot.count({
          where: { 
            status: 'active',
            is_deployed: true
          }
        }),
        // Messages today
        db.message.count({
          where: {
            created_at: {
              gte: today,
              lt: tomorrow
            }
          }
        }),
        // Total messages for success rate calculation
        db.message.count(),
        // Total conversations for success rate calculation
        db.conversation.count()
      ])

      // Calculate success rate (simplified: messages per conversation ratio)
      const successRate = totalConversations > 0 ? 
        Math.min(100, (totalMessages / totalConversations) * 10) : 0

      return {
        totalUsers,
        activeBots,
        messagesToday,
        successRate: Math.round(successRate * 10) / 10
      }
    } catch (error) {
      console.error('DashboardService.getDashboardStats error:', error)
      throw error
    }
  }

  /**
   * Get recent bots
   */
  static async getRecentBots(limit: number = 4): Promise<RecentBot[]> {
    try {
      const bots = await db.bot.findMany({
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              conversations: true
            }
          }
        }
      })

      return bots.map(bot => ({
        id: bot.id,
        name: bot.name,
        status: bot.status,
        messages: bot._count.conversations * 10, // Mock calculation
        accuracy: Math.floor(Math.random() * 10) + 90, // Mock accuracy
        created_at: bot.created_at.toISOString()
      }))
    } catch (error) {
      console.error('DashboardService.getRecentBots error:', error)
      throw error
    }
  }

  /**
   * Get recent users
   */
  static async getRecentUsers(limit: number = 4): Promise<RecentUser[]> {
    try {
      const users = await ServerUserService.findAll()
      
      // Take only the most recent users based on limit
      const recentUsers = users.slice(0, limit)

      return recentUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === 'admin' ? 'Admin' : 'User',
        lastActive: this.getTimeAgo(new Date(user.created_at)),
        created_at: user.created_at
      }))
    } catch (error) {
      console.error('DashboardService.getRecentUsers error:', error)
      throw error
    }
  }

  /**
   * Get time ago string
   */
  private static getTimeAgo(date: Date): string {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }
}

import { NextRequest } from 'next/server'
import { DashboardService } from '../services/dashboard.service'
import { ApiResponse } from '../utils/api-response'

export class DashboardController {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(request: NextRequest) {
    try {
      const stats = await DashboardService.getDashboardStats()
      return ApiResponse.success('Dashboard statistics retrieved successfully', stats)
    } catch (error) {
      console.error('DashboardController.getDashboardStats error:', error)
      return ApiResponse.internalServerError('Failed to retrieve dashboard statistics')
    }
  }

  /**
   * Get recent bots
   */
  static async getRecentBots(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '4')
      
      const bots = await DashboardService.getRecentBots(limit)
      return ApiResponse.success('Recent bots retrieved successfully', bots)
    } catch (error) {
      console.error('DashboardController.getRecentBots error:', error)
      return ApiResponse.internalServerError('Failed to retrieve recent bots')
    }
  }

  /**
   * Get recent users
   */
  static async getRecentUsers(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '4')
      
      const users = await DashboardService.getRecentUsers(limit)
      return ApiResponse.success('Recent users retrieved successfully', users)
    } catch (error) {
      console.error('DashboardController.getRecentUsers error:', error)
      return ApiResponse.internalServerError('Failed to retrieve recent users')
    }
  }
}

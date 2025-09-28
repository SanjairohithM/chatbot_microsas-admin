"use client"

import { useState, useEffect, useRef } from 'react'
import { DashboardStats, RecentBot, RecentUser } from '@/lib/types'

interface UseDashboardReturn {
  stats: DashboardStats | null
  recentBots: RecentBot[]
  recentUsers: RecentUser[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBots, setRecentBots] = useState<RecentBot[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchDashboardData = async () => {
    if (hasFetched.current) return // Prevent duplicate calls
    hasFetched.current = true
    try {
      setLoading(true)
      setError(null)

      const [statsResponse, botsResponse, usersResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-bots'),
        fetch('/api/dashboard/recent-users')
      ])

      if (!statsResponse.ok || !botsResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [statsData, botsData, usersData] = await Promise.all([
        statsResponse.json(),
        botsResponse.json(),
        usersResponse.json()
      ])

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (botsData.success) {
        setRecentBots(botsData.data)
      }

      if (usersData.success) {
        setRecentUsers(usersData.data)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const refetch = () => {
    hasFetched.current = false
    return fetchDashboardData()
  }

  return {
    stats,
    recentBots,
    recentUsers,
    loading,
    error,
    refetch
  }
}

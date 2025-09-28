import { NextRequest } from 'next/server'
import { DashboardController } from '@/lib/controllers/dashboard.controller'

export async function GET(request: NextRequest) {
  return DashboardController.getDashboardStats(request)
}

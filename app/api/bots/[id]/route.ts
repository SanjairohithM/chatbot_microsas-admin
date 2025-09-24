import { NextRequest } from 'next/server'
import { BotController } from '@/lib/controllers/bot.controller'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BotController.getBotById(request, { params })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BotController.updateBot(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BotController.deleteBot(request, { params })
}

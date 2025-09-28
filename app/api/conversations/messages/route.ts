import { NextRequest } from 'next/server'
import { ConversationController } from '@/lib/controllers/conversation.controller'

export async function POST(request: NextRequest) {
  return ConversationController.createMessage(request)
}

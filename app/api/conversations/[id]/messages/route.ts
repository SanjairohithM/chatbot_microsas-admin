import { NextRequest } from 'next/server'
import { ConversationController } from '@/lib/controllers/conversation.controller'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ConversationController.getMessagesByConversationId(request, { params })
}
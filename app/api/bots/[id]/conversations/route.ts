import { NextRequest } from 'next/server'
import { ConversationController } from '@/lib/controllers/conversation.controller'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Add botId to the URL params for the controller
  const url = new URL(request.url)
  url.searchParams.set('botId', params.id)
  
  const modifiedRequest = new NextRequest(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })
  
  return ConversationController.getConversationsByBotId(modifiedRequest)
}

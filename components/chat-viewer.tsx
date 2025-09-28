"use client"

import { useEffect } from 'react'
import { Message } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMessages } from '@/hooks/use-conversations'
import {
  Bot,
  User,
  Settings,
  Clock,
  Hash,
  MessageSquare,
  X,
} from 'lucide-react'

interface ChatViewerProps {
  conversationId: number | null
  conversationTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatViewer({ conversationId, conversationTitle, open, onOpenChange }: ChatViewerProps) {
  const { messages, loading, error } = useMessages(conversationId || undefined)

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-4 h-4" />
      case 'assistant':
        return <Bot className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'user':
        return 'default'
      case 'assistant':
        return 'secondary'
      case 'system':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return Object.entries(groups).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
  }

  if (!conversationId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {conversationTitle || `Conversation #${conversationId}`}
              </DialogTitle>
              <DialogDescription>
                View conversation messages and details
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-destructive">Error loading messages</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No messages in this conversation</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {groupMessagesByDate(messages).map(([date, dayMessages]) => (
                  <div key={date} className="space-y-4">
                    {/* Date Separator */}
                    <div className="flex items-center gap-4">
                      <Separator className="flex-1" />
                      <Badge variant="outline" className="text-xs">
                        {formatDate(date)}
                      </Badge>
                      <Separator className="flex-1" />
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-4">
                      {dayMessages.map((message) => (
                        <Card key={message.id} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={getRoleBadgeVariant(message.role)} className="text-xs">
                                  {getRoleIcon(message.role)}
                                  <span className="ml-1 capitalize">{message.role}</span>
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  #{message.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(message.created_at)}
                                </div>
                                {message.tokens_used && (
                                  <div className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {message.tokens_used} tokens
                                  </div>
                                )}
                                {message.response_time_ms && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {message.response_time_ms}ms
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                            </div>
                            
                            {message.image_url && (
                              <div className="mt-3">
                                <img 
                                  src={message.image_url} 
                                  alt="Message attachment" 
                                  className="max-w-xs rounded-lg border"
                                />
                                {message.image_analysis && (
                                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                                    <strong>Image Analysis:</strong> {message.image_analysis}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer with stats */}
        {messages.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
              <div className="flex gap-4">
                {messages.some(m => m.tokens_used) && (
                  <span>
                    Total tokens: {messages.reduce((sum, m) => sum + (m.tokens_used || 0), 0)}
                  </span>
                )}
                {messages.some(m => m.response_time_ms) && (
                  <span>
                    Avg response: {Math.round(
                      messages
                        .filter(m => m.response_time_ms)
                        .reduce((sum, m) => sum + (m.response_time_ms || 0), 0) /
                      messages.filter(m => m.response_time_ms).length
                    )}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

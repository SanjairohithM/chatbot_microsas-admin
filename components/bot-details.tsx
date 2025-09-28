"use client"

import { useState } from 'react'
import { Bot, Conversation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ConversationList } from '@/components/conversation-list'
import { ChatViewer } from '@/components/chat-viewer'
import { useConversations } from '@/hooks/use-conversations'
import {
  Globe,
  Calendar,
  Cpu,
  Thermometer,
  Hash,
  Edit,
  Play,
  Pause,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'

interface BotDetailsProps {
  bot: Bot | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (bot: Bot) => void
  onDeploy?: (botId: number) => Promise<void>
  onUndeploy?: (botId: number) => Promise<void>
}

export function BotDetails({
  bot,
  open,
  onOpenChange,
  onEdit,
  onDeploy,
  onUndeploy,
}: BotDetailsProps) {
  const [chatViewerOpen, setChatViewerOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  
  // Get conversations for this bot
  const { 
    conversations, 
    loading: conversationsLoading, 
    deleteConversation 
  } = useConversations(bot?.id)

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setChatViewerOpen(true)
  }

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await deleteConversation(conversationId)
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  if (!bot) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'draft': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{bot.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {bot.description || 'No description provided'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(bot.status)}>
                {bot.status}
              </Badge>
              {bot.is_deployed && (
                <Badge variant="default">
                  <Globe className="w-3 h-3 mr-1" />
                  Deployed
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="conversations">
              <MessageSquare className="w-4 h-4 mr-1" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(bot.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(bot.updated_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">AI Model</p>
                      <p className="text-sm text-muted-foreground">{bot.model}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Temperature</p>
                      <p className="text-sm text-muted-foreground">{bot.temperature}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Max Tokens</p>
                      <p className="text-sm text-muted-foreground">{bot.max_tokens}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Prompt</CardTitle>
                <CardDescription>
                  The instructions that define your bot's behavior and personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bot.system_prompt ? (
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {bot.system_prompt}
                    </pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No system prompt configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <ConversationList
              conversations={conversations}
              loading={conversationsLoading}
              onView={handleViewConversation}
              onDelete={handleDeleteConversation}
              title={`Conversations for ${bot.name}`}
              description="Chat history and conversations for this bot"
            />
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Model Configuration</CardTitle>
                <CardDescription>
                  Technical settings that control how your bot processes and generates responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">AI Model</h4>
                    <p className="text-sm text-muted-foreground mb-1">{bot.model}</p>
                    <p className="text-xs text-muted-foreground">
                      The underlying AI model powering your bot
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <Badge variant={getStatusBadgeVariant(bot.status)}>
                      {bot.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current operational status
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Temperature</h4>
                    <p className="text-sm text-muted-foreground mb-1">{bot.temperature}</p>
                    <p className="text-xs text-muted-foreground">
                      Controls response creativity (0.0 = focused, 2.0 = creative)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Max Tokens</h4>
                    <p className="text-sm text-muted-foreground mb-1">{bot.max_tokens}</p>
                    <p className="text-xs text-muted-foreground">
                      Maximum length of bot responses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deployment Status</CardTitle>
                <CardDescription>
                  Manage how your bot is deployed and accessible to users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {bot.is_deployed ? 'Bot is Deployed' : 'Bot is Not Deployed'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bot.is_deployed 
                          ? 'Your bot is live and accessible to users'
                          : 'Your bot is not currently accessible to users'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {bot.is_deployed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUndeploy?.(bot.id)}
                        disabled={!onUndeploy}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Undeploy
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onDeploy?.(bot.id)}
                        disabled={!onDeploy}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Deploy
                      </Button>
                    )}
                  </div>
                </div>

                {bot.deployment_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Deployment URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm">
                          {bot.deployment_url}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(bot.deployment_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onEdit(bot)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Bot
          </Button>
        </div>
      </DialogContent>

      {/* Chat Viewer Dialog */}
      <ChatViewer
        conversationId={selectedConversation?.id || null}
        conversationTitle={selectedConversation?.title}
        open={chatViewerOpen}
        onOpenChange={setChatViewerOpen}
      />
    </Dialog>
  )
}

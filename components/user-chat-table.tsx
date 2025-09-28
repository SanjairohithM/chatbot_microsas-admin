"use client"

import { useState, useMemo } from 'react'
import { Conversation, User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConversations } from '@/hooks/use-conversations'
import { useBots } from '@/hooks/use-bots'
import { ChatViewer } from '@/components/chat-viewer'
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Bot,
  Calendar,
  Clock,
  TestTube,
  Filter,
  User as UserIcon,
} from 'lucide-react'

interface UserChatTableProps {
  user: User
  onClose?: () => void
}

export function UserChatTable({ user, onClose }: UserChatTableProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [chatViewerOpen, setChatViewerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [botFilter, setBotFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  // Get all conversations for this user
  const { conversations, loading, deleteConversation } = useConversations()
  const { bots } = useBots()

  // Filter conversations for this specific user
  const userConversations = useMemo(() => {
    return conversations.filter(conv => conv.user_id === user.id)
  }, [conversations, user.id])

  // Apply additional filters
  const filteredConversations = useMemo(() => {
    return userConversations.filter(conversation => {
      const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBot = botFilter === 'all' || conversation.bot_id.toString() === botFilter
      const matchesType = typeFilter === 'all' || 
                         (typeFilter === 'test' && conversation.is_test) ||
                         (typeFilter === 'live' && !conversation.is_test)
      
      return matchesSearch && matchesBot && matchesType
    })
  }, [userConversations, searchTerm, botFilter, typeFilter])

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

  const getBotName = (botId: number) => {
    const bot = bots.find(b => b.id === botId)
    return bot ? bot.name : `Bot #${botId}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 7) {
      return formatDate(dateString)
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    } else {
      return 'Just now'
    }
  }

  // Get user's bots for filtering
  const userBots = useMemo(() => {
    const botIds = new Set(userConversations.map(conv => conv.bot_id))
    return bots.filter(bot => botIds.has(bot.id))
  }, [userConversations, bots])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalConversations = userConversations.length
    const testConversations = userConversations.filter(c => c.is_test).length
    const liveConversations = userConversations.filter(c => !c.is_test).length
    const activeBots = new Set(userConversations.map(c => c.bot_id)).size
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayConversations = userConversations.filter(c => 
      new Date(c.created_at) >= today
    ).length

    return {
      totalConversations,
      testConversations,
      liveConversations,
      activeBots,
      todayConversations
    }
  }, [userConversations])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chats</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Chats</p>
                <p className="text-2xl font-bold">{stats.liveConversations}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Test Chats</p>
                <p className="text-2xl font-bold">{stats.testConversations}</p>
              </div>
              <TestTube className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
                <p className="text-2xl font-bold">{stats.activeBots}</p>
              </div>
              <Bot className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Conversations</CardTitle>
          <CardDescription>Find specific conversations for {user.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={botFilter} onValueChange={setBotFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by bot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bots</SelectItem>
                {userBots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id.toString()}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="live">Live Chats</SelectItem>
                <SelectItem value="test">Test Chats</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(searchTerm || botFilter !== 'all' || typeFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {filteredConversations.length} of {userConversations.length} conversations
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setBotFilter('all')
                  setTypeFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>All chat conversations for {user.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm || botFilter !== 'all' || typeFilter !== 'all'
                  ? 'No conversations match your filters'
                  : 'No conversations found for this user'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conversation</TableHead>
                    <TableHead>Bot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conversation) => (
                    <TableRow key={conversation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{conversation.title}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {conversation.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{getBotName(conversation.bot_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conversation.is_test ? "secondary" : "default"} className="text-xs">
                          {conversation.is_test ? (
                            <>
                              <TestTube className="w-3 h-3 mr-1" />
                              Test
                            </>
                          ) : (
                            'Live'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conversation.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDateRelative(conversation.updated_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewConversation(conversation)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Messages
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{conversation.title}"? 
                                    This action cannot be undone and all messages will be permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteConversation(conversation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Conversation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Viewer Dialog */}
      <ChatViewer
        conversationId={selectedConversation?.id || null}
        conversationTitle={selectedConversation?.title}
        open={chatViewerOpen}
        onOpenChange={setChatViewerOpen}
      />
    </div>
  )
}

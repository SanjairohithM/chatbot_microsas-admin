"use client"

import { useState, useMemo } from 'react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { ConversationList } from "@/components/conversation-list"
import { ChatViewer } from "@/components/chat-viewer"
import { useConversations } from "@/hooks/use-conversations"
import { useBots } from "@/hooks/use-bots"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Conversation } from "@/lib/types"
import {
  MessageSquare,
  Bot,
  Users,
  Clock,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
} from "lucide-react"

export default function ChatsPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [chatViewerOpen, setChatViewerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBotFilter, setSelectedBotFilter] = useState<string>('all')
  const [conversationTypeFilter, setConversationTypeFilter] = useState<string>('all')
  
  const { user } = useAuth()
  const { conversations, loading: conversationsLoading, deleteConversation } = useConversations()
  const { bots, loading: botsLoading } = useBots()

  // Filter conversations based on search and filters
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBot = selectedBotFilter === 'all' || conversation.bot_id.toString() === selectedBotFilter
      const matchesType = conversationTypeFilter === 'all' || 
                         (conversationTypeFilter === 'test' && conversation.is_test) ||
                         (conversationTypeFilter === 'live' && !conversation.is_test)
      
      return matchesSearch && matchesBot && matchesType
    })
  }, [conversations, searchTerm, selectedBotFilter, conversationTypeFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalConversations = conversations.length
    const testConversations = conversations.filter(c => c.is_test).length
    const liveConversations = conversations.filter(c => !c.is_test).length
    const activeBots = new Set(conversations.map(c => c.bot_id)).size
    
    // Calculate conversations from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayConversations = conversations.filter(c => 
      new Date(c.created_at) >= today
    ).length

    return {
      totalConversations,
      testConversations,
      liveConversations,
      activeBots,
      todayConversations
    }
  }, [conversations])

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Chat Management</h2>
          <p className="text-muted-foreground">View and manage all chat conversations across your bots</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">All Conversations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {conversationsLoading ? "..." : stats.totalConversations}
                      </p>
                      <p className="text-xs text-muted-foreground">Across all bots</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {conversationsLoading ? "..." : stats.activeBots}
                      </p>
                      <p className="text-xs text-muted-foreground">With conversations</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Chats</p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {conversationsLoading ? "..." : stats.todayConversations}
                      </p>
                      <p className="text-xs text-green-500">New conversations</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Live Chats</p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {conversationsLoading ? "..." : stats.liveConversations}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.testConversations} test chats
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Latest chat activity across all your bots</CardDescription>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Conversations will appear here when users interact with your bots
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.slice(0, 5).map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleViewConversation(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{conversation.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {getBotName(conversation.bot_id)} • {new Date(conversation.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={conversation.is_test ? "secondary" : "default"}>
                            {conversation.is_test ? 'Test' : 'Live'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    {conversations.length > 5 && (
                      <div className="text-center pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            const tab = document.querySelector('[value="conversations"]') as HTMLElement
                            tab?.click()
                          }}
                        >
                          View All Conversations ({conversations.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Conversations</CardTitle>
                <CardDescription>Find specific conversations using filters and search</CardDescription>
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
                  <Select value={selectedBotFilter} onValueChange={setSelectedBotFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by bot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bots</SelectItem>
                      {bots.map((bot) => (
                        <SelectItem key={bot.id} value={bot.id.toString()}>
                          {bot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={conversationTypeFilter} onValueChange={setConversationTypeFilter}>
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
                
                {(searchTerm || selectedBotFilter !== 'all' || conversationTypeFilter !== 'all') && (
                  <div className="flex items-center gap-2 mt-4">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredConversations.length} of {conversations.length} conversations
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedBotFilter('all')
                        setConversationTypeFilter('all')
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Conversation List */}
            <div className="space-y-4">
              {filteredConversations.map((conversation) => (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-card-foreground">{conversation.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getBotName(conversation.bot_id)}
                            </Badge>
                            <Badge variant={conversation.is_test ? "secondary" : "default"} className="text-xs">
                              {conversation.is_test ? 'Test' : 'Live'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ID: {conversation.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Created: {new Date(conversation.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Updated: {new Date(conversation.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewConversation(conversation)}
                        >
                          View Messages
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConversation(conversation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredConversations.length === 0 && !conversationsLoading && (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || selectedBotFilter !== 'all' || conversationTypeFilter !== 'all'
                        ? 'No conversations match your filters'
                        : 'No conversations found'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Chat Analytics
                </CardTitle>
                <CardDescription>Detailed insights into your chat performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Conversation Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Live Conversations</span>
                        <span className="text-sm font-medium">{stats.liveConversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Test Conversations</span>
                        <span className="text-sm font-medium">{stats.testConversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Conversations</span>
                        <span className="text-sm font-medium">{stats.totalConversations}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Bot Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Bots</span>
                        <span className="text-sm font-medium">{stats.activeBots}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Bots</span>
                        <span className="text-sm font-medium">{bots.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Usage Rate</span>
                        <span className="text-sm font-medium">
                          {bots.length > 0 ? Math.round((stats.activeBots / bots.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chat Viewer Dialog */}
        <ChatViewer
          conversationId={selectedConversation?.id || null}
          conversationTitle={selectedConversation?.title}
          open={chatViewerOpen}
          onOpenChange={setChatViewerOpen}
        />
      </div>
    </DashboardLayout>
  )
}

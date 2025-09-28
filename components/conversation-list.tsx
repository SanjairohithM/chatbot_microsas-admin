"use client"

import { useState } from 'react'
import { Conversation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  MessageSquare,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  TestTube,
} from 'lucide-react'

interface ConversationListProps {
  conversations: Conversation[]
  loading: boolean
  onView?: (conversation: Conversation) => void
  onEdit?: (conversation: Conversation) => void
  onDelete?: (conversationId: number) => Promise<void>
  onCreate?: () => void
  showBotName?: boolean
  title?: string
  description?: string
}

export function ConversationList({
  conversations,
  loading,
  onView,
  onEdit,
  onDelete,
  onCreate,
  showBotName = false,
  title = "Conversations",
  description = "Chat history and conversations"
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(search.toLowerCase())
  )

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conversation</TableHead>
                {showBotName && <TableHead>Bot</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showBotName ? 6 : 5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {search 
                          ? 'No conversations match your search'
                          : 'No conversations yet'}
                      </p>
                      {!search && onCreate && (
                        <Button onClick={onCreate} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Start First Conversation
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConversations.map((conversation) => (
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
                    {showBotName && (
                      <TableCell>
                        <span className="text-sm">Bot #{conversation.bot_id}</span>
                      </TableCell>
                    )}
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(conversation.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateRelative(conversation.updated_at)}
                      </span>
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
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(conversation)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Messages
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(conversation)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Title
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
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
                                      onClick={() => onDelete(conversation.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete Conversation
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

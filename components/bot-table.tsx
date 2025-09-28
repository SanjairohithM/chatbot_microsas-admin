"use client"

import { useState } from 'react'
import { Bot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Bot as BotIcon,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Globe,
  Settings,
  BarChart3,
} from 'lucide-react'

interface BotTableProps {
  bots: Bot[]
  loading: boolean
  onEdit: (bot: Bot) => void
  onDelete: (botId: number) => Promise<void>
  onView: (bot: Bot) => void
  onCreate: () => void
  onDeploy?: (botId: number) => Promise<void>
  onUndeploy?: (botId: number) => Promise<void>
}

export function BotTable({
  bots,
  loading,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onDeploy,
  onUndeploy,
}: BotTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deploymentFilter, setDeploymentFilter] = useState<string>('all')

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(search.toLowerCase()) ||
                         bot.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bot.status === statusFilter
    const matchesDeployment = deploymentFilter === 'all' ||
                             (deploymentFilter === 'deployed' && bot.is_deployed) ||
                             (deploymentFilter === 'not-deployed' && !bot.is_deployed)
    
    return matchesSearch && matchesStatus && matchesDeployment
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'draft': return 'outline'
      default: return 'outline'
    }
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading bots...</p>
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
            <CardTitle>Your Bots</CardTitle>
            <CardDescription>Manage and monitor your AI chatbots</CardDescription>
          </div>
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Bot
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search bots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deploymentFilter} onValueChange={setDeploymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by deployment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bots</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="not-deployed">Not Deployed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <BotIcon className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {search || statusFilter !== 'all' || deploymentFilter !== 'all'
                          ? 'No bots match your filters'
                          : 'No bots created yet'}
                      </p>
                      {!search && statusFilter === 'all' && deploymentFilter === 'all' && (
                        <Button onClick={onCreate} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Bot
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBots.map((bot) => (
                  <TableRow key={bot.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bot.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {bot.description || 'No description'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(bot.status)}>
                        {bot.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{bot.model}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bot.is_deployed ? (
                          <>
                            <Badge variant="default" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Deployed
                            </Badge>
                            {bot.deployment_url && (
                              <a
                                href={bot.deployment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                View
                              </a>
                            )}
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not Deployed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(bot.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(bot.updated_at)}
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
                          <DropdownMenuItem onClick={() => onView(bot)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(bot)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Bot
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {bot.is_deployed ? (
                            <DropdownMenuItem
                              onClick={() => onUndeploy?.(bot.id)}
                              disabled={!onUndeploy}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Undeploy
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onDeploy?.(bot.id)}
                              disabled={!onDeploy}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Deploy
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Bot
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Bot</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{bot.name}"? This action cannot be undone.
                                  All conversations and data associated with this bot will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(bot.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Bot
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

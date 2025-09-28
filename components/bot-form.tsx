"use client"

import { useState, useEffect } from 'react'
import { Bot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface BotFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bot?: Bot | null
  onSubmit: (botData: any) => Promise<void>
  mode: 'create' | 'edit'
}

export function BotForm({ open, onOpenChange, bot, onSubmit, mode }: BotFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    model: 'gpt-4o-mini',
    temperature: [0.7],
    max_tokens: [1000],
    status: 'draft' as const,
    is_deployed: false,
    deployment_url: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bot && mode === 'edit') {
      setFormData({
        name: bot.name,
        description: bot.description,
        system_prompt: bot.system_prompt,
        model: bot.model,
        temperature: [bot.temperature],
        max_tokens: [bot.max_tokens],
        status: bot.status,
        is_deployed: bot.is_deployed,
        deployment_url: bot.deployment_url || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        model: 'gpt-4o-mini',
        temperature: [0.7],
        max_tokens: [1000],
        status: 'draft',
        is_deployed: false,
        deployment_url: '',
      })
    }
  }, [bot, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        system_prompt: formData.system_prompt,
        model: formData.model,
        temperature: formData.temperature[0],
        max_tokens: formData.max_tokens[0],
        status: formData.status,
        is_deployed: formData.is_deployed,
        deployment_url: formData.deployment_url || undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting bot form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Bot' : 'Edit Bot'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configure your new AI chatbot with custom settings and behavior.'
              : 'Update your bot configuration and settings.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Set up the basic details for your bot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bot Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter bot name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your bot does"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Behavior Configuration</CardTitle>
                  <CardDescription>Configure how your bot behaves and responds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="system_prompt">System Prompt</Label>
                    <Textarea
                      id="system_prompt"
                      value={formData.system_prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                      placeholder="Enter system instructions for your bot..."
                      rows={6}
                      className="min-h-[150px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Define your bot's personality, role, and behavior instructions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4 Mini</SelectItem>
                        <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                        <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Temperature: {formData.temperature[0]}</Label>
                    <Slider
                      value={formData.temperature}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, temperature: value }))}
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Controls randomness. Higher values make responses more creative, lower values more focused.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Max Tokens: {formData.max_tokens[0]}</Label>
                    <Slider
                      value={formData.max_tokens}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, max_tokens: value }))}
                      max={4000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum length of bot responses. Higher values allow longer responses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deployment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Settings</CardTitle>
                  <CardDescription>Configure how your bot is deployed and accessed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_deployed"
                      checked={formData.is_deployed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_deployed: checked }))}
                    />
                    <Label htmlFor="is_deployed">Deploy Bot</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable this to make your bot accessible to users
                  </p>

                  {formData.is_deployed && (
                    <div className="space-y-2">
                      <Label htmlFor="deployment_url">Deployment URL</Label>
                      <Input
                        id="deployment_url"
                        value={formData.deployment_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, deployment_url: e.target.value }))}
                        placeholder="https://your-bot-url.com"
                        type="url"
                      />
                      <p className="text-sm text-muted-foreground">
                        Custom URL where your bot will be accessible
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Bot' : 'Update Bot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

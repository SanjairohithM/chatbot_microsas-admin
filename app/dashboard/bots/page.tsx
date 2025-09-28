"use client"

import { useState } from 'react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { BotTable } from "@/components/bot-table"
import { BotForm } from "@/components/bot-form"
import { BotDetails } from "@/components/bot-details"
import { useBots } from "@/hooks/use-bots"
import { Bot } from "@/lib/types"

export default function BotsPage() {
  const [botFormOpen, setBotFormOpen] = useState(false)
  const [botDetailsOpen, setBotDetailsOpen] = useState(false)
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  
  const { 
    bots, 
    loading, 
    createBot, 
    updateBot, 
    deleteBot, 
    deployBot, 
    undeployBot 
  } = useBots()

  const handleCreateBot = () => {
    setFormMode("create")
    setSelectedBot(null)
    setBotFormOpen(true)
  }

  const handleEditBot = (bot: Bot) => {
    setFormMode("edit")
    setSelectedBot(bot)
    setBotFormOpen(true)
  }

  const handleViewBot = (bot: Bot) => {
    setSelectedBot(bot)
    setBotDetailsOpen(true)
  }

  const handleDeleteBot = async (botId: number) => {
    try {
      await deleteBot(botId)
    } catch (error) {
      console.error("Failed to delete bot:", error)
    }
  }

  const handleBotSubmit = async (botData: any) => {
    try {
      if (formMode === "create") {
        await createBot(botData)
      } else if (selectedBot) {
        await updateBot(selectedBot.id, botData)
      }
    } catch (error) {
      console.error("Failed to submit bot form:", error)
      throw error
    }
  }

  const handleDeployBot = async (botId: number) => {
    try {
      await deployBot(botId)
    } catch (error) {
      console.error("Failed to deploy bot:", error)
    }
  }

  const handleUndeployBot = async (botId: number) => {
    try {
      await undeployBot(botId)
    } catch (error) {
      console.error("Failed to undeploy bot:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Bot Management</h2>
          <p className="text-muted-foreground">Create, configure, and deploy AI chatbots</p>
        </div>
        
        <BotTable
          bots={bots}
          loading={loading}
          onEdit={handleEditBot}
          onDelete={handleDeleteBot}
          onView={handleViewBot}
          onCreate={handleCreateBot}
          onDeploy={handleDeployBot}
          onUndeploy={handleUndeployBot}
        />

        {/* Bot Form Dialog */}
        <BotForm
          open={botFormOpen}
          onOpenChange={setBotFormOpen}
          bot={selectedBot}
          onSubmit={handleBotSubmit}
          mode={formMode}
        />

        {/* Bot Details Dialog */}
        <BotDetails
          bot={selectedBot}
          open={botDetailsOpen}
          onOpenChange={setBotDetailsOpen}
          onEdit={handleEditBot}
          onDeploy={handleDeployBot}
          onUndeploy={handleUndeployBot}
        />
      </div>
    </DashboardLayout>
  )
}
